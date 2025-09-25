import { AnalysisResult } from '../types';

export const formatAnalysisResult = (result: AnalysisResult) => {
  const header = [
    'Resultado da Análise',
    `ID da Transcrição: ${result.transcriptId}`,
    `Organização: ${result.organizationId}`,
    `Piloto: ${result.pilotId}`,
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
