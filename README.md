# Gerenciador de Tarefas - Sistema de Controle de Atividades

Sistema completo para controle de atividades de equipe com dois perfis (Administrador e Usuário), integrado com Supabase para backend e autenticação.

## 🏗️ Arquitetura

### Frontend (Netlify)
- **Framework**: React 18 com Vite
- **Estilização**: Tailwind CSS
- **Gráficos**: Recharts
- **Exportação**: SheetJS (xlsx)
- **Datas**: date-fns

### Backend (Supabase - Existente)
- **Autenticação**: Supabase Auth
- **Banco de Dados**: PostgreSQL com Row Level Security (RLS)
- **Tabelas**: `profiles` e `tarefas`

## 📊 Estrutura do Banco de Dados

### Tabela: profiles
```sql
- id (uuid, PK, = auth.uid())
- nome (text)
- role (text: 'admin' ou 'user')
- created_at (timestamp)
```

### Tabela: tarefas
```sql
- id (uuid, PK)
- descricao (text)
- responsavel (text)
- prazo_data (date)
- prazo_hora (time, opcional)
- status (text, default: 'pendente')
- justificativa (text)
- created_by (uuid = auth.uid())
- created_at (timestamp)
- concluido_em (timestamp)
```

## 🔐 Regras de Segurança (RLS)

### profiles
- Usuário autenticado pode ver apenas o próprio perfil
- Admin pode ver todos os perfis

### tarefas
- Usuário autenticado pode criar tarefas
- Usuário vê apenas suas próprias tarefas
- Admin vê todas as tarefas

## 👥 Perfis de Usuário

### Administrador
**Permissões:**
- ✅ Criar, editar e excluir tarefas
- ✅ Ver todas as tarefas
- ✅ Visualizar painel de estatísticas
- ✅ Ver gráficos de desempenho
- ✅ Exportar relatórios em Excel
- ✅ Aprovar/reprovar justificativas

### Usuário Comum
**Permissões:**
- ✅ Ver apenas suas próprias tarefas
- ✅ Marcar tarefas como concluídas
- ✅ Inserir justificativa se concluir em atraso
- ✅ Informar que não estava atrasada
- ❌ Não pode editar ou excluir tarefas

## ⚙️ Funcionalidades

### Gestão de Tarefas
1. **Criação** (Admin)
   - Descrição da tarefa
   - Responsável (lista suspensa)
   - Data e hora do prazo
   - Status inicial

2. **Conclusão** (Usuário)
   - Marca como concluída
   - Se atrasada: requer justificativa OU marcar "não estava atrasada"
   - Tarefa vai para aba "Arquivadas"

3. **Detecção de Atraso**
   - Calcula com base em `prazo_data` e `prazo_hora`
   - Se não houver `prazo_hora`, considera final do dia (23:59:59)
   - Visual destacado para tarefas atrasadas

### Painel Administrativo

#### Estatísticas
- Total de tarefas
- Tarefas concluídas
- Tarefas ativas
- Percentual no prazo
- Percentual atrasadas

#### Gráficos
1. **Status das Tarefas** (Pizza)
   - Concluídas vs Ativas

2. **Cumprimento de Prazo** (Pizza)
   - No Prazo vs Atrasadas

3. **Desempenho por Responsável** (Barras)
   - Concluídas, Ativas, Atrasadas por pessoa

#### Exportação Excel
Gera arquivo com 3 planilhas:
1. **Tarefas**: Lista completa de todas as tarefas
2. **Indicadores**: Resumo estatístico
3. **Desempenho**: Métricas por responsável

## 🚀 Deploy no Netlify

### 1. Preparar o Projeto

```bash
# Instalar dependências
npm install

# Testar localmente
npm run dev
```

### 2. Build do Projeto

```bash
npm run build
```

### 3. Deploy via Netlify CLI

```bash
# Instalar Netlify CLI (se não tiver)
npm install -g netlify-cli

# Login no Netlify
netlify login

# Inicializar e fazer deploy
netlify init
netlify deploy --prod
```

### 4. Deploy via Interface Web

