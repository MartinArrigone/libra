import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Subscribe() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data: { session } } = await supabase.auth.getSession()

    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ userId: user.id, email: user.email })
    })

    const { url } = await res.json()
    if (url) window.location.href = url
    else setLoading(false)
  }

  return (
    <div style={s.container}>
      <div style={s.card}>
        <div style={s.logo}>LIBRA</div>
        <div style={s.icon}>🌿</div>
        <h2 style={s.title}>Activá tu cuenta</h2>
        <p style={s.sub}>Para comprar y vender libros necesitás una suscripción anual.</p>

        <div style={s.priceBox}>
          <span style={s.price}>20€</span>
          <span style={s.period}>/año</span>
        </div>

        <div style={s.features}>
          {[
            '20 puntos de bienvenida',
            'Publicá libros ilimitados',
            'Comprá con puntos',
            'Acceso al marketplace completo',
            'Economía circular 100%',
          ].map(f => (
            <div key={f} style={s.feature}>
              <span style={s.check}>✓</span>
              <span>{f}</span>
            </div>
          ))}
        </div>

        <button style={s.btn} onClick={handleSubscribe} disabled={loading}>
          {loading ? 'Redirigiendo...' : 'Suscribirme por 20€/año'}
        </button>

        <button style={s.skip} onClick={() => navigate('/')}>
          Volver al inicio
        </button>
      </div>
    </div>
  )
}

const s = {
  container: { minHeight: '100vh', backgroundColor: '#f5f7f4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' },
  card: { backgroundColor: '#fff', border: '1px solid #d4e6d4', borderRadius: '20px', padding: '40px 36px', maxWidth: '420px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', boxShadow: '0 2px 24px rgba(45,106,63,0.07)' },
  logo: { fontSize: '20px', fontWeight: '500', color: '#2d6a3f', letterSpacing: '3px' },
  icon: { fontSize: '40px' },
  title: { fontSize: '22px', fontWeight: '500', color: '#1a3a24', margin: 0, textAlign: 'center' },
  sub: { fontSize: '14px', color: '#7aaa88', textAlign: 'center', margin: 0 },
  priceBox: { display: 'flex', alignItems: 'baseline', gap: '4px', margin: '8px 0' },
  price: { fontSize: '48px', fontWeight: '500', color: '#2d6a3f' },
  period: { fontSize: '16px', color: '#7aaa88' },
  features: { width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', margin: '8px 0' },
  feature: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#1a3a24' },
  check: { color: '#2d6a3f', fontWeight: '500', fontSize: '16px' },
  btn: { width: '100%', padding: '14px', backgroundColor: '#2d6a3f', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '15px', fontWeight: '500' },
  skip: { background: 'none', border: 'none', color: '#7aaa88', cursor: 'pointer', fontSize: '13px' },
}