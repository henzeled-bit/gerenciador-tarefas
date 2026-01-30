import { useState, useMemo } from 'react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import * as XLSX from 'xlsx'
import { parseISO, isPast, isToday } from 'date-fns'

const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b']

export default function PainelAdmin({ tarefas, onUpdate }) {
  const [filtroResponsavel, setFiltroResponsavel] = useState('todos')

  // Calcular estatísticas
  const stats = useMemo(() => {
    const tarefasFiltradas = filtroResponsavel === 'todos' 
      ? tarefas 
      : tarefas.filter(t => t.responsavel === filtroResponsavel)

    const total = tarefasFiltradas.length
    const concluidas = tarefasFiltradas.filter(t => t.status === 'concluido').length
    const ativas = total - concluidas

    // Calcular atrasos
    let noPrazo = 0
    let atrasadas = 0

    tarefasFiltradas.forEach(tarefa => {
      if (tarefa.status === 'concluido') {
        // Verificar se foi concluída no prazo
        if (tarefa.prazo_data && tarefa.concluido_em) {
          const prazoDate = parseISO(tarefa.prazo_data)
          if (tarefa.prazo_hora) {
            const [hora, minuto] = tarefa.prazo_hora.split(':')
            prazoDate.setHours(parseInt(hora), parseInt(minuto), 0, 0)
          } else {
            prazoDate.setHours(23, 59, 59, 999)
          }
          
          // Converter formato do Supabase para ISO com UTC
          const concluidoISO = tarefa.concluido_em.replace(' ', 'T') + 'Z'
          const concluidoDate = parseISO(concluidoISO)
          
          // Verificar se foi no prazo OU se tem justificativa dizendo que não estava atrasada
          if (concluidoDate <= prazoDate || tarefa.justificativa === 'Usuário informou que não estava atrasada') {
            noPrazo++
          } else {
            atrasadas++
          }
        }
      } else {
        // Tarefa ativa: verificar se está atrasada
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

    return {
      total,
      concluidas,
      ativas,
      noPrazo,
      atrasadas,
      percentualNoPrazo,
      percentualAtrasadas
    }
  }, [tarefas, filtroResponsavel])

  // Dados por responsável
  const dadosPorResponsavel = useMemo(() => {
    const responsaveis = {}

    tarefas.forEach(tarefa => {
      if (!responsaveis[tarefa.responsavel]) {
        responsaveis[tarefa.responsavel] = {
          nome: tarefa.responsavel_nome || tarefa.responsavel,
          total: 0,
          concluidas: 0,
          ativas: 0,
          noPrazo: 0,
          atrasadas: 0
        }
      }

      const resp = responsaveis[tarefa.responsavel]
      resp.total++

      if (tarefa.status === 'concluido') {
        resp.concluidas++
        
        // Verificar se foi no prazo
        if (tarefa.prazo_data && tarefa.concluido_em) {
          const prazoDate = parseISO(tarefa.prazo_data)
          if (tarefa.prazo_hora) {
            const [hora, minuto] = tarefa.prazo_hora.split(':')
            prazoDate.setHours(parseInt(hora), parseInt(minuto), 0, 0)
          } else {
            prazoDate.setHours(23, 59, 59, 999)
          }
          
          // Converter formato do Supabase para ISO com UTC
          const concluidoISO = tarefa.concluido_em.replace(' ', 'T') + 'Z'
          const concluidoDate = parseISO(concluidoISO)
          
          // Verificar se foi no prazo OU se tem justificativa dizendo que não estava atrasada
          if (concluidoDate <= prazoDate || tarefa.justificativa === 'Usuário informou que não estava atrasada') {
            resp.noPrazo++
          } else {
            resp.atrasadas++
          }
        }
      } else {
        resp.ativas++
        
        // Verificar se está atrasada
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
  }, [tarefas])

  // Dados para gráfico de pizza (status)
  const dadosStatus = [
    { name: 'Concluídas', value: stats.concluidas },
    { name: 'Ativas', value: stats.ativas }
  ]

  // Dados para gráfico de pizza (prazo)
  const dadosPrazo = [
    { name: 'No Prazo', value: stats.noPrazo },
    { name: 'Atrasadas', value: stats.atrasadas }
  ]

  // Lista de responsáveis para filtro
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
    if (tarefa.status !== 'concluido') {
      return tarefa.status
    }

    if (!tarefa.prazo_data || !tarefa.concluido_em) {
      return 'Concluída'
    }

    const prazoDate = parseISO(tarefa.prazo_data)
    if (tarefa.prazo_hora) {
      const [hora, minuto] = tarefa.prazo_hora.split(':')
      prazoDate.setHours(parseInt(hora), parseInt(minuto), 0, 0)
    } else {
      prazoDate.setHours(23, 59, 59, 999)
    }

    // Converter formato do Supabase para ISO com UTC
    const concluidoISO = tarefa.concluido_em.replace(' ', 'T') + (tarefa.concluido_em.includes('Z') ? '' : 'Z')
    const concluidoDate = parseISO(concluidoISO)

    if (concluidoDate <= prazoDate) {
      return 'Concluída no prazo'
    }

    if (tarefa.justificativa) {
      if (tarefa.justificativa === 'Usuário informou que não estava atrasada') {
        return 'Concluída no prazo'
      }
      return 'Concluída com atraso justificado'
    }

    return 'Concluída com atraso'
  }

  function formatarDataExcel(data) {
    if (!data || data === '-') return '-'
    // Converter formato do Supabase para exibição
    const dataISO = data.replace(' ', 'T') + (data.includes('Z') || data.includes('+') ? '' : 'Z')
    const date = new Date(dataISO)
    // Formatar para timezone local do Brasil
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    })
  }

  function exportarExcel() {
    // Preparar dados
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

    // Criar planilha
    const ws = XLSX.utils.json_to_sheet(dadosExport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Tarefas")

    // Adicionar planilha de indicadores
    const indicadores = [
      { Indicador: 'Total de Tarefas', Valor: stats.total },
      { Indicador: 'Tarefas Concluídas', Valor: stats.concluidas },
      { Indicador: 'Tarefas Ativas', Valor: stats.ativas },
      { Indicador: 'No Prazo', Valor: `${stats.noPrazo} (${stats.percentualNoPrazo}%)` },
      { Indicador: 'Atrasadas', Valor: `${stats.atrasadas} (${stats.percentualAtrasadas}%)` }
    ]
    const wsIndicadores = XLSX.utils.json_to_sheet(indicadores)
    XLSX.utils.book_append_sheet(wb, wsIndicadores, "Indicadores")

    // Adicionar desempenho por responsável
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

    // Exportar
    XLSX.writeFile(wb, `relatorio-tarefas-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por Responsável
            </label>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Responsável
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Concluídas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ativas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No Prazo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Atrasadas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % No Prazo
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dadosPorResponsavel.map((resp) => (
                <tr key={resp.nome}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {resp.nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {resp.total}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    {resp.concluidas}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                    {resp.ativas}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    {resp.noPrazo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    {resp.atrasadas}
                  </td>
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
