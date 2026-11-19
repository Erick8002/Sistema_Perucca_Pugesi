# Perucca Pugesi - Sistema de Gestão Financeira

Dashboard web para controle financeiro empresarial, com gestão de contas, categorias e lançamentos, indicadores visuais, filtros de período e exportação de relatórios.

O projeto é dividido em uma aplicação React no diretório raiz e uma API REST em Express no diretório `backend`, com PostgreSQL hospedado no Supabase e autenticação pelo Supabase Auth.

## Visão geral

### Funcionalidades

- Autenticação de usuários com e-mail e senha
- Cadastro e exclusão de contas
- Seleção de uma conta específica ou de todas as contas
- Cadastro, edição, exclusão e parcelamento de transações
- Cadastro e exclusão de categorias
- Filtros por conta, categoria, status, ano, mês e intervalo de datas
- Indicadores de despesas, contas pagas e contas pendentes
- Resumos de vencimentos da semana, valores acima de um limite, funcionários e despesas mensais
- Gráficos de gastos por categoria e evolução dos últimos seis meses
- Exportação de relatórios em CSV, Excel e PDF
- Associação de arquivos às transações, como NF-e, XML, boleto e comprovante
- Integração para criação automática de transações por automação externa

### Tecnologias

**Frontend**

- React 18
- Vite 4
- Tailwind CSS 3
- Supabase JS
- Recharts
- Lucide React
- pdf-lib

**Backend**

- Node.js
- Express 5
- PostgreSQL
- pg
- Supabase Storage
- Supabase Auth

## Arquitetura

```text
PeruccaPugesi/
├── src/
│   ├── assets/             # Logo e recursos visuais
│   ├── components/         # Interface, tabelas, gráficos e modais
│   ├── contexts/           # Contexto de autenticação
│   ├── pages/              # Página de login
│   ├── services/           # Cliente do Supabase
│   ├── App.jsx             # Estado principal e integrações
│   ├── index.css           # Estilos globais
│   └── main.jsx            # Inicialização da aplicação
├── backend/
│   ├── database/
│   │   └── schema.sql      # Estrutura das tabelas do PostgreSQL
│   └── src/
│       ├── routes/         # Rotas de contas e transações
│       ├── controllers/    # Controle auxiliar da aplicação
│       ├── middleware/     # Middleware da API
│       ├── db.js           # Pool de conexão PostgreSQL
│       └── server.js       # Inicialização do servidor Express
├── index.html
├── package.json
└── vite.config.js
```

## Pré-requisitos

- Node.js 18 ou superior
- npm
- Projeto configurado no Supabase
- Banco PostgreSQL acessível
- Usuário criado no Supabase Auth para acessar o sistema

## Configuração

### 1. Clonar o repositório

```bash
git clone https://github.com/Erick8002/Sistema_Perucca_Pugesi.git
cd Sistema_Perucca_Pugesi
```

### 2. Configurar o frontend

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica-anon
VITE_API_URL=http://localhost:3001
```

> Use somente a chave pública `anon` no frontend. Nunca exponha a chave `service_role`.

### 3. Configurar a API

Crie um arquivo `backend/.env`:

```env
PORT=3001

DB_USER=usuario-postgresql
DB_PASSWORD=sua-senha
DB_HOST=host-postgresql
DB_PORT=5432
DB_NAME=postgres

SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role

AUTOMATION_API_KEY=uma-chave-secreta-forte
```

Todas as credenciais devem ser fornecidas por variáveis de ambiente. Os arquivos `.env` não devem ser enviados ao repositório.

### 4. Preparar o banco de dados

Execute o conteúdo de `backend/database/schema.sql` no editor SQL do Supabase ou em uma instância PostgreSQL compatível.

O script cria e mantém compatibilidade das seguintes estruturas:

- `accounts`: contas, fornecedores ou clientes
- `categories`: categorias dos lançamentos
- `transactions`: transações, parcelas, status e anexos

## Instalação

### Instalar dependências do frontend

Na raiz do projeto:

```bash
npm install
```

### Instalar dependências da API

```bash
cd backend
npm install
cd ..
```

## Executando o projeto

Em dois terminais:

**Terminal 1 - API**

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend**

```bash
npm run dev
```

Por padrão:

- Frontend: `http://localhost:5173`
- API: `http://localhost:3001`

## Build de produção

Para gerar os arquivos estáticos do frontend:

```bash
npm run build
```

O resultado será criado no diretório `dist/`.

Para publicar localmente o build:

```bash
npm start
```

O conteúdo será servido na porta `8080`.

## API

### Contas

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/api/accounts` | Lista contas |
| `POST` | `/api/accounts` | Cria uma conta |
| `DELETE` | `/api/accounts/:id` | Exclui uma conta |

### Transações

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/api/transactions` | Lista transações |
| `POST` | `/api/transactions` | Cria uma ou várias parcelas |
| `PATCH` | `/api/transactions/:id` | Atualiza o status e a data de pagamento |
| `DELETE` | `/api/transactions/:id` | Exclui uma transação e arquivos não utilizados |
| `PUT` | `/api/transactions/group/:groupId` | Atualiza os dados de um grupo parcelado |
| `POST` | `/api/transactions/automation` | Cria transação via automação |

### Categorias

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/api/transactions/categories` | Lista categorias |
| `POST` | `/api/transactions/categories` | Cria uma categoria |
| `DELETE` | `/api/transactions/categories/:name` | Exclui uma categoria |

### Automação

A rota `POST /api/transactions/automation` exige o cabeçalho:

```http
x-api-key: sua-chave-de-automacao
```

Exemplo de corpo:

```json
{
  "account_id": 1,
  "due_date": "2026-11-20",
  "supplier": "Fornecedor exemplo",
  "category": "Serviços",
  "amount": 250,
  "descricao": "Lançamento recebido por automação",
  "status": "Pendente"
}
```

Também são aceitos os aliases `data_vencimento`, `fornecedor`, `categoria` e `valor`.

## Estrutura dos dados

### Conta

```text
id
name
account_type
document
document_type
created_at
```

### Categoria

```text
id
name
created_at
```

### Transação

```text
id
account_id
category_id
due_date
supplier
descricao
amount
status
current_installment
total_installment
group_id
paid_at
nfe_url
xml_url
boleto_url
receipt_url
created_at
updated_at
```

## Segurança

- A autenticação é gerenciada pelo Supabase Auth.
- Sessões são restauradas automaticamente pelo `AuthContext`.
- A chave pública do Supabase pode ser utilizada no frontend.
- A chave `service_role` deve permanecer exclusivamente no backend.
- A rota de automação deve ser protegida por uma chave forte e não deve ser exposta no frontend.
- Senhas, chaves de banco e credenciais não devem ser versionadas.
- Dados sensíveis existentes em ambientes locais devem ser rotacionados antes de compartilhar o repositório.

## Scripts disponíveis

### Frontend

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o build de produção |
| `npm run preview` | Visualiza o build localmente |
| `npm start` | Serve `dist/` na porta `8080` |

### Backend

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor com nodemon |
| `npm start` | Inicia o servidor Express |

## Estado atual

O projeto não possui uma suíte automatizada configurada. Recomenda-se adicionar testes antes de mudanças críticas, especialmente para autenticação, filtros financeiros, geração de parcelas e exportação de relatórios.

## Licença

Consulte o proprietário do repositório para definir e documentar os termos de uso da aplicação.
