import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { format, parseISO, isPast, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import ModalTarefa from './ModalTarefa'
import ModalConcluir from './ModalConcluir'

export default function TarefasAtivas({ tarefas, isAdmin, userId, onUpdate }) {
  const [modalTarefa, setModalTarefa] = useState(null)
  const [modalConcluir, setModalConcluir] = useState(null)

  function calcularAtraso(tarefa) {
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

  function formatarPrazo(tarefa) {
    if (!tarefa.prazo_data) return 'Sem prazo'
    
    const data = format(parseISO(tarefa.prazo_data), "dd/MM/yyyy", { locale: ptBR })
    const hora = tarefa.prazo_hora || 'fim do dia'
    
    return `${data} às ${hora}`
  }

  async function handleExcluir(id) {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return
    
    try {
      const { error } = await supabase
        .from('tarefas')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      onUpdate()
    } catch (error) {
      alert('Erro ao excluir tarefa: ' + error.message)
    }
  }

  return (
    <div>
      {isAdmin && (
        <div className="mb-6">
          <button
            onClick={() => setModalTarefa({ mode: 'create' })}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            + Nova Tarefa
          </button>
        </div>
      )}

      {tarefas.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">Nenhuma tarefa ativa no momento</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tarefas.map((tarefa) => {
            const atrasada = calcularAtraso(tarefa)
            
            return (
              <div
                key={tarefa.id}
                className={`bg-white rounded-lg shadow p-6 ${
                  atrasada ? 'border-l-4 border-red-500' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {tarefa.descricao}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Responsável:</span> {tarefa.responsavel_nome}
                      </p>
                      <p>
                        <span className="font-medium">Prazo:</span>{' '}
                        <span className={atrasada ? 'text-red-600 font-medium' : ''}>
                          {formatarPrazo(tarefa)}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">Status:</span>{' '}
                        <span className="capitalize">{tarefa.status}</span>
                      </p>
                    </div>
                    {atrasada && (
                      <div className="mt-2 inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                        ATRASADA
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    {(tarefa.responsavel === userId || isAdmin) && (
                      <button
                        onClick={() => setModalConcluir(tarefa)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium"
                      >
                        Concluir
                      </button>
                    )}
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => setModalTarefa({ mode: 'edit', tarefa })}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleExcluir(tarefa.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm font-medium"
                        >
                          Excluir
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modalTarefa && (
        <ModalTarefa
          tarefa={modalTarefa.tarefa}
          mode={modalTarefa.mode}
          onClose={() => setModalTarefa(null)}
          onSuccess={() => {
            setModalTarefa(null)
            onUpdate()
          }}
        />
      )}

      {modalConcluir && (
        <ModalConcluir
          tarefa={modalConcluir}
          onClose={() => setModalConcluir(null)}
          onSuccess={() => {
            setModalConcluir(null)
            onUpdate()
          }}
        />
      )}
    </div>
  )
}
