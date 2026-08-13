# FinDash - Dashboard Financeiro Empresarial

Um dashboard financeiro moderno e responsivo construído com React, Vite e Tailwind CSS.

## 🎯 Características

- ✅ **Componentização Modular**: Estrutura clara e reutilizável de componentes
- ✅ **Design Responsivo**: Funciona perfeitamente em desktop, tablet e mobile
- ✅ **Tailwind CSS**: Estilização moderna com utilitários do Tailwind
- ✅ **Gráficos Interativos**: Integração com Recharts para visualizações
- ✅ **Ícones Vetoriais**: Lucide React para ícones limpos e consistentes
- ✅ **Mock Data**: Dados fictícios prontos para demonstração

## 📁 Estrutura do Projeto

```
financial-dashboard/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx              # Barra lateral com navegação
│   │   ├── Header.jsx               # Cabeçalho com saudação
│   │   ├── KpiCard.jsx              # Cards de indicadores
│   │   ├── SummaryCard.jsx          # Cards de resumo em pastel
│   │   ├── TransactionsTable.jsx    # Tabela de transações
│   │   ├── CategoryChart.jsx        # Gráfico de pizza
│   │   └── EvolutionChart.jsx       # Gráfico de evolução
│   ├── App.jsx                      # Componente principal
│   ├── main.jsx                     # Ponto de entrada React
│   ├── index.css                    # Estilos globais (Tailwind)
│   └── mockData.js                  # Dados fictícios
├── index.html                       # HTML raiz
├── package.json                     # Dependências
├── vite.config.js                   # Config Vite
├── tailwind.config.js               # Config Tailwind
├── postcss.config.js                # Config PostCSS
└── README.md                        # Este arquivo
```

## 🚀 Instalação e Execução

### 1️⃣ Clonar ou Descompactar o Projeto
```bash
cd financial-dashboard
```

### 2️⃣ Instalar Dependências
```bash
npm install
```

### 3️⃣ Executar em Desenvolvimento
```bash
npm run dev
```

A aplicação estará disponível em: `http://localhost:5173`

### 4️⃣ Build para Produção
```bash
npm run build
```

Os arquivos otimizados estarão em `dist/`

## 🎨 Paleta de Cores

- **Primary (Roxo)**: `#7c3aed`, `#6d28d9`, `#5b21b6`
- **Accent Green**: `#a8e6cf`
- **Accent Blue**: `#b8e0f5`
- **Accent Pastel**: `#f5d5e3`
- **Status Paid**: `#a8e6cf`
- **Status Pending**: `#ffd9a8`
- **Status Overdue**: `#ff9b9b`
- **Neutral**: Tons de cinza do `50` ao `900`

## 📊 Dados Simulados

Os dados fictícios estão no arquivo `src/mockData.js`:

- **23 transações** (Agrofértil, MaqCampo, etc.)
- **KPIs**: Gastos do Mês, Contas Pagas, Contas Pendentes
- **Resumo**: A vencer na semana, Gastos com Funcionários, etc.
- **Gráficos**: Gastos por Categoria e Evolução de Despesas

## 🔧 Customização

### Alterar Cores
Edite `tailwind.config.js` na seção `theme.extend.colors`

### Alterar Dados
Modifique `src/mockData.js` com seus dados reais

### Adicionar Novas Páginas
1. Crie um novo componente em `src/components/`
2. Importe em `src/App.jsx`
3. Estruture com os componentes existentes

## 📦 Dependências Principais

- **React 18.2**: Framework UI
- **Vite 4.4**: Build tool ultrarrápido
- **Tailwind CSS 3.3**: Framework CSS utilitário
- **Recharts 2.10**: Biblioteca de gráficos
- **Lucide React 0.263**: Ícones vetoriais

## 🎯 Próximos Passos (Future Back-end)

Quando iniciar o back-end:

1. Criar API endpoints para transações
2. Conectar aos serviços HTTP (Fetch/Axios)
3. Implementar autenticação e autorização
4. Substituir mockData.js por chamadas API reais
5. Adicionar validação e tratamento de erros

## 📝 Notas

- Todos os dados exibidos são fictícios
- Nenhuma integração de banco de dados ainda
- Componentes totalmente reutilizáveis
- Código bem estruturado para fácil manutenção

## 💡 Dicas

- Use o DevTools do navegador para inspecionar componentes
- Modifique `mockData.js` para testar diferentes cenários
- Tailwind CSS oferece documentação completa em https://tailwindcss.com
- Recharts permite adicionar mais tipos de gráficos facilmente

---

**Desenvolvido com ❤️ para gestão financeira empresarial**
