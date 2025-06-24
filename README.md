# DestacaCV MVP

Uma aplicação web moderna para criação de currículos profissionais com interface intuitiva e geração de documentos em PDF.

## 🚀 Sobre o Projeto

O DestacaCV MVP é uma plataforma que permite aos usuários criar currículos profissionais de forma rápida e eficiente. A aplicação oferece:

- **Interface Wizard**: Formulário dividido em etapas para melhor experiência do usuário
- **Geração de PDF**: Criação automática de currículos em formato PDF
- **Design Responsivo**: Interface adaptável para desktop e mobile
- **Tecnologias Modernas**: Stack atual com React, TypeScript, Tailwind CSS e Node.js

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca para construção de interfaces
- **TypeScript** - Tipagem estática para JavaScript
- **Tailwind CSS** - Framework CSS utilitário
- **Vite** - Build tool e dev server
- **React Hook Form** - Gerenciamento de formulários
- **Lucide React** - Ícones modernos

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Drizzle ORM** - ORM para banco de dados
- **SQLite** - Banco de dados local (desenvolvimento)

### Ferramentas
- **Git** - Controle de versão
- **GitHub** - Hospedagem do código
- **Vercel** - Deploy e hospedagem

## 📁 Estrutura do Projeto

```
destacacv-mvp/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   │   ├── ui/        # Componentes de UI reutilizáveis
│   │   │   └── wizard/    # Componentes do wizard
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilitários e configurações
│   │   └── types/         # Definições de tipos TypeScript
│   └── index.html
├── server/                 # Backend Node.js
│   ├── routes.ts          # Rotas da API
│   ├── db.ts              # Configuração do banco
│   ├── storage.ts         # Integração com armazenamento
│   └── templates/         # Templates HTML para PDFs
├── shared/                 # Código compartilhado
│   └── schema.ts          # Schema do banco de dados
└── package.json
```

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Git

### Passos para Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/destacacv-mvp.git
   cd destacacv-mvp
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   Crie um arquivo `.env` na raiz do projeto:
   ```env
   # Banco de dados
   DATABASE_URL="file:./dev.db"
   
   # Armazenamento (opcional para desenvolvimento)
   STORAGE_ENDPOINT=""
   STORAGE_ACCESS_KEY=""
   STORAGE_SECRET_KEY=""
   STORAGE_BUCKET=""
   ```

4. **Inicialize o banco de dados**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

5. **Execute o projeto em modo de desenvolvimento**
   ```bash
   npm run dev
   ```

A aplicação estará disponível em `http://localhost:5173`

## 🏗️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia o servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build

# Banco de dados
npm run db:generate  # Gera migrações
npm run db:migrate   # Executa migrações
npm run db:studio    # Abre o Drizzle Studio

# Linting e formatação
npm run lint         # Executa ESLint
npm run format       # Formata código com Prettier
```

## 🌐 Deploy e Hospedagem

### Deploy no Vercel

O projeto está configurado para deploy automático no Vercel. Siga os passos:

1. **Conecte o repositório ao Vercel**
   - Acesse [vercel.com](https://vercel.com)
   - Faça login com sua conta GitHub
   - Clique em "New Project"
   - Importe o repositório `destacacv-mvp`

2. **Configure as variáveis de ambiente**
   No painel do Vercel, vá em Settings > Environment Variables e adicione:
   ```
   DATABASE_URL=sua_url_do_banco
   STORAGE_ENDPOINT=sua_endpoint_storage
   STORAGE_ACCESS_KEY=sua_access_key
   STORAGE_SECRET_KEY=sua_secret_key
   STORAGE_BUCKET=seu_bucket
   ```

3. **Configure o build**
   O Vercel detectará automaticamente que é um projeto Vite. As configurações padrão são:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Deploy**
   - Cada push para o branch `main` gerará um deploy automático
   - Pull requests gerarão previews automáticos

### Configurações Específicas do Vercel

O projeto inclui um arquivo `vercel.json` na raiz com configurações otimizadas:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ]
}
```

### Domínio Personalizado

Para usar um domínio personalizado:

1. No painel do Vercel, vá em Settings > Domains
2. Adicione seu domínio
3. Configure os registros DNS conforme instruído

## 🔧 Desenvolvimento

### Estrutura de Branches

- `main` - Branch principal, sempre estável
- `develop` - Branch de desenvolvimento
- `feature/*` - Branches para novas funcionalidades
- `hotfix/*` - Branches para correções urgentes

### Padrões de Commit

Utilizamos o padrão Conventional Commits:

```
feat: adiciona nova funcionalidade
fix: corrige bug
docs: atualiza documentação
style: formatação de código
refactor: refatoração de código
test: adiciona ou corrige testes
chore: tarefas de manutenção
```

### Workflow de Desenvolvimento

1. Crie uma branch a partir de `develop`
2. Desenvolva a funcionalidade
3. Faça commits seguindo o padrão
4. Abra um Pull Request para `develop`
5. Após review, merge para `develop`
6. Quando `develop` estiver estável, merge para `main`

## 📝 API Endpoints

### POST /api/generate-cv
Gera um currículo em PDF baseado nos dados fornecidos.

**Body:**
```json
{
  "personalData": {
    "name": "João Silva",
    "email": "joao@email.com",
    "phone": "(11) 99999-9999"
  },
  "experience": [...],
  "skills": [...]
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://storage.example.com/cv-123.pdf"
}
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte, envie um email para [seu-email@exemplo.com] ou abra uma issue no GitHub.

## 🙏 Agradecimentos

- [Vercel](https://vercel.com) pela hospedagem
- [Tailwind CSS](https://tailwindcss.com) pelo framework CSS
- [Drizzle](https://orm.drizzle.team) pelo ORM
- Comunidade open source

---

**Desenvolvido com ❤️ para facilitar a criação de currículos profissionais** 