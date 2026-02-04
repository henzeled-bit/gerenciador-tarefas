import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { supabase } from '../lib/supabase'
import { useState, useMemo } from 'react'

export default function TarefasArquivadas({ tarefas, isAdmin, onUpdate }) {
  const [loading, setLoading] = useState(false)
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos')
  const [filtroMesAno, setFiltroMesAno] = useState('todos')

  function formatarData(data) {
    if (!data) return '-'
    // Converter formato do Supabase para ISO com UTC (mesmo fix do formatarData)
    const dataISO = data.replace(' ', 'T') + 'Z'
    const date = new Date(dataISO)
    // Formatar para timezone do Brasil
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    }).replace(',', ' às')
  }

  function calcularStatusDetalhado(tarefa) {
    if (!tarefa.prazo_data || !tarefa.concluido_em) {
      return { status: 'Concluída', cor: 'green' }
    }

    const prazoDate = parseISO(tarefa.prazo_data)
    if (tarefa.prazo_hora) {
      const [hora, minuto] = tarefa.prazo_hora.split(':')
      prazoDate.setHours(parseInt(hora), parseInt(minuto), 0, 0)
    } else {
      prazoDate.setHours(23, 59, 59, 999)
    }

    // Converter formato do Supabase para ISO com UTC (mesmo fix do formatarData)
    const concluidoISO = tarefa.concluido_em.replace(' ', 'T') + 'Z'
    const concluidoDate = parseISO(concluidoISO)

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

  function getPrioridadeInfo(priority) {
    const prioridades = {
      high: { emoji: '🔴', texto: 'Alta' },
      medium: { emoji: '🟡', texto: 'Média' },
      low: { emoji: '🟢', texto: 'Baixa' }
    }
    return prioridades[priority] || prioridades.low
  }

  // Obter meses disponíveis
  const mesesDisponiveis = useMemo(() => {
    const meses = new Set()
    
    tarefas.forEach(tarefa => {
      if (tarefa.concluido_em) {
        const data = new Date(tarefa.concluido_em.replace(' ', 'T') + 'Z')
        const mes = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
        meses.add(mes)
      }
    })
    
    return Array.from(meses).sort().reverse()
  }, [tarefas])

  // Formatar mês para exibição
  function formatarMes(mesAno) {
    const [ano, mes] = mesAno.split('-')
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    return `${meses[parseInt(mes) - 1]}/${ano}`
  }

  // Filtrar tarefas por período
  const tarefasFiltradas = useMemo(() => {
    const agora = new Date()
    
    // Se selecionou mês específico
    if (filtroMesAno !== 'todos') {
      const [ano, mes] = filtroMesAno.split('-')
      return tarefas.filter(t => {
        if (!t.concluido_em) return false
        const data = new Date(t.concluido_em.replace(' ', 'T') + 'Z')
        return data.getFullYear() === parseInt(ano) && data.getMonth() === parseInt(mes) - 1
      })
    }
    
    // Filtros de período (atalhos)
    switch(filtroPeriodo) {
      case 'todos':
        return tarefas
      
      case 'este_mes':
        return tarefas.filter(t => {
          if (!t.concluido_em) return false
          const data = new Date(t.concluido_em.replace(' ', 'T') + 'Z')
          return data.getMonth() === agora.getMonth() && data.getFullYear() === agora.getFullYear()
        })
      
      case 'mes_passado':
        const mesPassado = new Date(agora.getFullYear(), agora.getMonth() - 1, 1)
        return tarefas.filter(t => {
          if (!t.concluido_em) return false
          const data = new Date(t.concluido_em.replace(' ', 'T') + 'Z')
          return data.getMonth() === mesPassado.getMonth() && data.getFullYear() === mesPassado.getFullYear()
        })
      
      case 'ultimos_3':
        const tres = new Date(agora.getFullYear(), agora.getMonth() - 3, 1)
        return tarefas.filter(t => {
          if (!t.concluido_em) return false
          const data = new Date(t.concluido_em.replace(' ', 'T') + 'Z')
          return data >= tres
        })
      
      case 'ultimos_6':
        const seis = new Date(agora.getFullYear(), agora.getMonth() - 6, 1)
        return tarefas.filter(t => {
          if (!t.concluido_em) return false
          const data = new Date(t.concluido_em.replace(' ', 'T') + 'Z')
          return data >= seis
        })
      
      case 'este_ano':
        return tarefas.filter(t => {
          if (!t.concluido_em) return false
          const data = new Date(t.concluido_em.replace(' ', 'T') + 'Z')
          return data.getFullYear() === agora.getFullYear()
        })
      
      default:
        return tarefas
    }
  }, [tarefas, filtroPeriodo, filtroMesAno])

  // Sincronizar dropdowns
  function handlePeriodoChange(valor) {
    setFiltroPeriodo(valor)
    if (valor !== 'customizado') {
      setFiltroMesAno('todos')
    }
  }

  function handleMesAnoChange(valor) {
    setFiltroMesAno(valor)
    if (valor !== 'todos') {
      setFiltroPeriodo('customizado')
    } else {
      setFiltroPeriodo('todos')
    }
  }

  async function desarquivar(id) {
    if (!confirm('Tem certeza que deseja desarquivar esta tarefa?')) return
    
    setLoading(true)
    try {
      const { error } = await supabase
        .from('tarefas')
        .update({ 
          status: 'pendente',
          concluido_em: null,
          justificativa: null
        })
        .eq('id', id)
      
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
      {/* Filtros de Período */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">
            Filtros:
          </label>
          
          {/* Dropdown Período */}
          <select
            value={filtroPeriodo}
            onChange={(e) => handlePeriodoChange(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todos">Todo o período</option>
            <option value="este_mes">Este mês</option>
            <option value="mes_passado">Mês passado</option>
            <option value="ultimos_3">Últimos 3 meses</option>
            <option value="ultimos_6">Últimos 6 meses</option>
            <option value="este_ano">Este ano</option>
            <option value="customizado">Customizado</option>
          </select>

          {/* Dropdown Mês/Ano */}
          <select
            value={filtroMesAno}
            onChange={(e) => handleMesAnoChange(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={filtroPeriodo !== 'customizado' && filtroPeriodo !== 'todos'}
          >
            <option value="todos">Todos os meses</option>
            {mesesDisponiveis.map(mes => (
              <option key={mes} value={mes}>{formatarMes(mes)}</option>
            ))}
          </select>

          <span className="text-sm text-gray-500">
            ({tarefasFiltradas.length} tarefas)
          </span>
        </div>
      </div>

      {/* Lista de Tarefas */}
      {tarefasFiltradas.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">Nenhuma tarefa concluída neste período</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tarefasFiltradas.map((tarefa) => {
            const statusInfo = calcularStatusDetalhado(tarefa)
            const prioridade = getPrioridadeInfo(tarefa.priority)
            
            return (
              <div key={tarefa.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{prioridade.emoji}</span>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {tarefa.descricao}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        statusInfo.cor === 'green' ? 'bg-green-100 text-green-800' :
                        statusInfo.cor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {statusInfo.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      Responsável: <span className="font-medium">{tarefa.responsavel_nome}</span>
                    </p>
                    
                    <p className="text-sm text-gray-600">
                      Concluída em: <span className="font-medium">{formatarData(tarefa.concluido_em)}</span>
                    </p>

                    {tarefa.justificativa && (
                      <div className="mt-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                        <p className="text-sm text-yellow-800">
                          <strong>Justificativa:</strong> {tarefa.justificativa}
                        </p>
                      </div>
                    )}
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => desarquivar(tarefa.id)}
                      disabled={loading}
                      className="ml-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      Desarquivar
                    </button>
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
