import type { Client } from '@/lib/supabase/types'
import type { SupabaseClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'

/**
 * Ensures a Stripe Customer exists for a portal client and `clients.stripe_customer_id` is set.
 *
 * Order: use existing DB id if valid → find by email in Stripe (avoid duplicates) → create.
 * CRM lives in HubSpot; Stripe only needs a Customer for billing and subscription attachment.
 */
export async function ensureStripeCustomerForPortalClient(
  stripe: Stripe,
  supabase: SupabaseClient,
  client: Client,
): Promise<{ stripeCustomerId: string }> {
  const email = client.email?.trim().toLowerCase()
  if (!email) {
    throw new Error('Client email is required to create a Stripe customer')
  }

  const existingId = client.stripe_customer_id?.trim()
  if (existingId) {
    try {
      const c = await stripe.customers.retrieve(existingId)
      if (c && !('deleted' in c && c.deleted)) {
        return { stripeCustomerId: existingId }
      }
    } catch {
      // fall through — stale id
    }
  }

  const byEmail = await stripe.customers.list({ email, limit: 5 })
  if (byEmail.data.length > 0) {
    const pick = byEmail.data[0]!
    const { error: linkErr } = await supabase
      .from('clients')
      .update({ stripe_customer_id: pick.id })
      .eq('id', client.id)
    if (linkErr) {
      throw new Error(`Link Stripe customer: Supabase update failed: ${linkErr.message}`)
    }
    try {
      const current = await stripe.customers.retrieve(pick.id)
      const prev =
        !('deleted' in current) && current.metadata
          ? { ...current.metadata }
          : ({} as Record<string, string>)
      await stripe.customers.update(pick.id, {
        name: (client.company?.trim() || client.name?.trim() || undefined) as string | undefined,
        metadata: {
          ...prev,
          supabase_client_id: client.id,
          hubspot_contact_id: client.hubspot_contact_id ?? '',
          source: 'iw-portal',
        },
      })
    } catch {
      // non-fatal — customer exists and is linked
    }
    return { stripeCustomerId: pick.id }
  }

  const created = await stripe.customers.create({
    email,
    name: (client.company?.trim() || client.name?.trim() || email) as string,
    metadata: {
      supabase_client_id: client.id,
      hubspot_contact_id: client.hubspot_contact_id ?? '',
      source: 'iw-portal',
    },
  })

  const { error } = await supabase
    .from('clients')
    .update({ stripe_customer_id: created.id })
    .eq('id', client.id)
  if (error) {
    throw new Error(`Stripe customer created but Supabase update failed: ${error.message}`)
  }

  return { stripeCustomerId: created.id }
}
