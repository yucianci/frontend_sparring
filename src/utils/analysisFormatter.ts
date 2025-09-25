import { AnalysisResult } from '../types';

export const formatAnalysisResult = (result: AnalysisResult) => {
  const metadataLines: string[] = [];

  if (result.metadata?.company) {
    metadataLines.push(`Empresa: ${result.metadata.company}`);
  }
  if (result.metadata?.flightNumber) {
    metadataLines.push(`Número do Voo: ${result.metadata.flightNumber}`);
  }
  if (result.metadata?.aircraft) {
    metadataLines.push(`Aeronave: ${result.metadata.aircraft}`);
  }
  if (result.metadata?.copilot) {
    metadataLines.push(`Copiloto: ${result.metadata.copilot}`);
  }

  const details = result.metadata?.flightDetails;
  if (details?.route) {
    metadataLines.push(`Rota: ${details.route}`);
  }
  if (details?.date) {
    metadataLines.push(`Data: ${details.date}`);
  }
  if (details?.duration) {
    metadataLines.push(`Duração: ${details.duration}`);
  }
  if (details?.weather) {
    metadataLines.push(`Condições Climáticas: ${details.weather}`);
  }

  const header = [
    'Resultado da Análise',
    `ID da Transcrição: ${result.transcriptId}`,
    `Organização: ${result.organizationId}`,
    `Piloto: ${result.pilotId}`,
    ...metadataLines,
    ''.trim(),
  ];

  const patternTexts = result.patterns.map((pattern, index) => {
    const checklistText = pattern.checklists
      .map((checklist, checklistIndex) => {
        const items = Object.entries(checklist)
          .map(([item, status]) => `    - [${status ? 'x' : ' '}] ${item}`)
          .join('\n');
        return `  Checklist ${checklistIndex + 1}:\n${items}`;
      })
      .join('\n');

    return [
      `${index + 1}. ${pattern.title}`,
      `Feedback: ${pattern.feedback}`,
      checklistText,
    ].join('\n');
  });

  return [...header, ...patternTexts].join('\n\n');
};
