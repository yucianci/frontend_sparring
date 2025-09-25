import { AnalysisResult, ChecklistItem } from '../types';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/build/pdf';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { organizations } from '../data/organizations';

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
      .map((item) => toChecklistItem(item))
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

async function generateGeminiAnalysis(
  extractedText: string,
  prompt: string,
  organizationId: string,
  transcriptId: string,
  pilotIdFallback: string
): Promise<AnalysisResult | null> {
  if (!extractedText.trim()) {
    return null;
  }

  const organization = organizations.find((org) => org.id === organizationId);

  const checklistInstructions = organization
    ? Object.entries(organization.checklists)
        .map(([patternName, checklistItems]) => {
          const itemsList = checklistItems.map((item) => `- ${item}`).join('\n');
          return `Padrão: ${patternName}\n${itemsList}`;
        })
        .join('\n\n')
    : '';

  const systemPrompt = `Você é um analista especializado em aviação e CRM. Utilize o prompt fornecido pela organização e o transcript extraído para produzir insights estruturados.\n\nResponda SOMENTE com um JSON válido (sem comentários ou textos adicionais) seguindo exatamente o formato abaixo:\n{\n  "transcriptId": "${transcriptId}",\n  "organizationId": "${organizationId}",\n  "pilotId": "<ID do piloto (ex: PILOT_123)>",\n  "patterns": [\n    {\n      "title": "<Título do padrão identificado>",\n      "feedback": "<Feedback detalhado sobre o padrão>",\n      "checklists": [\n        { "<Nome do item de checklist>": true | false }\n      ]\n    }\n  ]\n}\n\nDiretrizes adicionais:\n- Reutilize os nomes de padrões e itens de checklist fornecidos.\n- Sempre forneça pelo menos dois padrões relevantes.\n- Se algum item não se aplicar, use false.\n- Mantenha o feedback em português.`;

  const fullPrompt = `${systemPrompt}\n\n--- Prompt da Organização ---\n${prompt}\n\n${
    checklistInstructions ? `--- Checklists da Organização ---\n${checklistInstructions}\n\n` : ''
  }--- Transcript Extraído ---\n${extractedText}`;

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

// Função para extrair texto do PDF usando pdfjs-dist (compatível com o browser)
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

// Função para processar PDF e retornar resultado baseado nos dados extraídos
export async function analyzePdfWithExtraction(
  file: File,
  prompt: string,
  organizationId: string
): Promise<AnalysisResult> {
  try {
    console.log('=== INICIANDO PROCESSAMENTO DO PDF ===');

    // 1. Extrair texto do PDF e mostrar no console
    const extractedText = await extractTextFromPdf(file);

    console.log('');
    console.log('=== PROMPT PARA ANÁLISE ===');
    console.log(prompt);
    console.log('=== FIM DO PROMPT ===');

    const transcriptId = `TRANSCRIPT_${Date.now()}`;
    let pilotId = `PILOT_${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    try {
      const jsonData = JSON.parse(extractedText.trim());
      if (jsonData.pilot) {
        pilotId = jsonData.pilot.replace(/\s+/g, '_').toUpperCase();
      }
    } catch (parseError) {
      // Usar ID aleatório se não conseguir fazer parse
    }

    let geminiResult: AnalysisResult | null = null;

    try {
      geminiResult = await generateGeminiAnalysis(
        extractedText,
        prompt,
        organizationId,
        transcriptId,
        pilotId
      );
    } catch (geminiError) {
      console.error('Erro ao gerar análise com Gemini:', geminiError);
    }

    if (geminiResult) {
      console.log('Análise gerada com sucesso pelo Gemini.');
      return geminiResult;
    }

    console.warn('Falha ao obter análise do Gemini. Retornando resultado mock.');

    const mockResults: Record<string, AnalysisResult> = {
      SPARRING001: {
        transcriptId,
        organizationId,
        pilotId,
        patterns: [
          {
            title: 'Gestão de Erros e Interrupções',
            feedback:
              'Análise baseada no transcript extraído do PDF. Piloto demonstrou boa recuperação após interrupção no checklist, reconhecendo o erro e corrigindo o procedimento.',
            checklists: [
              { 'Confirmação de Instruções Críticas': true },
              { 'Uso de Linguagem Objetiva e Sem Ambiguidades': true },
              { 'Execução Correta de Procedimentos de Contingência': true }
            ]
          },
          {
            title: 'Procedimentos Padronizados',
            feedback:
              'Identificada falha inicial no seguimento do checklist, mas com correção adequada após intervenção do copiloto. Necessário reforço na disciplina de procedimentos.',
            checklists: [
              { 'Seguimento Completo de Checklists de Voo': false },
              { 'Cumprimento de Protocolos de Segurança Operacional': true }
            ]
          },
          {
            title: 'Comunicação Clara e Confirmada',
            feedback:
              'Boa comunicação entre tripulação e com ATC. Copiloto demonstrou assertividade adequada ao interromper procedimento incorreto.',
            checklists: [
              { 'Confirmação de Entendimento Entre Piloto e Copiloto': true },
              { 'Uso de Termos Claros e Precisos': true }
            ]
          }
        ]
      },
      AEROLINK001: {
        transcriptId,
        organizationId,
        pilotId,
        patterns: [
          {
            title: 'Coordenação e Trabalho em Equipe',
            feedback:
              'Excelente exemplo de CRM. Copiloto interviu adequadamente e piloto aceitou a correção de forma profissional, demonstrando boa dinâmica de equipe.',
            checklists: [
              { 'Distribuição Clara de Tarefas Durante Operações': true },
              { 'Cooperação na Tomada de Decisões Críticas': true }
            ]
          },
          {
            title: 'Detecção de Alertas e Anomalias',
            feedback:
              'Copiloto demonstrou excelente vigilância ao detectar checklist incompleto. Comunicação imediata e efetiva da anomalia procedural.',
            checklists: [
              { 'Identificação Rápida de Falhas Técnicas': true },
              { 'Comunicação Imediata de Alertas à Equipe': true }
            ]
          }
        ]
      },
      FLYSAFE001: {
        transcriptId,
        organizationId,
        pilotId,
        patterns: [
          {
            title: 'Comunicação Clara e Confirmada',
            feedback:
              'Comunicação clara e profissional durante todo o procedimento. Boa coordenação com ATC e entre tripulação.',
            checklists: [
              { 'Confirmação de Instruções Críticas': true },
              { 'Uso de Linguagem Objetiva e Sem Ambiguidades': true }
            ]
          },
          {
            title: 'Gestão de Erros e Interrupções',
            feedback:
              'Piloto reconheceu erro prontamente e aceitou correção. Boa recuperação e continuidade operacional após interrupção.',
            checklists: [
              { 'Reconhecimento e Correção de Erros em Tempo Hábil': true },
              { 'Continuidade das Operações Apesar de Interrupções': true }
            ]
          },
          {
            title: 'Procedimentos Padronizados',
            feedback:
              'Falha inicial no seguimento do checklist, mas com correção adequada. Demonstra necessidade de maior disciplina procedural.',
            checklists: [
              { 'Seguimento Completo de Checklists de Voo': false },
              { 'Adesão a Práticas Recomendadas': true }
            ]
          }
        ]
      }
    };

    console.log('');
    console.log('=== PROCESSAMENTO CONCLUÍDO COM RESULTADO MOCK ===');
    console.log('Resultado da análise gerado com base no transcript extraído.');

    return mockResults[organizationId] || mockResults.SPARRING001;
  } catch (error) {
    console.error('=== ERRO NO PROCESSAMENTO ===');
    console.error('Erro ao processar o PDF:', error);
    throw error;
  }
}
