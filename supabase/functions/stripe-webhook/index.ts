import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
)

Deno.serve(async (req) => {
  try {
    const body = await req.json()

    if (body.type === 'checkout.session.completed') {
      const session = body.data.object
      const userId = session.metadata?.userId
      const type = session.metadata?.type

      if (!userId) return new Response('No userId', { status: 400 })

      if (type === 'points_purchase') {
        const points = parseInt(session.metadata?.points ?? '0')
        if (points > 0) {
          await supabase.rpc('add_points', { user_id_input: userId, points_input: points })
          await supabase.from('points_purchases').insert({
            user_id: userId,
            points_amount: points,
            eur_paid: session.amount_total / 100,
            stripe_payment_id: session.id,
          })
        }
      } else {
        const { data: existing } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('user_id', userId)
          .eq('status', 'active')
          .maybeSingle()

        if (!existing) {
          await supabase.from('subscriptions').insert({
            user_id: userId,
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.id,
            status: 'active',
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          })
          await supabase.rpc('add_points', { user_id_input: userId, points_input: 20 })
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})