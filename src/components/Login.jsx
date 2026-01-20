import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Login({ onSignIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [modoRecuperacao, setModoRecuperacao] = useState(false)
  const [modoResetSenha, setModoResetSenha] = useState(false)
  const [mensagemSucesso, setMensagemSucesso] = useState('')

  useEffect(() => {
    async function processRecovery() {
      const hash = window.location.hash
      
      // Verificar se tem token de recovery na URL
      if (hash.includes('type=recovery')) {
        setModoResetSenha(true)
        
        // Limpar e processar o hash corretamente
        let cleanHash = hash.substring(1) // Remove o # inicial
        
        // Substituir %23 por & para separar corretamente os parâmetros
        cleanHash = cleanHash.replace('type=recovery%23', 'type=recovery&')
        cleanHash = cleanHash.replace('type=recovery#', 'type=recovery&')
        
        const params = new URLSearchParams(cleanHash)
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')
        
        console.log('Access Token encontrado:', accessToken ? 'Sim' : 'Não')
        
        if (accessToken && refreshToken) {
          // Estabelecer sessão com o token
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })
          
          if (error) {
            console.error('Erro ao estabelecer sessão:', error)
            setError('Erro ao processar link de recuperação: ' + error.message)
          } else {
            console.log('Sessão estabelecida com sucesso!')
          }
        } else {
          console.error('Tokens não encontrados na URL')
          setError('Link de recuperação inválido')
        }
      }
    }
    
    processRecovery()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMensagemSucesso('')

    if (modoResetSenha) {
      // Resetar senha
      if (novaSenha.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres')
        setLoading(false)
        return
      }

      if (novaSenha !== confirmarNovaSenha) {
        setError('As senhas não conferem')
        setLoading(false)
        return
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: novaSenha
      })

      if (updateError) {
        setError('Erro ao atualizar senha: ' + updateError.message)
      } else {
        setMensagemSucesso('Senha atualizada com sucesso! Faça login com a nova senha.')
        setTimeout(() => {
          window.location.href = '/'
        }, 2000)
      }
      setLoading(false)
    } else if (modoRecuperacao) {
      // Recuperação de senha
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/#type=recovery`,
      })

      if (resetError) {
        setError('Erro ao enviar email de recuperação')
      } else {
        setMensagemSucesso('Email de recuperação enviado! Verifique sua caixa de entrada.')
      }
      setLoading(false)
    } else {
      // Login normal
      const { error: signInError } = await onSignIn(email, password)

      if (signInError) {
        setError('Email ou senha incorretos')
        setLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gerenciador de Tarefas
          </h1>
          <p className="text-gray-600">
            {modoResetSenha 
              ? 'Defina sua nova senha' 
              : modoRecuperacao 
              ? 'Recuperar senha' 
              : 'Faça login para continuar'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {modoResetSenha ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nova Senha
                </label>
                <input
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Mínimo de 6 caracteres
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  value={confirmarNovaSenha}
                  onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="seu@email.com"
                  required
                />
              </div>

              {!modoRecuperacao && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Senha
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                </div>
              )}
            </>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {mensagemSucesso && (
            <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm">
              {mensagemSucesso}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading 
              ? (modoResetSenha ? 'Atualizando...' : modoRecuperacao ? 'Enviando...' : 'Entrando...') 
              : (modoResetSenha ? 'Atualizar Senha' : modoRecuperacao ? 'Enviar Email' : 'Entrar')
            }
          </button>

          {!modoResetSenha && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setModoRecuperacao(!modoRecuperacao)
                  setError(null)
                  setMensagemSucesso('')
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {modoRecuperacao ? '← Voltar para login' : 'Esqueci minha senha'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