1. Acesse [netlify.com](https://netlify.com)
2. Clique em "Add new site" → "Import an existing project"
3. Conecte seu repositório Git
4. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Deploy!

## 🔧 Configuração do Supabase

### Variáveis de Ambiente
As credenciais já estão no código:
```javascript
const supabaseUrl = 'https://pjxvvhtsinqzjieiraff.supabase.co'
const supabaseAnonKey = 'sb_publishable_zIG8mavtXJxutTUQp5PlUg_LHwMun9I'
```

### RLS Policies (Já Configuradas)

#### profiles
```sql
-- Usuário vê apenas seu perfil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Admin vê todos os perfis
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

#### tarefas
```sql
-- Usuário vê apenas suas tarefas
CREATE POLICY "Users can view own tasks"
  ON tarefas FOR SELECT
  USING (created_by = auth.uid());

-- Admin vê todas as tarefas
CREATE POLICY "Admins can view all tasks"
  ON tarefas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Qualquer usuário pode criar tarefas
CREATE POLICY "Users can create tasks"
  ON tarefas FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Admin pode atualizar tarefas
CREATE POLICY "Admins can update tasks"
  ON tarefas FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Usuário pode atualizar suas próprias tarefas
CREATE POLICY "Users can update own tasks"
  ON tarefas FOR UPDATE
  USING (created_by = auth.uid());
```

## 📱 Interface

### Tela de Login
- Email e senha
- Validação de credenciais
- Feedback de erros

### Dashboard
**Abas:**
1. **Tarefas Ativas**: Lista de tarefas pendentes
2. **Arquivadas**: Tarefas concluídas
3. **Painel Admin** (só para admin): Estatísticas e gráficos

### Componentes Principais
- `Login.jsx`: Tela de autenticação
- `Dashboard.jsx`: Layout principal
- `TarefasAtivas.jsx`: Lista de tarefas ativas
- `TarefasArquivadas.jsx`: Lista de tarefas concluídas
- `ModalTarefa.jsx`: Criação/edição de tarefas
- `ModalConcluir.jsx`: Conclusão de tarefas com justificativa
- `PainelAdmin.jsx`: Estatísticas, gráficos e exportação

## 🔄 Fluxo de Trabalho

### Usuário Comum
1. Login → Dashboard
2. Visualiza suas tarefas na aba "Ativas"
3. Ao concluir uma tarefa:
   - Se **no prazo**: Marca como concluída
   - Se **atrasada**: Insere justificativa OU marca "não estava atrasada"
4. Tarefa vai para "Arquivadas"

### Administrador
1. Login → Dashboard
2. **Aba Ativas**: Cria, edita, exclui tarefas
3. **Aba Admin**:
   - Visualiza estatísticas
   - Analisa gráficos
   - Filtra por responsável
   - Exporta relatório Excel

## 📈 Métricas Calculadas

### Por Tarefa
- **No Prazo**: Concluída antes do prazo OU ativa sem atraso
- **Atrasada**: Concluída após o prazo OU ativa em atraso

### Por Responsável
- Total de tarefas
- Tarefas concluídas
- Tarefas ativas
- Quantidade no prazo
- Quantidade atrasada
- Percentual de cumprimento

## 🎨 Design

- Interface limpa e moderna
- Responsiva (mobile-friendly)
- Cores intuitivas:
  - 🔵 Azul: Ações principais
  - 🟢 Verde: Sucesso/Conclusão
  - 🔴 Vermelho: Atraso/Exclusão
  - 🟡 Amarelo: Avisos

## 📦 Estrutura de Arquivos

```
gerenciador-tarefas/
├── src/
│   ├── components/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── TarefasAtivas.jsx
│   │   ├── TarefasArquivadas.jsx
│   │   ├── ModalTarefa.jsx
│   │   ├── ModalConcluir.jsx
│   │   └── PainelAdmin.jsx
│   ├── hooks/
│   │   └── useAuth.js
│   ├── lib/
│   │   └── supabase.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── netlify.toml
```

## 🐛 Troubleshooting

### Erro de RLS
Se as policies não estiverem funcionando, verifique se:
1. As tabelas têm RLS habilitado: `ALTER TABLE tarefas ENABLE ROW LEVEL SECURITY;`
2. As policies estão criadas corretamente
3. O campo `created_by` está sendo preenchido com `auth.uid()`

### Erro de Autenticação
- Verifique se as credenciais do Supabase estão corretas
- Confirme que o usuário existe na tabela `auth.users`
- Verifique se existe um perfil correspondente em `profiles`

### Erro de Build
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📝 Notas Importantes

1. **Segurança**: Nunca use a `service_role_key` no frontend
2. **RLS**: Sempre mantenha as políticas de segurança ativas
3. **Autenticação**: O sistema depende do Supabase Auth
4. **Responsáveis**: A lista é gerada dinamicamente das tarefas existentes
5. **Prazo**: Se não houver hora definida, considera-se o final do dia

## 🚀 Próximas Melhorias

- [ ] Notificações em tempo real (Supabase Realtime)
- [ ] Upload de arquivos anexos
- [ ] Comentários em tarefas
- [ ] Histórico de alterações
- [ ] Dashboard com filtros avançados
- [ ] Integração com calendário
- [ ] Notificações por email

## 📄 Licença

Este projeto foi desenvolvido para controle interno de atividades.
