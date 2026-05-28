import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
)

const PACKAGES = [
  { id: 'pack_10', points: 10, eur: 500 },   // 5€
  { id: 'pack_25', points: 25, eur: 1000 },  // 10€
  { id: 'pack_60', points: 60, eur: 2000 },  // 20€
]

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
    const { userId, email, packageId } = await req.json()
    const pkg = PACKAGES.find(p => p.id === packageId)

    if (!pkg) return new Response(JSON.stringify({ error: 'Paquete inválido' }), {
      status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY') ?? ''
    const origin = req.headers.get('origin') ?? 'http://localhost:5173'

    const body = new URLSearchParams({
      'payment_method_types[]': 'card',
      'mode': 'payment',
      'customer_email': email,
      'line_items[0][price_data][currency]': 'eur',
      'line_items[0][price_data][product_data][name]': `Libra — ${pkg.points} puntos`,
      'line_items[0][price_data][unit_amount]': pkg.eur.toString(),
      'line_items[0][quantity]': '1',
      'metadata[userId]': userId,
      'metadata[points]': pkg.points.toString(),
      'metadata[type]': 'points_purchase',
      'success_url': `${origin}/points-success?session_id={CHECKOUT_SESSION_ID}`,
      'cancel_url': `${origin}/buy-points`,
    })

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString()
    })

    const session = await stripeRes.json()

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
})