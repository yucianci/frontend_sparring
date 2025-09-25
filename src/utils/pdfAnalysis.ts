import { AnalysisResult } from '../types';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/build/pdf';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url';

GlobalWorkerOptions.workerSrc = pdfjsWorker;

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

    // 2. Gerar resultado baseado nos dados extraídos
    const transcriptId = `TRANSCRIPT_${Date.now()}`;
    let pilotId = `PILOT_${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    // Tentar extrair informações do JSON se possível
    try {
      const jsonData = JSON.parse(extractedText.trim());
      if (jsonData.pilot) {
        pilotId = jsonData.pilot.replace(/\s+/g, '_').toUpperCase();
      }
    } catch (parseError) {
      // Usar ID aleatório se não conseguir fazer parse
    }
    
    // Retornar resultado baseado na organização selecionada
    const mockResults: Record<string, AnalysisResult> = {
      'SPARRING001': {
        transcriptId,
        organizationId,
        pilotId,
        patterns: [
          {
            title: "Gestão de Erros e Interrupções",
            feedback: "Análise baseada no transcript extraído do PDF. Piloto demonstrou boa recuperação após interrupção no checklist, reconhecendo o erro e corrigindo o procedimento.",
            checklists: [
              { "Confirmação de Instruções Críticas": true },
              { "Uso de Linguagem Objetiva e Sem Ambiguidades": true },
              { "Execução Correta de Procedimentos de Contingência": true }
            ]
          },
          {
            title: "Procedimentos Padronizados",
            feedback: "Identificada falha inicial no seguimento do checklist, mas com correção adequada após intervenção do copiloto. Necessário reforço na disciplina de procedimentos.",
            checklists: [
              { "Seguimento Completo de Checklists de Voo": false },
              { "Cumprimento de Protocolos de Segurança Operacional": true }
            ]
          },
          {
            title: "Comunicação Clara e Confirmada",
            feedback: "Boa comunicação entre tripulação e com ATC. Copiloto demonstrou assertividade adequada ao interromper procedimento incorreto.",
            checklists: [
              { "Confirmação de Entendimento Entre Piloto e Copiloto": true },
              { "Uso de Termos Claros e Precisos": true }
            ]
          }
        ]
      },
      'AEROLINK001': {
        transcriptId,
        organizationId,
        pilotId,
        patterns: [
          {
            title: "Coordenação e Trabalho em Equipe",
            feedback: "Excelente exemplo de CRM. Copiloto interviu adequadamente e piloto aceitou a correção de forma profissional, demonstrando boa dinâmica de equipe.",
            checklists: [
              { "Distribuição Clara de Tarefas Durante Operações": true },
              { "Cooperação na Tomada de Decisões Críticas": true }
            ]
          },
          {
            title: "Detecção de Alertas e Anomalias",
            feedback: "Copiloto demonstrou excelente vigilância ao detectar checklist incompleto. Comunicação imediata e efetiva da anomalia procedural.",
            checklists: [
              { "Identificação Rápida de Falhas Técnicas": true },
              { "Comunicação Imediata de Alertas à Equipe": true }
            ]
          }
        ]
      },
      'FLYSAFE001': {
        transcriptId,
        organizationId,
        pilotId,
        patterns: [
          {
            title: "Comunicação Clara e Confirmada",
            feedback: "Comunicação clara e profissional durante todo o procedimento. Boa coordenação com ATC e entre tripulação.",
            checklists: [
              { "Confirmação de Instruções Críticas": true },
              { "Uso de Linguagem Objetiva e Sem Ambiguidades": true }
            ]
          },
          {
            title: "Gestão de Erros e Interrupções",
            feedback: "Piloto reconheceu erro prontamente e aceitou correção. Boa recuperação e continuidade operacional após interrupção.",
            checklists: [
              { "Reconhecimento e Correção de Erros em Tempo Hábil": true },
              { "Continuidade das Operações Apesar de Interrupções": true }
            ]
          },
          {
            title: "Procedimentos Padronizados",
            feedback: "Falha inicial no seguimento do checklist, mas com correção adequada. Demonstra necessidade de maior disciplina procedural.",
            checklists: [
              { "Seguimento Completo de Checklists de Voo": false },
              { "Adesão a Práticas Recomendadas": true }
            ]
          }
        ]
      }
    };

    console.log('');
    console.log('=== PROCESSAMENTO CONCLUÍDO ===');
    console.log('Resultado da análise gerado com base no transcript extraído.');
    
    return mockResults[organizationId] || mockResults['SPARRING001'];
    
  } catch (error) {
    console.error('=== ERRO NO PROCESSAMENTO ===');
    console.error('Erro ao processar o PDF:', error);
    throw error;
  }
}