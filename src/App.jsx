import { useAuth } from './hooks/useAuth'
import Login from './components/Login'
import Dashboard from './components/Dashboard'

function App() {
  const { user, profile, loading, isAdmin, signIn, signOut } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Login onSignIn={signIn} />
  }

  return (
    <Dashboard
      user={user}
      profile={profile}
      isAdmin={isAdmin}
      onSignOut={signOut}
    />
  )
}

export default App
