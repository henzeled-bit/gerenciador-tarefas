import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function ModalTarefa({ isOpen, onClose, tarefa, onSave }) {
  const [formData, setFormData] = useState({
    descricao: '',
    responsavel: '',
    prazo_data: '',
    prazo_hora: '',
    priority: 'low',
    status: 'pendente'
  });
  const [responsaveis, setResponsaveis] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tarefa) {
      setFormData({
        descricao: tarefa.descricao || '',
        responsavel: tarefa.responsavel || '',
        prazo_data: tarefa.prazo_data || '',
        prazo_hora: tarefa.prazo_hora || '',
        priority: tarefa.priority || 'low',
        status: tarefa.status || 'pendente'
      });
    } else {
      setFormData({
        descricao: '',
        responsavel: '',
        prazo_data: '',
        prazo_hora: '',
        priority: 'low',
        status: 'pendente'
      });
    }
  }, [tarefa]);

  useEffect(() => {
    if (isOpen) {
      carregarResponsaveis();
    }
  }, [isOpen]);

  const carregarResponsaveis = async () => {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('nome')
        .order('nome');

      if (profiles) {
        const uniqueResponsaveis = [...new Set(profiles.map(p => p.nome))];
        setResponsaveis(uniqueResponsaveis);
      }
    } catch (error) {
      console.error('Erro ao carregar responsáveis:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const tarefaData = {
        ...formData,
        prazo_hora: formData.prazo_hora || '23:59',
        priority: formData.priority || 'low',
        created_by: user.id
      };

      if (tarefa?.id) {
        // Atualizar tarefa existente
        const { error } = await supabase
          .from('tarefas')
          .update(tarefaData)
          .eq('id', tarefa.id);

        if (error) throw error;
      } else {
        // Criar nova tarefa
        const { error } = await supabase
          .from('tarefas')
          .insert([tarefaData]);

        if (error) throw error;
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
      alert('Erro ao salvar tarefa. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {tarefa ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {/* Título */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                placeholder="Ex: Revisar relatório mensal"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Responsável */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Responsável <span className="text-red-500">*</span>
              </label>
              <select
                name="responsavel"
                value={formData.responsavel}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecione um responsável</option>
                {responsaveis.map((resp) => (
                  <option key={resp} value={resp}>
                    {resp}
                  </option>
                ))}
              </select>
            </div>

            {/* Data e Hora */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Data do Prazo <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="prazo_data"
                  value={formData.prazo_data}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Hora do Prazo
                </label>
                <input
                  type="time"
                  name="prazo_hora"
                  value={formData.prazo_hora}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Padrão: fim do dia (23:59)
                </p>
              </div>
            </div>

            {/* Prioridade */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Prioridade
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">🟢 Baixa (padrão)</option>
                <option value="medium">🟡 Média</option>
                <option value="high">🔴 Alta</option>
              </select>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Salvando...' : tarefa ? 'Atualizar' : 'Criar Tarefa'}
          </button>
        </div>
      </div>
    </div>
  );
}
