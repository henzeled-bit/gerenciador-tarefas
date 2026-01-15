import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { supabase } from '../lib/supabase'
import { useState } from 'react'

export default function TarefasArquivadas({ tarefas, isAdmin, onUpdate }) {
  const [loading, setLoading] = useState(false)

  function formatarData(data) {
    if (!data) return '-'
    return format(parseISO(data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
  }

  function calcularStatusDetalhado(tarefa) {
    if (!tarefa.prazo_data || !tarefa.concluido_em) {
      return { status: 'Concluída', cor: 'green' }
    }

    const prazoDate = new Date(tarefa.prazo_data)
    if (tarefa.prazo_hora) {
      const [hora, minuto] = tarefa.prazo_hora.split(':')
      prazoDate.setHours(parseInt(hora), parseInt(minuto))
    } else {
      prazoDate.setHours(23, 59, 59)
    }

    const concluidoDate = new Date(tarefa.concluido_em)

    // Concluída no prazo
    if (concluidoDate <= prazoDate) {
      return { status: 'Concluída no prazo', cor: 'green' }
    }

    // Concluída com atraso
    if (tarefa.justificativa) {
      if (tarefa.justificativa === 'Usuário informou que não estava atrasada') {
        return { status: 'Concluída no prazo', cor: 'green' }
      }
      return { status: 'Concluída com atraso justificado', cor: 'yellow' }
    }

    return { status: 'Concluída com atraso', cor: 'red' }
  }

  async function handleDesarquivar(tarefaId) {
    if (!confirm('Tem certeza que deseja desarquivar esta tarefa? Ela voltará para as tarefas ativas.')) {
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('tarefas')
        .update({
          status: 'pendente',
          concluido_em: null,
          justificativa: null
        })
        .eq('id', tarefaId)

      if (error) throw error
      
      onUpdate()
    } catch (error) {
      alert('Erro ao desarquivar tarefa: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {tarefas.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">Nenhuma tarefa arquivada</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tarefas.map((tarefa) => {
            const statusInfo = calcularStatusDetalhado(tarefa)
            const corBadge = statusInfo.cor === 'green' 
              ? 'bg-green-100 text-green-800'
              : statusInfo.cor === 'yellow'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'

            return (
              <div
                key={tarefa.id}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {tarefa.descricao}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${corBadge}`}>
                        {statusInfo.status}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Responsável:</span> {tarefa.responsavel_nome}
                      </p>
                      <p>
                        <span className="font-medium">Concluída em:</span>{' '}
                        {formatarData(tarefa.concluido_em)}
                      </p>
                      {tarefa.justificativa && tarefa.justificativa !== 'Usuário informou que não estava atrasada' && (
                        <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                          <p className="font-medium text-yellow-800 mb-1">Justificativa:</p>
                          <p className="text-yellow-700 text-sm">{tarefa.justificativa}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="ml-4">
                      <button
                        onClick={() => handleDesarquivar(tarefa.id)}
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50"
                      >
                        Desarquivar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
