import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login({ onSignIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [modoRecuperacao, setModoRecuperacao] = useState(false)
  const [mensagemSucesso, setMensagemSucesso] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMensagemSucesso('')

    if (modoRecuperacao) {
      // Recuperação de senha
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
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
            {modoRecuperacao ? 'Recuperar senha' : 'Faça login para continuar'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              ? (modoRecuperacao ? 'Enviando...' : 'Entrando...') 
              : (modoRecuperacao ? 'Enviar Email' : 'Entrar')
            }
          </button>

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
        </form>
      </div>
    </div>
  )
}
