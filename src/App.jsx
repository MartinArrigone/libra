import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Auth from './pages/Auth'
import Home from './pages/Home'
import PublishBook from './pages/PublishBook'
import BookDetail from './pages/BookDetail'
import Subscribe from './pages/Subscribe'
import Success from './pages/Success'
import Purchase from './pages/Purchase'
import MyPurchases from './pages/MyPurchases'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Cargando...</div>

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={!session ? <Auth /> : <Navigate to="/" />} />
        <Route path="/publish" element={session ? <PublishBook /> : <Navigate to="/auth" />} />
        <Route path="/book/:id" element={session ? <BookDetail /> : <Navigate to="/auth" />} />
        <Route path="/subscribe" element={session ? <Subscribe /> : <Navigate to="/auth" />} />
        <Route path="/success" element={session ? <Success /> : <Navigate to="/auth" />} />
        <Route path="/purchase" element={session ? <Purchase /> : <Navigate to="/auth" />} />
        <Route path="/my-purchases" element={session ? <MyPurchases /> : <Navigate to="/auth" />} />
        <Route path="/" element={session ? <Home /> : <Navigate to="/auth" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App