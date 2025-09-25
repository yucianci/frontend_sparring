import { AnalysisResult, ChecklistItem, FlightMetadata, Organization } from '../types';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/build/pdf';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url';
import { GoogleGenerativeAI } from '@google/generative-ai';

GlobalWorkerOptions.workerSrc = pdfjsWorker;

const GEMINI_API_KEY = 'AIzaSyD2S5nbT2i4S87telNIDeukQT-_ZoYRUSU';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

function sanitizeJsonResponse(responseText: string): string {
  return responseText
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
}

function normalizeChecklistItems(rawChecklists: unknown): ChecklistItem[] {
  if (!rawChecklists) {
    return [];
  }

  const toChecklistItem = (value: unknown): ChecklistItem | null => {
    if (typeof value === 'string' && value.trim()) {
      return { [value.trim()]: true };
    }

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const checklistItem: ChecklistItem = {};
      Object.entries(value as Record<string, unknown>).forEach(([key, rawValue]) => {
        const sanitizedKey = key.trim();
        if (sanitizedKey) {
          checklistItem[sanitizedKey] = Boolean(rawValue);
        }
      });

      return Object.keys(checklistItem).length > 0 ? checklistItem : null;
    }

    return null;
  };

  if (Array.isArray(rawChecklists)) {
    return rawChecklists
      .map(toChecklistItem)
      .filter((item): item is ChecklistItem => Boolean(item));
  }

  const singleItem = toChecklistItem(rawChecklists);
  return singleItem ? [singleItem] : [];
}

function normalizePatterns(rawPatterns: unknown): AnalysisResult['patterns'] {
  if (!Array.isArray(rawPatterns)) {
    return [];
  }

  return rawPatterns
    .filter((pattern): pattern is Record<string, unknown> => Boolean(pattern) && typeof pattern === 'object')
    .map((pattern) => {
      const title =
        typeof pattern.title === 'string' && pattern.title.trim()
          ? pattern.title.trim()
          : 'Padrão Identificado';
      const feedback =
        typeof pattern.feedback === 'string' && pattern.feedback.trim()
          ? pattern.feedback.trim()
          : 'Feedback não fornecido.';

      return {
        title,
        feedback,
        checklists: normalizeChecklistItems(pattern.checklists)
      };
    })
    .filter((pattern) => Boolean(pattern.title));
}

function tryParseJson(text: string): unknown | null {
  try {
    return JSON.parse(text);
  } catch (error) {
    console.debug('Falha ao fazer parse direto do texto como JSON:', error);
    return null;
  }
}

function extractJsonPayload(text: string): Record<string, unknown> | null {
  const trimmed = text.trim();
  const directParse = tryParseJson(trimmed);
  if (directParse && typeof directParse === 'object' && !Array.isArray(directParse)) {
    return directParse as Record<string, unknown>;
  }

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const potentialJson = trimmed.slice(firstBrace, lastBrace + 1);
    const parsed = tryParseJson(potentialJson);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  }

  return null;
}

function extractFlightMetadata(extractedText: string): FlightMetadata {
  const metadata: FlightMetadata = {};
  const jsonPayload = extractJsonPayload(extractedText);

  if (!jsonPayload) {
    return metadata;
  }

  if (typeof jsonPayload.company === 'string') {
    metadata.company = jsonPayload.company.trim();
  }

  if (typeof jsonPayload.flightNumber === 'string') {
    metadata.flightNumber = jsonPayload.flightNumber.trim();
  }

  if (typeof jsonPayload.aircraft === 'string') {
    metadata.aircraft = jsonPayload.aircraft.trim();
  }

  if (typeof jsonPayload.pilot === 'string') {
    metadata.pilot = jsonPayload.pilot.trim();
  }

  if (typeof jsonPayload.copilot === 'string') {
    metadata.copilot = jsonPayload.copilot.trim();
  }

  if (jsonPayload.flightDetails && typeof jsonPayload.flightDetails === 'object') {
    const details = jsonPayload.flightDetails as Record<string, unknown>;
    metadata.flightDetails = {
      route: typeof details.route === 'string' ? details.route.trim() : undefined,
      date: typeof details.date === 'string' ? details.date.trim() : undefined,
      duration: typeof details.duration === 'string' ? details.duration.trim() : undefined,
      weather: typeof details.weather === 'string' ? details.weather.trim() : undefined
    };
  }

  return metadata;
}

