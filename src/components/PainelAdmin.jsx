import { useState, useMemo } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import * as XLSX from 'xlsx'
import { parseISO, isPast, isToday } from 'date-fns'

const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b']

export default function PainelAdmin({ tarefas, onUpdate }) {
  const [filtroResponsavel, setFiltroResponsavel] = useState('todos')
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos')
  const [filtroMesAno, setFiltroMesAno] = useState('todos')

  // Obter meses disponíveis
  const mesesDisponiveis = useMemo(() => {
    const meses = new Set()
    tarefas.forEach(tarefa => {
      if (tarefa.created_at) {
        try {
          const data = new Date(tarefa.created_at.replace(' ', 'T') + 'Z')
          if (!isNaN(data.getTime())) {
            const mes = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
            meses.add(mes)
          }
        } catch (e) {
          // Ignora datas inválidas
        }
      }
      if (tarefa.concluido_em) {
        try {
          const data = new Date(tarefa.concluido_em.replace(' ', 'T') + 'Z')
          if (!isNaN(data.getTime())) {
            const mes = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
            meses.add(mes)
          }
        } catch (e) {
          // Ignora datas inválidas
        }
      }
      if (tarefa.prazo_data) {
        try {
          const data = new Date(tarefa.prazo_data + 'T00:00:00')
          if (!isNaN(data.getTime())) {
            const mes = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
            meses.add(mes)
          }
        } catch (e) {
          // Ignora datas inválidas
        }
      }
    })
    return Array.from(meses).sort().reverse()
  }, [tarefas])

  // Formatar mês
  function formatarMes(mesAno) {
    const [ano, mes] = mesAno.split('-')
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    return `${meses[parseInt(mes) - 1]}/${ano}`
  }

  // Filtrar tarefas
  const tarefasFiltradas = useMemo(() => {
    let resultado = tarefas
    if (filtroResponsavel !== 'todos') {
      resultado = resultado.filter(t => t.responsavel === filtroResponsavel)
    }
    const agora = new Date()
    if (filtroMesAno !== 'todos') {
      const [ano, mes] = filtroMesAno.split('-')
      resultado = resultado.filter(t => {
        // Para tarefas concluídas: usar data de conclusão
        if (t.status === 'concluido' && t.concluido_em) {
          const dataConclusao = new Date(t.concluido_em.replace(' ', 'T') + 'Z')
          return dataConclusao.getFullYear() === parseInt(ano) && dataConclusao.getMonth() === parseInt(mes) - 1
        }
        // Para tarefas ativas: usar data de prazo
        if (t.status !== 'concluido' && t.prazo_data) {
          const dataPrazo = new Date(t.prazo_data + 'T00:00:00')
          return dataPrazo.getFullYear() === parseInt(ano) && dataPrazo.getMonth() === parseInt(mes) - 1
        }
        return false
      })
    } else if (filtroPeriodo !== 'todos') {
      switch(filtroPeriodo) {
        case 'este_mes':
          resultado = resultado.filter(t => {
            if (t.status === 'concluido' && t.concluido_em) {
              const data = new Date(t.concluido_em.replace(' ', 'T') + 'Z')
              return data.getMonth() === agora.getMonth() && data.getFullYear() === agora.getFullYear()
            }
            if (t.status !== 'concluido' && t.prazo_data) {
              const data = new Date(t.prazo_data + 'T00:00:00')
              return data.getMonth() === agora.getMonth() && data.getFullYear() === agora.getFullYear()
            }
            return false
          })
          break
        case 'mes_passado':
          const mesPassado = new Date(agora.getFullYear(), agora.getMonth() - 1, 1)
          resultado = resultado.filter(t => {
            if (t.status === 'concluido' && t.concluido_em) {
              const data = new Date(t.concluido_em.replace(' ', 'T') + 'Z')
              return data.getMonth() === mesPassado.getMonth() && data.getFullYear() === mesPassado.getFullYear()
            }
            if (t.status !== 'concluido' && t.prazo_data) {
              const data = new Date(t.prazo_data + 'T00:00:00')
              return data.getMonth() === mesPassado.getMonth() && data.getFullYear() === mesPassado.getFullYear()
            }
            return false
          })
          break
        case 'ultimos_3':
          const tres = new Date(agora.getFullYear(), agora.getMonth() - 3, 1)
          resultado = resultado.filter(t => {
            if (t.status === 'concluido' && t.concluido_em) {
              const data = new Date(t.concluido_em.replace(' ', 'T') + 'Z')
              return data >= tres
            }
            if (t.status !== 'concluido' && t.prazo_data) {
              const data = new Date(t.prazo_data + 'T00:00:00')
              return data >= tres
            }
            return false
          })
          break
        case 'ultimos_6':
          const seis = new Date(agora.getFullYear(), agora.getMonth() - 6, 1)
          resultado = resultado.filter(t => {
            if (t.status === 'concluido' && t.concluido_em) {
              const data = new Date(t.concluido_em.replace(' ', 'T') + 'Z')
              return data >= seis
            }
            if (t.status !== 'concluido' && t.prazo_data) {
              const data = new Date(t.prazo_data + 'T00:00:00')
              return data >= seis
            }
            return false
          })
          break
        case 'este_ano':
          resultado = resultado.filter(t => {
            if (t.status === 'concluido' && t.concluido_em) {
              const data = new Date(t.concluido_em.replace(' ', 'T') + 'Z')
              return data.getFullYear() === agora.getFullYear()
            }
            if (t.status !== 'concluido' && t.prazo_data) {
              const data = new Date(t.prazo_data + 'T00:00:00')
              return data.getFullYear() === agora.getFullYear()
            }
            return false
          })
          break
      }
    }
    return resultado
  }, [tarefas, filtroResponsavel, filtroPeriodo, filtroMesAno])

  function handlePeriodoChange(valor) {
    setFiltroPeriodo(valor)
    if (valor !== 'customizado') setFiltroMesAno('todos')
  }

  function handleMesAnoChange(valor) {
    setFiltroMesAno(valor)
    setFiltroPeriodo(valor !== 'todos' ? 'customizado' : 'todos')
  }

  // Calcular estatísticas
  const stats = useMemo(() => {
    const total = tarefasFiltradas.length
    const concluidas = tarefasFiltradas.filter(t => t.status === 'concluido').length
    const ativas = total - concluidas
    let noPrazo = 0
    let atrasadas = 0
    tarefasFiltradas.forEach(tarefa => {
      if (tarefa.status === 'concluido') {
        if (tarefa.prazo_data && tarefa.concluido_em) {
          const prazoDate = parseISO(tarefa.prazo_data)
          if (tarefa.prazo_hora) {
            const [hora, minuto] = tarefa.prazo_hora.split(':')
            prazoDate.setHours(parseInt(hora), parseInt(minuto), 0, 0)
          } else {
            prazoDate.setHours(23, 59, 59, 999)
          }
          const concluidoISO = tarefa.concluido_em.replace(' ', 'T') + 'Z'
          const concluidoDate = parseISO(concluidoISO)
          if (concluidoDate <= prazoDate || tarefa.justificativa === 'Usuário informou que não estava atrasada') {
            noPrazo++
          } else {
            atrasadas++
          }
        }
      } else {
        if (tarefa.prazo_data) {
          const prazoDate = parseISO(tarefa.prazo_data)
          if (tarefa.prazo_hora) {
            const [hora, minuto] = tarefa.prazo_hora.split(':')
            prazoDate.setHours(parseInt(hora), parseInt(minuto))
          } else {
            prazoDate.setHours(23, 59, 59)
          }
          if (isPast(prazoDate) && !isToday(prazoDate)) {
            atrasadas++
          } else {
            noPrazo++
          }
        }
      }
    })
    const percentualNoPrazo = total > 0 ? ((noPrazo / total) * 100).toFixed(1) : 0
    const percentualAtrasadas = total > 0 ? ((atrasadas / total) * 100).toFixed(1) : 0
    return { total, concluidas, ativas, noPrazo, atrasadas, percentualNoPrazo, percentualAtrasadas }
  }, [tarefasFiltradas])

  // Evolução mensal (últimos 12 meses)
  const dadosEvolucao = useMemo(() => {
    const agora = new Date()
    const dados = []
    for (let i = 11; i >= 0; i--) {
      const mes = new Date(agora.getFullYear(), agora.getMonth() - i, 1)
      const mesAno = `${mes.getFullYear()}-${String(mes.getMonth() + 1).padStart(2, '0')}`
      const tarefasDoMes = tarefas.filter(t => {
        if (!t.concluido_em) return false
        const data = new Date(t.concluido_em.replace(' ', 'T') + 'Z')
        return data.getFullYear() === mes.getFullYear() && data.getMonth() === mes.getMonth()
      })
      let noPrazoMes = 0
      let totalMes = 0
      tarefasDoMes.forEach(tarefa => {
        if (tarefa.prazo_data && tarefa.concluido_em) {
          totalMes++
          const prazoDate = parseISO(tarefa.prazo_data)
          if (tarefa.prazo_hora) {
            const [hora, minuto] = tarefa.prazo_hora.split(':')
            prazoDate.setHours(parseInt(hora), parseInt(minuto), 0, 0)
          } else {
            prazoDate.setHours(23, 59, 59, 999)
          }
          const concluidoISO = tarefa.concluido_em.replace(' ', 'T') + 'Z'
          const concluidoDate = parseISO(concluidoISO)
          if (concluidoDate <= prazoDate || tarefa.justificativa === 'Usuário informou que não estava atrasada') {
            noPrazoMes++
          }
        }
      })
      dados.push({
        mes: formatarMes(mesAno),
        percentual: totalMes > 0 ? parseFloat(((noPrazoMes / totalMes) * 100).toFixed(1)) : 0
      })
    }
    return dados
  }, [tarefas])

  // Dados por responsável
  const dadosPorResponsavel = useMemo(() => {
    const responsaveis = {}
    tarefasFiltradas.forEach(tarefa => {
      if (!responsaveis[tarefa.responsavel]) {
        responsaveis[tarefa.responsavel] = {
          nome: tarefa.responsavel_nome || tarefa.responsavel,
          total: 0, concluidas: 0, ativas: 0, noPrazo: 0, atrasadas: 0
        }
      }
      const resp = responsaveis[tarefa.responsavel]
      resp.total++
      if (tarefa.status === 'concluido') {
        resp.concluidas++
        if (tarefa.prazo_data && tarefa.concluido_em) {
          const prazoDate = parseISO(tarefa.prazo_data)
          if (tarefa.prazo_hora) {
            const [hora, minuto] = tarefa.prazo_hora.split(':')
            prazoDate.setHours(parseInt(hora), parseInt(minuto), 0, 0)
          } else {
            prazoDate.setHours(23, 59, 59, 999)
          }
          const concluidoISO = tarefa.concluido_em.replace(' ', 'T') + 'Z'
          const concluidoDate = parseISO(concluidoISO)
          if (concluidoDate <= prazoDate || tarefa.justificativa === 'Usuário informou que não estava atrasada') {
            resp.noPrazo++
          } else {
            resp.atrasadas++
          }
        }
      } else {
        resp.ativas++
        if (tarefa.prazo_data) {
          const prazoDate = parseISO(tarefa.prazo_data)
          if (tarefa.prazo_hora) {
            const [hora, minuto] = tarefa.prazo_hora.split(':')
            prazoDate.setHours(parseInt(hora), parseInt(minuto))
          } else {
            prazoDate.setHours(23, 59, 59)
          }
          if (isPast(prazoDate) && !isToday(prazoDate)) {
            resp.atrasadas++
          } else {
            resp.noPrazo++
          }
        }
      }
    })
    return Object.values(responsaveis)
  }, [tarefasFiltradas])

  const dadosStatus = [
    { name: 'Concluídas', value: stats.concluidas },
    { name: 'Ativas', value: stats.ativas }
  ]

  const dadosPrazo = [
    { name: 'No Prazo', value: stats.noPrazo },
    { name: 'Atrasadas', value: stats.atrasadas }
  ]

  const responsaveisUnicos = useMemo(() => {
    const map = new Map()
    tarefas.forEach(t => {
      if (!map.has(t.responsavel)) {
        map.set(t.responsavel, t.responsavel_nome || t.responsavel)
      }
    })
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]))
  }, [tarefas])

  function calcularStatusDetalhado(tarefa) {
    if (tarefa.status !== 'concluido') return tarefa.status
    if (!tarefa.prazo_data || !tarefa.concluido_em) return 'Concluída'
    const prazoDate = parseISO(tarefa.prazo_data)
    if (tarefa.prazo_hora) {
      const [hora, minuto] = tarefa.prazo_hora.split(':')
      prazoDate.setHours(parseInt(hora), parseInt(minuto), 0, 0)
    } else {
      prazoDate.setHours(23, 59, 59, 999)
    }
    const concluidoISO = tarefa.concluido_em.replace(' ', 'T') + (tarefa.concluido_em.includes('Z') ? '' : 'Z')
    const concluidoDate = parseISO(concluidoISO)
    if (concluidoDate <= prazoDate) return 'Concluída no prazo'
    if (tarefa.justificativa) {
      if (tarefa.justificativa === 'Usuário informou que não estava atrasada') return 'Concluída no prazo'
      return 'Concluída com atraso justificado'
    }
    return 'Concluída com atraso'
  }

  function formatarDataExcel(data) {
    if (!data || data === '-') return '-'
    const dataISO = data.replace(' ', 'T') + (data.includes('Z') || data.includes('+') ? '' : 'Z')
    const date = new Date(dataISO)
    return date.toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo'
    })
  }

  function exportarExcel() {
    const dadosExport = tarefas.map(t => ({
      'Descrição': t.descricao,
      'Responsável': t.responsavel_nome || t.responsavel,
      'Data Prazo': t.prazo_data || '-',
      'Hora Prazo': t.prazo_hora || '-',
      'Prioridade': t.priority === 'high' ? 'Alta' : t.priority === 'medium' ? 'Média' : 'Baixa',
      'Status': calcularStatusDetalhado(t),
      'Criada em': formatarDataExcel(t.created_at),
      'Concluída em': t.concluido_em ? formatarDataExcel(t.concluido_em) : '-',
      'Justificativa': t.justificativa || '-'
    }))
    const ws = XLSX.utils.json_to_sheet(dadosExport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Tarefas")
    const indicadores = [
      { Indicador: 'Total de Tarefas', Valor: stats.total },
      { Indicador: 'Tarefas Concluídas', Valor: stats.concluidas },
      { Indicador: 'Tarefas Ativas', Valor: stats.ativas },
      { Indicador: 'No Prazo', Valor: `${stats.noPrazo} (${stats.percentualNoPrazo}%)` },
      { Indicador: 'Atrasadas', Valor: `${stats.atrasadas} (${stats.percentualAtrasadas}%)` }
    ]
    const wsIndicadores = XLSX.utils.json_to_sheet(indicadores)
    XLSX.utils.book_append_sheet(wb, wsIndicadores, "Indicadores")
    const desempenho = dadosPorResponsavel.map(r => ({
      'Responsável': r.nome,
      'Total': r.total,
      'Concluídas': r.concluidas,
      'Ativas': r.ativas,
      'No Prazo': r.noPrazo,
      'Atrasadas': r.atrasadas,
      '% No Prazo': r.total > 0 ? `${((r.noPrazo / r.total) * 100).toFixed(1)}%` : '0%'
    }))
    const wsDesempenho = XLSX.utils.json_to_sheet(desempenho)
    XLSX.utils.book_append_sheet(wb, wsDesempenho, "Desempenho")
    XLSX.writeFile(wb, `relatorio-tarefas-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Responsável</label>
              <select
                value={filtroResponsavel}
                onChange={(e) => setFiltroResponsavel(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos</option>
                {responsaveisUnicos.map(([id, nome]) => (
                  <option key={id} value={id}>{nome}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
              <select
                value={filtroPeriodo}
                onChange={(e) => handlePeriodoChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todo o período</option>
                <option value="este_mes">Este mês</option>
                <option value="mes_passado">Mês passado</option>
                <option value="ultimos_3">Últimos 3 meses</option>
                <option value="ultimos_6">Últimos 6 meses</option>
                <option value="este_ano">Este ano</option>
                <option value="customizado">Customizado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mês/Ano</label>
              <select
                value={filtroMesAno}
                onChange={(e) => handleMesAnoChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={filtroPeriodo !== 'customizado' && filtroPeriodo !== 'todos'}
              >
                <option value="todos">Todos os meses</option>
                {mesesDisponiveis.map(mes => (
                  <option key={mes} value={mes}>{formatarMes(mes)}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={exportarExcel}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-medium"
          >
            📊 Exportar Excel
          </button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Total de Tarefas</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Concluídas</p>
          <p className="text-3xl font-bold text-green-600">{stats.concluidas}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Ativas</p>
          <p className="text-3xl font-bold text-blue-600">{stats.ativas}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">No Prazo</p>
          <p className="text-3xl font-bold text-green-600">{stats.percentualNoPrazo}%</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Atrasadas</p>
          <p className="text-3xl font-bold text-red-600">{stats.percentualAtrasadas}%</p>
        </div>
      </div>

      {/* Gráfico de Evolução Mensal */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolução Mensal (% no Prazo)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dadosEvolucao}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="percentual" stroke="#10b981" strokeWidth={2} name="% No Prazo" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status das Tarefas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dadosStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {dadosStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cumprimento de Prazo</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dadosPrazo}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {dadosPrazo.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.name === 'No Prazo' ? '#10b981' : '#ef4444'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de barras por responsável */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Desempenho por Responsável</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={dadosPorResponsavel}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nome" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="concluidas" fill="#10b981" name="Concluídas" />
            <Bar dataKey="ativas" fill="#3b82f6" name="Ativas" />
            <Bar dataKey="atrasadas" fill="#ef4444" name="Atrasadas" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabela de desempenho detalhado */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Desempenho Detalhado</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsável</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concluídas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ativas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No Prazo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Atrasadas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% No Prazo</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dadosPorResponsavel.map((resp) => (
                <tr key={resp.nome}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{resp.nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{resp.total}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{resp.concluidas}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{resp.ativas}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{resp.noPrazo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{resp.atrasadas}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {resp.total > 0 ? `${((resp.noPrazo / resp.total) * 100).toFixed(1)}%` : '0%'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
