import type { InvoiceStatus, Plan } from '@/lib/supabase/types'

export interface InvoiceSeed {
  invoice_number: string
  description: string
  amount_cents: number
  status: InvoiceStatus
  sku: string | null
}

export function invoicesForPlan(plan: Plan): InvoiceSeed[] {
  if (plan === 'growth') {
    return [
      {
        invoice_number: 'INV-001',
        description: 'IntraWeb Growth Setup deposit (IW-AG-SETUP)',
        amount_cents: 200_000,
        status: 'paid',
        sku: 'IW-AG-SETUP',
      },
      {
        invoice_number: 'INV-002',
        description: 'Go-live balance — Growth Tier (IW-AG-TIER)',
        amount_cents: 200_000,
        status: 'pending',
        sku: 'IW-AG-TIER',
      },
      {
        invoice_number: 'INV-003',
        description: 'First month retainer — Growth (IW-AG-MRR)',
        amount_cents: 45_000,
        status: 'pending',
        sku: 'IW-AG-MRR',
      },
    ]
  }
  return [
    {
      invoice_number: 'INV-001',
      description: 'IntraWeb Starter Setup deposit (IW-AS-SETUP)',
      amount_cents: 100_000,
      status: 'paid',
      sku: 'IW-AS-SETUP',
    },
    {
      invoice_number: 'INV-002',
      description: 'Go-live balance — Starter Tier (IW-AS-TIER)',
      amount_cents: 150_000,
      status: 'pending',
      sku: 'IW-AS-TIER',
    },
    {
      invoice_number: 'INV-003',
      description: 'First month retainer — Starter (IW-AS-MRR)',
      amount_cents: 30_000,
      status: 'pending',
      sku: 'IW-AS-MRR',
    },
  ]
}
