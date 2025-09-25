# Frontend Sparring

Uma aplicação web construída com React e Vite que acelera a revisão de relatórios de voo. O projeto permite centralizar prompts personalizados por organização, extrair texto de arquivos PDF e gerar análises estruturadas com auxílio da API Gemini.

## ✨ Principais funcionalidades

- **Seleção de organização** – Carrega automaticamente as organizações cadastradas via GraphQL e mantém o contexto escolhido em toda a experiência.
- **Upload de relatórios em PDF** – Extrai o texto de cada página e apresenta logs úteis sobre o processamento.
- **Editor de prompt inteligente** – Exibe o prompt padrão da organização, permitindo ajustes antes de enviar para análise.
- **Análise assistida por IA** – Envia os dados extraídos para o modelo Gemini 1.5 Flash e retorna padrões, feedbacks e checklists estruturados.
- **Detecção de inconsistências** – Valida metadados do PDF e alerta quando a empresa do relatório não coincide com a organização selecionada.
- **Dark mode persistente** – Preferência de tema salva no `localStorage` e aplicada globalmente.

## 🧱 Arquitetura em alto nível

```
src/
├── components/          # Header, cards, modais, upload e editor de prompt
├── context/             # Contexto global com organizações, tema e resultados
├── hooks/               # Hooks utilitários (ex.: useApp)
├── services/            # Comunicação com a API GraphQL
├── utils/               # Extração de PDF e integração com Gemini
├── types/               # Tipagens compartilhadas
└── App.tsx              # Composição da interface principal
```

## 🚀 Começando

### Pré-requisitos

- [Node.js](https://nodejs.org/) >= 18
- [npm](https://www.npmjs.com/)

### Instalação

```bash
npm install
```

### Executar em ambiente de desenvolvimento

```bash
npm run dev
```

O Vite exibirá no terminal a URL local (por padrão, `http://localhost:5173`).

## 📄 Licença

Defina aqui a licença do projeto (por exemplo, MIT) antes de publicar no GitHub.
