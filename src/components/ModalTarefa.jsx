import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function ModalTarefa({ tarefa, mode, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    descricao: '',
    responsavel: '',
    prazo_data: '',
    prazo_hora: '',
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
        status: tarefa.status || 'pendente'
      })
    }
  }, [mode, tarefa])

  async function loadResponsaveis() {
    try {
      // Buscar todos os perfis ativos
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
        prazo_hora: formData.prazo_hora || null
      }

      if (mode === 'create') {
        const { error } = await supabase
          .from('tarefas')
          .insert([dados])
        
        if (error) throw error
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {mode === 'create' ? 'Nova Tarefa' : 'Editar Tarefa'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição *
            </label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hora do Prazo (opcional)
            </label>
            <input
              type="time"
              value={formData.prazo_hora}
              onChange={(e) => setFormData({ ...formData, prazo_hora: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Se não informar, considera-se fim do dia
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
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
