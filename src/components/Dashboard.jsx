import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import TarefasAtivas from './TarefasAtivas'
import TarefasArquivadas from './TarefasArquivadas'
import PainelAdmin from './PainelAdmin'
import ModalTrocarSenha from './ModalTrocarSenha'

export default function Dashboard({ user, profile, isAdmin, onSignOut }) {
  const [activeTab, setActiveTab] = useState('ativas')
  const [tarefas, setTarefas] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalTrocarSenha, setModalTrocarSenha] = useState(false)
  const [filtroResponsavel, setFiltroResponsavel] = useState('todos')

  useEffect(() => {
    loadTarefas()
  }, [])

  async function loadTarefas() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('tarefas')
        .select(`
          *,
          profiles:responsavel (nome)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Adicionar o nome do responsável diretamente na tarefa
      const tarefasComNomes = (data || []).map(tarefa => ({
        ...tarefa,
        responsavel_nome: tarefa.profiles?.nome || 'Desconhecido'
      }))
      
      setTarefas(tarefasComNomes)
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error)
    } finally {
      setLoading(false)
    }
  }

  const tarefasAtivas = tarefas.filter(t => t.status !== 'concluido')
  const tarefasArquivadas = tarefas.filter(t => t.status === 'concluido')

  // Aplicar filtro de responsável
  const tarefasAtivasFiltradas = filtroResponsavel === 'todos' 
    ? tarefasAtivas 
    : tarefasAtivas.filter(t => t.responsavel === filtroResponsavel)

  const tarefasArquivadasFiltradas = filtroResponsavel === 'todos' 
    ? tarefasArquivadas 
    : tarefasArquivadas.filter(t => t.responsavel === filtroResponsavel)

  // Obter lista de responsáveis únicos
  const responsaveisUnicos = [...new Map(tarefas.map(t => [t.responsavel, t.responsavel_nome])).entries()]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gerenciador de Tarefas
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {profile?.nome} {isAdmin && <span className="text-blue-600">(Administrador)</span>}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setModalTrocarSenha(true)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              >
                🔒 Trocar Senha
              </button>
              <button
                onClick={onSignOut}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs com Filtro */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            {/* Tabs */}
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('ativas')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === 'ativas'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Tarefas Ativas ({tarefasAtivasFiltradas.length})
              </button>
              <button
                onClick={() => setActiveTab('arquivadas')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === 'arquivadas'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Arquivadas ({tarefasArquivadasFiltradas.length})
              </button>
              {isAdmin && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                    activeTab === 'admin'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Painel Admin
                </button>
              )}
            </nav>

            {/* Filtro (só para admin e não no painel admin) */}
            {isAdmin && activeTab !== 'admin' && (
              <div className="flex items-center gap-3 pb-2">
                <label className="text-sm text-gray-600">
                  Filtrar:
                </label>
                <select
                  value={filtroResponsavel}
                  onChange={(e) => setFiltroResponsavel(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="todos">Todas</option>
                  {responsaveisUnicos.map(([id, nome]) => (
                    <option key={id} value={id}>{nome}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Carregando...</p>
          </div>
        ) : (
          <>
            {activeTab === 'ativas' && (
              <TarefasAtivas
                tarefas={tarefasAtivasFiltradas}
                isAdmin={isAdmin}
                userId={user.id}
                onUpdate={loadTarefas}
              />
            )}
            {activeTab === 'arquivadas' && (
              <TarefasArquivadas
                tarefas={tarefasArquivadasFiltradas}
                isAdmin={isAdmin}
                onUpdate={loadTarefas}
              />
            )}
            {activeTab === 'admin' && isAdmin && (
              <PainelAdmin tarefas={tarefas} onUpdate={loadTarefas} />
            )}
          </>
        )}
      </div>

      {/* Modal Trocar Senha */}
      {modalTrocarSenha && (
        <ModalTrocarSenha onClose={() => setModalTrocarSenha(false)} />
      )}
    </div>
  )
}
