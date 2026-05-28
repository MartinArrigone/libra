import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const STATUS_LABELS = {
  pending: 'Pendiente de envío',
  shipped: 'En camino',
  confirmed: 'Confirmado',
  auto_confirmed: 'Confirmado automáticamente',
  disputed: 'En disputa',
}

const STATUS_COLORS = {
  pending: '#b8a882',
  shipped: '#2d6a3f',
  confirmed: '#2d6a3f',
  auto_confirmed: '#7aaa88',
  disputed: '#c0392b',
}

export default function MyPurchases() {
  const navigate = useNavigate()
  const [purchases, setPurchases] = useState([])
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('purchases')

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    const { data: p } = await supabase
      .from('transactions')
      .select('*, books(*)')
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false })

    const { data: s } = await supabase
      .from('transactions')
      .select('*, books(*)')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })

    setPurchases(p || [])
    setSales(s || [])
    setLoading(false)
  }

  const handleConfirm = async (transactionId, sellerId, points) => {
    await supabase
      .from('transactions')
      .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
      .eq('id', transactionId)

    await supabase.rpc('add_points', { user_id_input: sellerId, points_input: points })
    await fetchTransactions()
  }

  const handleShipped = async (transactionId) => {
    await supabase
      .from('transactions')
      .update({ status: 'shipped' })
      .eq('id', transactionId)

    await fetchTransactions()
  }

  const list = tab === 'purchases' ? purchases : sales

  return (
    <div style={s.container}>
      <div style={s.header}>
        <span style={s.logo}>LIBRA</span>
        <button style={s.backBtn} onClick={() => navigate('/')}>← Volver</button>
      </div>

      <div style={s.content}>
        <div style={s.tabs}>
          <button style={tab === 'purchases' ? s.tabActive : s.tab} onClick={() => setTab('purchases')}>
            Mis compras
          </button>
          <button style={tab === 'sales' ? s.tabActive : s.tab} onClick={() => setTab('sales')}>
            Mis ventas
          </button>
        </div>

        {loading ? (
          <p style={s.empty}>Cargando...</p>
        ) : list.length === 0 ? (
          <p style={s.empty}>No hay {tab === 'purchases' ? 'compras' : 'ventas'} todavía.</p>
        ) : (
          <div style={s.list}>
            {list.map(tx => (
              <div key={tx.id} style={s.card}>
                <div style={s.cardTop}>
                  {tx.books?.cover_url
                    ? <img src={tx.books.cover_url} alt={tx.books.title} style={s.cover} />
                    : <div style={s.noCover}>📚</div>
                  }
                  <div style={s.info}>
                    <div style={s.bookTitle}>{tx.books?.title}</div>
                    <div style={s.bookMeta}>{tx.books?.author}</div>
                    <div style={s.pts}>{tx.points_amount} pts</div>
                    <div style={{ ...s.status, color: STATUS_COLORS[tx.status] }}>
                      {STATUS_LABELS[tx.status]}
                    </div>
                  </div>
                </div>

                <div style={s.cardActions}>
                  {tab === 'sales' && tx.status === 'pending' && (
                    <button style={s.actionBtn} onClick={() => handleShipped(tx.id)}>
                      Marcar como enviado
                    </button>
                  )}
                  {tab === 'purchases' && tx.status === 'shipped' && (
                    <button style={s.actionBtn} onClick={() => handleConfirm(tx.id, tx.seller_id, tx.points_amount)}>
                      Confirmar recepción
                    </button>
                  )}
                  {tx.auto_confirm_at && tx.status === 'shipped' && (
                    <span style={s.autoConfirm}>
                      Auto-confirma el {new Date(tx.auto_confirm_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const s = {
  container: { minHeight: '100vh', backgroundColor: '#f5f7f4', fontFamily: 'sans-serif' },
  header: { backgroundColor: '#fff', borderBottom: '1px solid #d4e6d4', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logo: { fontSize: '18px', fontWeight: '500', color: '#2d6a3f', letterSpacing: '2px' },
  backBtn: { padding: '8px 16px', backgroundColor: '#f0f7f1', color: '#2d6a3f', border: '1px solid #c2dfc8', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
  content: { maxWidth: '700px', margin: '0 auto', padding: '32px 24px' },
  tabs: { display: 'flex', gap: '8px', marginBottom: '24px' },
  tab: { flex: 1, padding: '10px', backgroundColor: '#f0f7f1', color: '#2d6a3f', border: '1px solid #c2dfc8', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  tabActive: { flex: 1, padding: '10px', backgroundColor: '#2d6a3f', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  card: { backgroundColor: '#fff', border: '1px solid #d4e6d4', borderRadius: '12px', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' },
  cardTop: { display: 'flex', gap: '16px', alignItems: 'center' },
  cover: { width: '50px', height: '70px', objectFit: 'cover', borderRadius: '6px' },
  noCover: { width: '50px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f7f1', borderRadius: '6px', fontSize: '24px' },
  info: { flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' },
  bookTitle: { fontSize: '14px', fontWeight: '500', color: '#1a3a24' },
  bookMeta: { fontSize: '12px', color: '#7aaa88' },
  pts: { fontSize: '14px', fontWeight: '500', color: '#2d6a3f', marginTop: '4px' },
  status: { fontSize: '12px', fontWeight: '500', marginTop: '2px' },
  cardActions: { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' },
  actionBtn: { padding: '8px 18px', backgroundColor: '#2d6a3f', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' },
  autoConfirm: { fontSize: '12px', color: '#7aaa88' },
  empty: { textAlign: 'center', color: '#7aaa88', marginTop: '60px', fontSize: '15px' },
}