import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    const { bookId, buyerId } = await req.json()

    // 1. Obtener el libro
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .eq('status', 'available')
      .single()

    if (bookError || !book) {
      return new Response(JSON.stringify({ error: 'Libro no disponible' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } })
    }

    // 2. Verificar que el comprador no sea el vendedor
    if (book.user_id === buyerId) {
      return new Response(JSON.stringify({ error: 'No podés comprar tu propio libro' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } })
    }

    // 3. Verificar puntos del comprador
    const { data: buyer } = await supabase
      .from('profiles')
      .select('points_balance')
      .eq('id', buyerId)
      .single()

    if (!buyer || buyer.points_balance < book.points_price) {
      return new Response(JSON.stringify({ error: 'Puntos insuficientes' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } })
    }

    // 4. Descontar puntos del comprador
    await supabase
      .from('profiles')
      .update({ points_balance: buyer.points_balance - book.points_price })
      .eq('id', buyerId)

    // 5. Marcar libro como reservado
    await supabase
      .from('books')
      .update({ status: 'reserved' })
      .eq('id', bookId)

    // 6. Crear transacción con auto-confirmación en 5 días
    const autoConfirmAt = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()

    const { data: transaction } = await supabase
      .from('transactions')
      .insert({
        book_id: bookId,
        buyer_id: buyerId,
        seller_id: book.user_id,
        points_amount: book.points_price,
        status: 'pending',
        auto_confirm_at: autoConfirmAt,
      })
      .select()
      .single()

    return new Response(JSON.stringify({ success: true, transaction }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
})