import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function TarefasArquivadas({ tarefas, isAdmin }) {
  function formatarData(data) {
    if (!data) return '-'
    return format(parseISO(data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
  }

  return (
    <div>
      {tarefas.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">Nenhuma tarefa arquivada</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tarefas.map((tarefa) => (
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
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Concluída
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Responsável:</span> {tarefa.responsavel}
                    </p>
                    <p>
                      <span className="font-medium">Concluída em:</span>{' '}
                      {formatarData(tarefa.concluido_em)}
                    </p>
                    {tarefa.justificativa && (
                      <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                        <p className="font-medium text-yellow-800 mb-1">Justificativa:</p>
                        <p className="text-yellow-700 text-sm">{tarefa.justificativa}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
