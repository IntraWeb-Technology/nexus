import { fetchDefaultCardSummary } from '@/lib/stripe/default-payment-method'
import { getStripe } from '@/lib/stripe/server'
import { createServerSupabaseForUser } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let stripe: ReturnType<typeof getStripe>
  try {
    stripe = getStripe()
  } catch {
    return NextResponse.json({ paymentMethod: null })
  }

  const supabase = await createServerSupabaseForUser()
  if (!supabase) return NextResponse.json({ paymentMethod: null })

  const { data: client } = await supabase
    .from('clients')
    .select('stripe_customer_id')
    .eq('clerk_user_id', userId)
    .maybeSingle()

  const customerId = client?.stripe_customer_id?.trim()
  if (!customerId) return NextResponse.json({ paymentMethod: null })

  try {
    const summary = await fetchDefaultCardSummary(stripe, customerId)
    return NextResponse.json({ paymentMethod: summary })
  } catch {
    return NextResponse.json({ paymentMethod: null })
  }
}
