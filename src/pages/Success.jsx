import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Success() {
  const navigate = useNavigate()
  const [done, setDone] = useState(false)

  useEffect(() => {
    activateSubscription()
  }, [])

  const activateSubscription = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    const { data: existing } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (existing) {
      setDone(true)
      return
    }

    await supabase.from('subscriptions').insert({
      user_id: user.id,
      status: 'active',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    })

    await supabase.rpc('add_points', { user_id_input: user.id, points_input: 20 })

    setDone(true)
  }

  return (
    <div style={s.container}>
      <div style={s.card}>
        <div style={s.icon}>🌿</div>
        <h2 style={s.title}>¡Bienvenido a Libra!</h2>
        <p style={s.sub}>Tu suscripción está activa y ya tenés 20 puntos para empezar.</p>
        {done && (
          <button style={s.btn} onClick={() => navigate('/')}>
            Ir al marketplace
          </button>
        )}
      </div>
    </div>
  )
}

const s = {
  container: { minHeight: '100vh', backgroundColor: '#f5f7f4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' },
  card: { backgroundColor: '#fff', border: '1px solid #d4e6d4', borderRadius: '20px', padding: '48px 40px', maxWidth: '400px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' },
  icon: { fontSize: '48px' },
  title: { fontSize: '24px', fontWeight: '500', color: '#1a3a24', margin: 0 },
  sub: { fontSize: '14px', color: '#7aaa88', margin: 0 },
  btn: { marginTop: '8px', padding: '14px 32px', backgroundColor: '#2d6a3f', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '15px', fontWeight: '500' },
}