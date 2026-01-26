import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { enviarEmail, templateNovaTarefa } from '../lib/emailService'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function ModalTarefa({ tarefa, mode, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    descricao: '',
    responsavel: '',
    prazo_data: '',
    prazo_hora: '',
    priority: 'low',
    status: 'pendente'
  })
  const [loading, setLoading] = useState(false)
  const [responsaveis, setResponsaveis] = useState([])

  useEffect(() => {
    loadResponsaveis()
    
    if (mode === 'edit' && tarefa) {
      setFormData({
        descricao: tarefa.descricao || '',
        responsavel: tarefa.responsavel || '',
        prazo_data: tarefa.prazo_data || '',
        prazo_hora: tarefa.prazo_hora || '',
        priority: tarefa.priority || 'low',
        status: tarefa.status || 'pendente'
      })
    }
  }, [mode, tarefa])

  async function loadResponsaveis() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome')
        .eq('ativo', true)
        .order('nome')
      
      if (error) throw error
      setResponsaveis(data || [])
    } catch (error) {
      console.error('Erro ao carregar responsáveis:', error)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      const dados = {
        ...formData,
        prazo_hora: formData.prazo_hora || null,
        priority: formData.priority || 'low'
      }

      if (mode === 'create') {
        const { error } = await supabase
          .from('tarefas')
          .insert([dados])
        
        if (error) throw error

        // Enviar email para o responsável
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('nome, email')
            .eq('id', formData.responsavel)
            .single()
          
          if (profileData && profileData.email) {
            const prazoFormatado = formData.prazo_hora 
              ? `${format(new Date(formData.prazo_data), "dd/MM/yyyy", { locale: ptBR })} às ${formData.prazo_hora}`
              : `${format(new Date(formData.prazo_data), "dd/MM/yyyy", { locale: ptBR })} (fim do dia)`

            const htmlEmail = templateNovaTarefa({
              nomeResponsavel: profileData.nome,
              descricao: formData.descricao,
              prazo: prazoFormatado,
              prioridade: formData.priority
            })

            await enviarEmail({
              to: profileData.email,
              subject: '📋 Nova tarefa atribuída a você',
              html: htmlEmail
            })
          }
        } catch (emailError) {
          console.error('Erro ao enviar email:', emailError)
        }
      } else {
        const { error } = await supabase
          .from('tarefas')
          .update(dados)
          .eq('id', tarefa.id)
        
        if (error) throw error
      }

      onSuccess()
    } catch (error) {
      alert('Erro ao salvar tarefa: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8">
        {/* Header fixo */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === 'create' ? 'Nova Tarefa' : 'Editar Tarefa'}
          </h2>
        </div>

        {/* Conteúdo com scroll */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto">
            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição *
              </label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="2"
                required
              />
            </div>

            {/* Responsável */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Responsável *
              </label>
              <select
                value={formData.responsavel}
                onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Selecione um responsável</option>
                {responsaveis.map((resp) => (
                  <option key={resp.id} value={resp.id}>
                    {resp.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Data e Hora - Lado a lado */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data do Prazo *
                </label>
                <input
                  type="date"
                  value={formData.prazo_data}
                  onChange={(e) => setFormData({ ...formData, prazo_data: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora (opcional)
                </label>
                <input
                  type="time"
                  value={formData.prazo_hora}
                  onChange={(e) => setFormData({ ...formData, prazo_hora: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Prioridade e Status - Lado a lado */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridade
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">🟢 Baixa</option>
                  <option value="medium">🟡 Média</option>
                  <option value="high">🔴 Alta</option>
                </select>
              </div>

              {mode === 'edit' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="aguardando">Aguardando</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Footer fixo com botões */}
          <div className="flex gap-3 p-4 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
