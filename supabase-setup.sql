-- =====================================================
-- CONFIGURAÇÃO DO SUPABASE
-- Queries SQL para configurar as tabelas e políticas RLS
-- =====================================================

-- =====================================================
-- 1. HABILITAR ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarefas ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. POLÍTICAS RLS PARA TABELA PROFILES
-- =====================================================

-- Usuários podem ver apenas o próprio perfil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Admins podem ver todos os perfis
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins podem inserir novos perfis
CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins podem atualizar perfis
CREATE POLICY "Admins can update profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- 3. POLÍTICAS RLS PARA TABELA TAREFAS
-- =====================================================

-- Usuários podem ver suas próprias tarefas
CREATE POLICY "Users can view own tasks"
  ON tarefas FOR SELECT
  USING (created_by = auth.uid());

-- Admins podem ver todas as tarefas
CREATE POLICY "Admins can view all tasks"
  ON tarefas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Usuários autenticados podem criar tarefas
CREATE POLICY "Users can create tasks"
  ON tarefas FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Admins podem atualizar todas as tarefas
CREATE POLICY "Admins can update all tasks"
  ON tarefas FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Usuários podem atualizar suas próprias tarefas (para marcar como concluída)
CREATE POLICY "Users can update own tasks"
  ON tarefas FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Admins podem excluir tarefas
CREATE POLICY "Admins can delete tasks"
  ON tarefas FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- 4. FUNÇÃO PARA CRIAR PERFIL AUTOMATICAMENTE
-- =====================================================

-- Esta função cria automaticamente um perfil quando um usuário é criado
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, role, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para executar a função ao criar usuário
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 5. DADOS DE EXEMPLO (OPCIONAL)
-- =====================================================

-- Criar usuário admin de exemplo
-- IMPORTANTE: Este é apenas um exemplo. 
-- Na prática, você deve criar usuários via Supabase Auth UI ou API

-- Exemplo de estrutura de dados:
-- INSERT INTO profiles (id, nome, role) VALUES
-- ('uuid-do-usuario-admin', 'Admin Sistema', 'admin'),
-- ('uuid-do-usuario-comum', 'João Silva', 'user');

-- Exemplo de tarefas:
-- INSERT INTO tarefas (descricao, responsavel, prazo_data, prazo_hora, status, created_by) VALUES
-- ('Revisar relatório mensal', 'João Silva', '2024-01-20', '17:00', 'pendente', 'uuid-do-usuario-admin'),
-- ('Enviar documentos para cliente X', 'Maria Santos', '2024-01-22', NULL, 'pendente', 'uuid-do-usuario-admin'),
-- ('Fazer backup do sistema', 'Pedro Costa', '2024-01-18', '09:00', 'em_andamento', 'uuid-do-usuario-admin');

-- =====================================================
-- 6. QUERIES ÚTEIS PARA MANUTENÇÃO
-- =====================================================

-- Ver todos os perfis
SELECT * FROM profiles;

-- Ver todas as tarefas
SELECT * FROM tarefas ORDER BY created_at DESC;

-- Ver tarefas ativas (não concluídas)
SELECT * FROM tarefas WHERE status != 'concluido';

-- Ver tarefas concluídas
SELECT * FROM tarefas WHERE status = 'concluido';

-- Ver tarefas atrasadas (ajustar a data conforme necessário)
SELECT * FROM tarefas 
WHERE status != 'concluido' 
  AND prazo_data < CURRENT_DATE;

-- Estatísticas gerais
SELECT 
  COUNT(*) as total_tarefas,
  COUNT(CASE WHEN status = 'concluido' THEN 1 END) as concluidas,
  COUNT(CASE WHEN status != 'concluido' THEN 1 END) as ativas
FROM tarefas;

-- Desempenho por responsável
SELECT 
  responsavel,
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'concluido' THEN 1 END) as concluidas,
  COUNT(CASE WHEN status != 'concluido' THEN 1 END) as ativas
FROM tarefas
GROUP BY responsavel
ORDER BY total DESC;

-- =====================================================
-- 7. PERMISSÕES ADICIONAIS (SE NECESSÁRIO)
-- =====================================================

-- Garantir que os usuários possam acessar as funções necessárias
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- 8. VERIFICAR CONFIGURAÇÃO
-- =====================================================

-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'tarefas');

-- Listar todas as políticas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
