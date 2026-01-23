// Serviço para envio de emails via API do Vercel
export async function enviarEmail({ to, subject, html }) {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: to,
        subject: subject,
        html: html
      })
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao enviar email')
    }

    console.log('Email enviado com sucesso:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Erro ao enviar email:', error)
    return { success: false, error: error.message }
  }
}

export function templateNovaTarefa({ nomeTarefa, nomeResponsavel, descricao, prazo, prioridade }) {
  const corPrioridade = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#10b981'
  }

  const textoPrioridade = {
    high: '🔴 Alta',
    medium: '🟡 Média',
    low: '🟢 Baixa'
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background-color: #2563eb; padding: 30px; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">
                    📋 Nova Tarefa Atribuída
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 30px;">
                  <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px;">
                    Olá, <strong>${nomeResponsavel}</strong>!
                  </p>
                  
                  <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px;">
                    Uma nova tarefa foi atribuída a você:
                  </p>
                  
                  <!-- Tarefa Box -->
                  <div style="background-color: #f9fafb; border-left: 4px solid ${corPrioridade[prioridade]}; padding: 20px; margin: 20px 0; border-radius: 4px;">
                    <h2 style="margin: 0 0 15px 0; color: #111827; font-size: 18px;">
                      ${descricao}
                    </h2>
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                          <strong>📅 Prazo:</strong> ${prazo}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                          <strong>⚡ Prioridade:</strong> ${textoPrioridade[prioridade]}
                        </td>
                      </tr>
                    </table>
                  </div>
                  
                  <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px;">
                    Acesse o sistema para mais detalhes e gerenciar suas tarefas.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; text-align: center;">
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                    Este é um email automático do Gerenciador de Tarefas
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}

export function templateTarefaConcluida({ nomeTarefa, nomeResponsavel, descricao, concluidaEm, status, justificativa }) {
  const corStatus = status === 'no_prazo' ? '#10b981' : '#ef4444'
  const textoStatus = status === 'no_prazo' ? '✅ Concluída no Prazo' : '⚠️ Concluída com Atraso'

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background-color: ${corStatus}; padding: 30px; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">
                    ${textoStatus}
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 30px;">
                  <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px;">
                    A tarefa foi concluída por <strong>${nomeResponsavel}</strong>:
                  </p>
                  
                  <!-- Tarefa Box -->
                  <div style="background-color: #f9fafb; border-left: 4px solid ${corStatus}; padding: 20px; margin: 20px 0; border-radius: 4px;">
                    <h2 style="margin: 0 0 15px 0; color: #111827; font-size: 18px;">
                      ${descricao}
                    </h2>
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                          <strong>✅ Concluída em:</strong> ${concluidaEm}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                          <strong>👤 Responsável:</strong> ${nomeResponsavel}
                        </td>
                      </tr>
                      ${justificativa ? `
                      <tr>
                        <td style="padding: 8px 0;">
                          <div style="background-color: #fef3c7; padding: 12px; border-radius: 4px; margin-top: 10px;">
                            <strong style="color: #92400e;">📝 Justificativa:</strong>
                            <p style="margin: 8px 0 0 0; color: #78350f; font-size: 14px;">
                              ${justificativa}
                            </p>
                          </div>
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                  </div>
                  
                  <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px;">
                    Acesse o painel administrativo para mais detalhes.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; text-align: center;">
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                    Este é um email automático do Gerenciador de Tarefas
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}
