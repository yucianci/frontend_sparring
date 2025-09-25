import { Organization } from '../types';

export const organizations: Organization[] = [
  {
    id: 'SPARRING001',
    name: 'Sparring Airlines',
    pilots: 4,
    averageFlightHours: 1250,
    fleet: 3,
    safetyStandards: [
      'Gestão de Erros e Interrupções',
      'Procedimentos Padronizados',
      'Comunicação Clara e Confirmada'
    ],
    checklists: {
      'Gestão de Erros e Interrupções': [
        'Confirmação de instruções críticas',
        'Uso de linguagem objetiva e sem ambiguidades',
        'Execução correta de procedimentos de contingência'
      ],
      'Procedimentos Padronizados': [
        'Seguimento completo de checklists de voo',
        'Cumprimento de protocolos de segurança operacional'
      ],
      'Comunicação Clara e Confirmada': [
        'Confirmação de entendimento entre piloto e copiloto',
        'Uso de termos claros e precisos'
      ]
    },
    observations: 'Monitoramento de comunicação em cabine, foco em emergências e checklists críticos, acompanhamento de falhas reportadas.',
    prompt: `Analise a transcrição da cabine considerando os padrões de segurança da Sparring Airlines:

Padrões Principais:
- Gestão de Erros e Interrupções (confirmação de instruções críticas, linguagem objetiva, procedimentos de contingência)
- Procedimentos Padronizados (checklists completos, protocolos de segurança)
- Comunicação Clara e Confirmada (entendimento entre tripulação, terminologia precisa)

Foco especial em: emergências, checklists críticos e comunicação em cabine.

Forneça feedback detalhado para cada padrão identificado.`
  },
  {
    id: 'AEROLINK001',
    name: 'AeroLink',
    pilots: 6,
    averageFlightHours: 980,
    fleet: 5,
    safetyStandards: [
      'Gestão de Erros e Interrupções',
      'Procedimentos Padronizados',
      'Detecção de Alertas e Anomalias',
      'Coordenação e Trabalho em Equipe'
    ],
    checklists: {
      'Gestão de Erros e Interrupções': [
        'Confirmação de instruções críticas',
        'Uso de linguagem objetiva e sem ambiguidades'
      ],
      'Procedimentos Padronizados': [
        'Cumprimento de protocolos de segurança operacional',
        'Adesão a práticas recomendadas e regulamentações'
      ],
      'Detecção de Alertas e Anomalias': [
        'Identificação rápida de falhas técnicas',
        'Comunicação imediata de alertas à equipe'
      ],
      'Coordenação e Trabalho em Equipe': [
        'Distribuição clara de tarefas durante operações',
        'Cooperação na tomada de decisões críticas'
      ]
    },
    observations: 'Foco em coordenação de equipe e respostas rápidas a alertas de sistema, treinamento contínuo em gestão de emergências.',
    prompt: `Analise a transcrição da cabine considerando os padrões de segurança da AeroLink:

Padrões Principais:
- Gestão de Erros e Interrupções (confirmação crítica, linguagem objetiva)
- Procedimentos Padronizados (protocolos de segurança, práticas recomendadas)
- Detecção de Alertas e Anomalias (identificação rápida, comunicação de alertas)
- Coordenação e Trabalho em Equipe (distribuição de tarefas, cooperação em decisões)

Foco especial em: coordenação de equipe, alertas de sistema e gestão de emergências.

Forneça feedback detalhado para cada padrão identificado.`
  },
  {
    id: 'FLYSAFE001',
    name: 'FlySafe Aviation',
    pilots: 50,
    averageFlightHours: 1100,
    fleet: 80,
    safetyStandards: [
      'Comunicação Clara e Confirmada',
      'Detecção de Alertas e Anomalias',
      'Coordenação e Trabalho em Equipe',
      'Procedimentos Padronizados',
      'Gestão de Erros e Interrupções'
    ],
    checklists: {
      'Comunicação Clara e Confirmada': [
        'Confirmação de instruções críticas',
        'Uso de linguagem objetiva e sem ambiguidades'
      ],
      'Detecção de Alertas e Anomalias': [
        'Observação de condições externas (clima, tráfego)',
        'Comunicação imediata de alertas à equipe'
      ],
      'Coordenação e Trabalho em Equipe': [
        'Sincronização nas ações de emergência',
        'Cooperação na tomada de decisões críticas'
      ],
      'Procedimentos Padronizados': [
        'Seguimento completo de checklists de voo',
        'Adesão a práticas recomendadas'
      ],
      'Gestão de Erros e Interrupções': [
        'Reconhecimento e correção de erros em tempo hábil',
        'Continuidade das operações apesar de interrupções'
      ]
    },
    observations: 'Monitoramento extensivo de emergência, execução de checklists e respostas a falhas múltiplas; foco em segurança operacional, treinamento contínuo e auditorias internas.',
    prompt: `Analise a transcrição da cabine considerando os padrões de segurança da FlySafe Aviation:

Padrões Principais:
- Comunicação Clara e Confirmada (confirmação crítica, linguagem objetiva)
- Detecção de Alertas e Anomalias (condições externas, comunicação de alertas)
- Coordenação e Trabalho em Equipe (sincronização em emergências, cooperação)
- Procedimentos Padronizados (checklists completos, práticas recomendadas)
- Gestão de Erros e Interrupções (correção oportuna, continuidade operacional)

Foco especial em: emergências extensivas, checklists múltiplos, segurança operacional e auditorias.

Forneça feedback detalhado para cada padrão identificado.`
  }
];