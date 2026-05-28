import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const PACKAGES = [
  { id: 'pack_10', points: 10, eur: 5, label: 'Starter' },
  { id: 'pack_25', points: 25, eur: 10, label: 'Popular' },
  { id: 'pack_60', points: 60, eur: 20, label: 'Pro' },
]

export default function BuyPoints() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState('pack_25')
  const [loading, setLoading] = useState(false)

  const handleBuy = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data: { session } } = await supabase.auth.getSession()

    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/buy-points`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ userId: user.id, email: user.email, packageId: selected })
    })

    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setLoading(false)
  }

  return (
    <div style={s.container}>
      <div style={s.header}>
        <span style={s.logo}>LIBRA</span>
        <button style={s.backBtn} onClick={() => navigate('/')}>← Volver</button>
      </div>

      <div style={s.content}>
        <h2 style={s.title}>Comprar puntos</h2>
        <p style={s.sub}>Usá puntos para canjear libros en el marketplace.</p>

        <div style={s.grid}>
          {PACKAGES.map(pkg => (
            <div
              key={pkg.id}
              style={selected === pkg.id ? s.cardActive : s.card}
              onClick={() => setSelected(pkg.id)}
            >
              {pkg.id === 'pack_25' && <div style={s.badge}>Más popular</div>}
              <div style={s.pkgLabel}>{pkg.label}</div>
              <div style={s.pkgPoints}>{pkg.points} pts</div>
              <div style={s.pkgPrice}>{pkg.eur}€</div>
              <div style={s.pkgPer}>{(pkg.eur / pkg.points).toFixed(2)}€/pt</div>
            </div>
          ))}
        </div>

        <button style={s.buyBtn} onClick={handleBuy} disabled={loading}>
          {loading ? 'Redirigiendo...' : `Comprar ${PACKAGES.find(p => p.id === selected)?.points} pts`}
        </button>
      </div>
    </div>
  )
}

const s = {
  container: { minHeight: '100vh', backgroundColor: '#f5f7f4', fontFamily: 'sans-serif' },
  header: { backgroundColor: '#fff', borderBottom: '1px solid #d4e6d4', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logo: { fontSize: '18px', fontWeight: '500', color: '#2d6a3f', letterSpacing: '2px' },
  backBtn: { padding: '8px 16px', backgroundColor: '#f0f7f1', color: '#2d6a3f', border: '1px solid #c2dfc8', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
  content: { maxWidth: '600px', margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '20px' },
  title: { fontSize: '22px', fontWeight: '500', color: '#1a3a24', margin: 0 },
  sub: { fontSize: '14px', color: '#7aaa88', margin: 0 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' },
  card: { backgroundColor: '#fff', border: '1px solid #d4e6d4', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', position: 'relative' },
  cardActive: { backgroundColor: '#fff', border: '2px solid #2d6a3f', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', position: 'relative' },
  badge: { position: 'absolute', top: '-12px', backgroundColor: '#2d6a3f', color: '#fff', fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '500' },
  pkgLabel: { fontSize: '12px', color: '#7aaa88', fontWeight: '500' },
  pkgPoints: { fontSize: '28px', fontWeight: '500', color: '#2d6a3f' },
  pkgPrice: { fontSize: '18px', color: '#1a3a24', fontWeight: '500' },
  pkgPer: { fontSize: '11px', color: '#7aaa88' },
  buyBtn: { padding: '14px', backgroundColor: '#2d6a3f', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '15px', fontWeight: '500' },
}