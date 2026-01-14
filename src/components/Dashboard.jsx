import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import TarefasAtivas from './TarefasAtivas'
import TarefasArquivadas from './TarefasArquivadas'
import PainelAdmin from './PainelAdmin'

export default function Dashboard({ user, profile, isAdmin, onSignOut }) {
  const [activeTab, setActiveTab] = useState('ativas')
  const [tarefas, setTarefas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTarefas()
  }, [])

  async function loadTarefas() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('tarefas')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTarefas(data || [])
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error)
    } finally {
      setLoading(false)
    }
  }

  const tarefasAtivas = tarefas.filter(t => t.status !== 'concluido')
  const tarefasArquivadas = tarefas.filter(t => t.status === 'concluido')

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
            <button
              onClick={onSignOut}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('ativas')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'ativas'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tarefas Ativas ({tarefasAtivas.length})
            </button>
            <button
              onClick={() => setActiveTab('arquivadas')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'arquivadas'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Arquivadas ({tarefasArquivadas.length})
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
                tarefas={tarefasAtivas}
                isAdmin={isAdmin}
                userId={user.id}
                onUpdate={loadTarefas}
              />
            )}
            {activeTab === 'arquivadas' && (
              <TarefasArquivadas
                tarefas={tarefasArquivadas}
                isAdmin={isAdmin}
              />
            )}
            {activeTab === 'admin' && isAdmin && (
              <PainelAdmin tarefas={tarefas} onUpdate={loadTarefas} />
            )}
          </>
        )}
      </div>
    </div>
  )
}