async function generateGeminiAnalysis(
  extractedText: string,
  prompt: string,
  organization: Organization,
  transcriptId: string,
  pilotIdFallback: string
): Promise<AnalysisResult | null> {
  if (!extractedText.trim()) {
    return null;
  }

  const organizationId = organization.id;
  const checklistEntries = Object.entries(organization.securityObs ?? {});

  const checklistInstructions = checklistEntries.length
    ? checklistEntries
        .map(([patternName, checklistItems]) => {
          const sanitizedPattern = patternName.trim();
          const itemsList = checklistItems
            .map((item) => item.trim())
            .filter((item) => item.length > 0)
            .map((item) => `- ${item}`)
            .join('\n');

          return [`Padrão: ${sanitizedPattern}`, itemsList].filter(Boolean).join('\n');
        })
        .join('\n\n')
    : '';

  const systemPrompt = [
    'Você é um analista especializado em aviação e CRM. Utilize o prompt fornecido pela organização e o transcript extraído para produzir insights estruturados.',
    'Responda SOMENTE com um JSON válido (sem comentários ou textos adicionais) seguindo exatamente o formato abaixo:',
    '{',
    `  "transcriptId": "${transcriptId}",`,
    `  "organizationId": "${organizationId}",`,
    '  "pilotId": "<ID do piloto (ex: PILOT_123)>",',
    '  "patterns": [',
    '    {',
    '      "title": "<Título do padrão identificado>",',
    '      "feedback": "<Feedback detalhado sobre o padrão>",',
    '      "checklists": [',
    '        { "<Nome do item de checklist>": true | false }',
    '      ]',
    '    }',
    '  ]',
    '}',
    'Diretrizes adicionais:',
    '- Reutilize os nomes de padrões e itens de checklist fornecidos.',
    '- Sempre forneça pelo menos dois padrões relevantes.',
    '- Se algum item não se aplicar, use false.',
    '- Mantenha o feedback em português.'
  ].join('\n');

  const promptSections = [
    systemPrompt,
    '--- Prompt da Organização ---',
    prompt
  ];

  if (checklistInstructions) {
    promptSections.push('--- Checklists da Organização ---', checklistInstructions);
  }

  promptSections.push('--- Transcript Extraído ---', extractedText);

  const fullPrompt = promptSections.join('\n\n');

  console.log('Enviando requisição para o Gemini...');

  try {
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const responseText = response.text();

    console.log('Resposta recebida do Gemini.');

    const sanitized = sanitizeJsonResponse(responseText);

    let parsed: Partial<AnalysisResult> & Record<string, unknown>;

    try {
      parsed = JSON.parse(sanitized) as Partial<AnalysisResult> & Record<string, unknown>;
    } catch (parseError) {
      console.error('Falha ao converter resposta do Gemini em JSON válido:', parseError);
      console.error('Resposta original:', responseText);
      return null;
    }

    const pilotId =
      typeof parsed.pilotId === 'string' && parsed.pilotId.trim()
        ? parsed.pilotId.trim()
        : pilotIdFallback;

    const patterns = normalizePatterns(parsed.patterns);

    if (!patterns.length) {
      return null;
    }

    return {
      transcriptId,
      organizationId,
      pilotId,
      patterns
    };
  } catch (error) {
    console.error('Erro ao gerar conteúdo com Gemini:', error);
    return null;
  }
}

async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = getDocument({ data: arrayBuffer });
  const pdfDocument = await loadingTask.promise;

  let extractedText = '';

  console.log('=== INFORMAÇÕES DO ARQUIVO PDF ===');
  console.log('Nome do arquivo:', file.name);
  console.log('Tamanho do arquivo:', (file.size / 1024).toFixed(2), 'KB');
  console.log('Número de páginas:', pdfDocument.numPages);
  console.log('');

  for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
    const page = await pdfDocument.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = content.items
      .filter((item): item is TextItem => 'str' in item)
      .map((item) => item.str)
      .join(' ');

    extractedText += `${pageText}\n`;

    console.log(`--- Página ${pageNumber} ---`);
    console.log(pageText);
    console.log('');
  }

  const trimmedText = extractedText.trim();

  if (!trimmedText) {
    throw new Error('Nenhum texto pôde ser extraído do PDF. Verifique o arquivo.');
  }

  console.log('=== ESTATÍSTICAS ===');
  console.log('Total de caracteres extraídos:', trimmedText.length);
  console.log('Total de linhas:', trimmedText.split('\n').length);
  console.log('=== FIM DA EXTRAÇÃO ===');

  return trimmedText;
}

interface AnalyzePdfOptions {
  onBeforeAnalysis?: (data: {
    metadata: FlightMetadata;
    extractedText: string;
  }) => boolean | Promise<boolean>;
}

export async function analyzePdfWithExtraction(
  file: File,
  prompt: string,
  organization: Organization,
  options: AnalyzePdfOptions = {}
): Promise<AnalysisResult> {
  try {
    console.log('=== INICIANDO PROCESSAMENTO DO PDF ===');

    const extractedText = await extractTextFromPdf(file);
    const metadata = extractFlightMetadata(extractedText);

    if (options.onBeforeAnalysis) {
      const shouldContinue = await options.onBeforeAnalysis({
        metadata,
        extractedText
      });

      if (!shouldContinue) {
        throw new Error('ANALYSIS_CANCELLED');
      }
    }

    console.log('');
    console.log('=== PROMPT PARA ANÁLISE ===');
    console.log(prompt);
    console.log('=== FIM DO PROMPT ===');

    const transcriptId = `TRANSCRIPT_${Date.now()}`;
    let pilotId = `PILOT_${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    if (metadata.pilot) {
      pilotId = metadata.pilot.replace(/\s+/g, '_').toUpperCase();
    }

    let geminiResult: AnalysisResult | null = null;

    try {
      geminiResult = await generateGeminiAnalysis(
        extractedText,
        prompt,
        organization,
        transcriptId,
        pilotId
      );
    } catch (geminiError) {
      console.error('Erro ao gerar análise com Gemini:', geminiError);
    }

    if (geminiResult) {
      geminiResult.metadata = metadata;
      if (metadata.pilot) {
        geminiResult.pilotId = metadata.pilot;
      }
      console.log('Análise gerada com sucesso pelo Gemini.');
      return geminiResult;
    }

    throw new Error('Falha ao obter análise do Gemini.');
  } catch (error) {
    console.error('=== ERRO NO PROCESSAMENTO ===');
    console.error('Erro ao processar o PDF:', error);
    throw error;
  }
}
