import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { parseISO, isPast, isToday } from 'date-fns'

export default function ModalConcluir({ tarefa, onClose, onSuccess }) {
  const [justificativa, setJustificativa] = useState('')
  const [naoEstaAtrasada, setNaoEstaAtrasada] = useState(false)
  const [loading, setLoading] = useState(false)

  function calcularAtraso() {
    if (!tarefa.prazo_data) return false
    
    const prazoDate = parseISO(tarefa.prazo_data)
    
    if (tarefa.prazo_hora) {
      const [hora, minuto] = tarefa.prazo_hora.split(':')
      prazoDate.setHours(parseInt(hora), parseInt(minuto))
    } else {
      prazoDate.setHours(23, 59, 59)
    }
    
    return isPast(prazoDate) && !isToday(prazoDate)
  }

  const atrasada = calcularAtraso()

  async function handleConcluir() {
    if (atrasada && !justificativa && !naoEstaAtrasada) {
      alert('Por favor, forneça uma justificativa ou marque que não estava atrasada')
      return
    }

    setLoading(true)

    try {
      const dados = {
        status: 'concluido',
        concluido_em: new Date().toISOString(),
      }

      if (atrasada && justificativa) {
        dados.justificativa = justificativa
      } else if (naoEstaAtrasada) {
        dados.justificativa = 'Usuário informou que não estava atrasada'
      }

      const { error } = await supabase
        .from('tarefas')
        .update(dados)
        .eq('id', tarefa.id)

      if (error) throw error

      onSuccess()
    } catch (error) {
      alert('Erro ao concluir tarefa: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Concluir Tarefa
        </h2>

        <div className="mb-6">
          <p className="text-gray-700 mb-2">
            <span className="font-medium">Descrição:</span> {tarefa.descricao}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Responsável:</span> {tarefa.responsavel}
          </p>
        </div>

        {atrasada && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Esta tarefa está atrasada. Por favor, forneça uma justificativa ou indique se não estava realmente atrasada.
                </p>
              </div>
            </div>
          </div>
        )}

        {atrasada && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Justificativa
              </label>
              <textarea
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                disabled={naoEstaAtrasada}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                rows="3"
                placeholder="Explique o motivo do atraso..."
              />
            </div>

            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={naoEstaAtrasada}
                  onChange={(e) => setNaoEstaAtrasada(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Esta tarefa não estava atrasada (esqueci de marcar como concluída)
                </span>
              </label>
            </div>
          </>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleConcluir}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
          >
            {loading ? 'Concluindo...' : 'Concluir'}
          </button>
        </div>
      </div>
    </div>
  )
}
