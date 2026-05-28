import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function PointsSuccess() {
  const navigate = useNavigate()
  const [points, setPoints] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBalance()
  }, [])

  const fetchBalance = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from('profiles')
      .select('points_balance')
      .eq('id', user.id)
      .single()
    setPoints(data?.points_balance ?? 0)
    setLoading(false)
  }

  return (
    <div style={s.container}>
      <div style={s.card}>
        <div style={s.icon}>🌿</div>
        <h2 style={s.title}>¡Puntos añadidos!</h2>
        <p style={s.sub}>Tu compra se procesó correctamente.</p>
        {!loading && (
          <div style={s.balanceBox}>
            <span style={s.balanceLabel}>Tu saldo actual</span>
            <span style={s.balanceValue}>{points} pts</span>
          </div>
        )}
        <button style={s.btn} onClick={() => navigate('/')}>
          Ir al marketplace
        </button>
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
  balanceBox: { backgroundColor: '#f0f7f1', border: '1px solid #c2dfc8', borderRadius: '12px', padding: '16px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', marginTop: '8px' },
  balanceLabel: { fontSize: '12px', color: '#7aaa88' },
  balanceValue: { fontSize: '36px', fontWeight: '500', color: '#2d6a3f' },
  btn: { marginTop: '8px', padding: '14px 32px', backgroundColor: '#2d6a3f', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '15px', fontWeight: '500' },
}