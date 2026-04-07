import { z } from 'zod'

export const changeOrderCostImpactTypeSchema = z.enum(['none', 'increase', 'decrease', 'tbd'])

export type ChangeOrderCostImpactType = z.infer<typeof changeOrderCostImpactTypeSchema>

export const changeOrderPayloadSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  masterAgreementReference: z.string().min(1, 'Master agreement / SOW reference is required').max(500),
  currentScopeSummary: z.string().min(1, 'Current scope summary is required').max(20000),
  requestedScopeDetail: z.string().min(1, 'Requested change detail is required').max(20000),
  businessRationale: z.string().min(1, 'Business rationale is required').max(20000),
  scheduleImpact: z.string().min(1, 'Schedule impact is required').max(20000),
  costImpactType: changeOrderCostImpactTypeSchema,
  costImpactDescription: z.string().min(1, 'Cost impact description is required').max(20000),
  /** HTML date input format YYYY-MM-DD */
  proposedEffectiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a valid date'),
  authorizedSignerName: z.string().min(1, 'Signer name is required').max(300),
  authorizedSignerTitle: z.string().min(1, 'Signer title is required').max(300),
  ackAccuracy: z.literal(true),
  ackAuthority: z.literal(true),
  ackWrittenSupersedesVerbal: z.literal(true),
  ackElectronicRecords: z.literal(true),
})

export type ChangeOrderPayloadInput = z.infer<typeof changeOrderPayloadSchema>

export function parseChangeOrderPayload(body: unknown) {
  return changeOrderPayloadSchema.safeParse(body)
}

export function buildChangeOrderDescription(p: ChangeOrderPayloadInput): string {
  return [
    `Master agreement reference: ${p.masterAgreementReference}`,
    '',
    'Current scope (summary):',
    p.currentScopeSummary,
    '',
    'Requested change:',
    p.requestedScopeDetail,
    '',
    'Business rationale:',
    p.businessRationale,
    '',
    'Schedule impact:',
    p.scheduleImpact,
    '',
    `Cost impact (${p.costImpactType}):`,
    p.costImpactDescription,
    '',
    `Proposed effective date: ${p.proposedEffectiveDate}`,
    '',
    `Authorized signer: ${p.authorizedSignerName}, ${p.authorizedSignerTitle}`,
  ].join('\n')
}
