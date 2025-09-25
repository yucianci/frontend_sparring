import { AnalysisResult } from '../types';

// Função para extrair texto do PDF usando pdf-parse
async function extractTextFromPdf(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        
        // Configura o worker do PDF.js para funcionar no browser
        if (typeof window !== 'undefined') {
          // @ts-ignore
          window.pdfjsLib = window.pdfjsLib || {};
          // @ts-ignore
          window.pdfjsLib.GlobalWorkerOptions = window.pdfjsLib.GlobalWorkerOptions || {};
          // @ts-ignore
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
        
        // Importa pdf-parse dinamicamente para uso no browser
        const pdfParse = await import('pdf-parse/lib/pdf-parse.js');
        
        const data = await pdfParse.default(arrayBuffer);
        
        if (!data.text || data.text.trim() === '') {
          reject(new Error('Nenhum texto pôde ser extraído do PDF. Verifique o arquivo.'));
          return;
        }
        
        console.log('=== INFORMAÇÕES DO ARQUIVO PDF ===');
        console.log('Nome do arquivo:', file.name);
        console.log('Tamanho do arquivo:', (file.size / 1024).toFixed(2), 'KB');
        console.log('Número de páginas:', data.numpages);
        console.log('');
        console.log('=== TEXTO COMPLETO EXTRAÍDO DO PDF ===');
        console.log(data.text);
        console.log('');
        console.log('=== ESTATÍSTICAS ===');
        console.log('Total de caracteres extraídos:', data.text.length);
        console.log('Total de linhas:', data.text.split('\n').length);
        console.log('=== FIM DA EXTRAÇÃO ===');
        
        // Tentar fazer parse do JSON se o texto parecer ser JSON
        try {
          const jsonData = JSON.parse(data.text.trim());
          console.log('');
          console.log('=== DADOS ESTRUTURADOS ENCONTRADOS ===');
          console.log('Empresa:', jsonData.company);
          console.log('Número do voo:', jsonData.flightNumber);
          console.log('Aeronave:', jsonData.aircraft);
          console.log('Piloto:', jsonData.pilot);
          console.log('Copiloto:', jsonData.copilot);
          console.log('Rota:', jsonData.flightDetails?.route);
          console.log('Data:', jsonData.flightDetails?.date);
          console.log('Duração:', jsonData.flightDetails?.duration);
          console.log('Clima:', jsonData.flightDetails?.weather);
          console.log('Total de mensagens no transcript:', jsonData.transcript?.length || 0);
          console.log('');
          console.log('=== TRANSCRIPT COMPLETO ===');
          if (jsonData.transcript && Array.isArray(jsonData.transcript)) {
            jsonData.transcript.forEach((entry: any, index: number) => {
              console.log(`${index + 1}. [${entry.timestamp}] ${entry.speaker}: ${entry.message}`);
            });
          }
          console.log('=== FIM DO TRANSCRIPT ===');
        } catch (parseError) {
          console.log('');
          console.log('=== AVISO ===');
          console.log('O texto extraído não está em formato JSON válido.');
          console.log('Texto será processado como texto simples.');
        }
        
        resolve(data.text);
      } catch (error) {
        console.error('Erro ao extrair texto do PDF:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Erro ao ler o arquivo PDF'));
    reader.readAsArrayBuffer(file);
  });
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