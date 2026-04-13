/** Internal HubSpot contact property names — must match form + CRM (see scripts/hubspot/ensure-change-order-properties.ts). */
export const HS_CO = {
  title: 'iw_co_title',
  masterAgreementReference: 'iw_co_master_agreement_reference',
  currentScopeSummary: 'iw_co_current_scope_summary',
  requestedScopeDetail: 'iw_co_requested_scope_detail',
  businessRationale: 'iw_co_business_rationale',
  scheduleImpact: 'iw_co_schedule_impact',
  costImpactType: 'iw_co_cost_impact_type',
  costImpactDescription: 'iw_co_cost_impact_description',
  proposedEffectiveDate: 'iw_co_proposed_effective_date',
  authorizedSignerName: 'iw_co_authorized_signer_name',
  authorizedSignerTitle: 'iw_co_authorized_signer_title',
  ackAccuracy: 'iw_co_ack_accuracy',
  ackAuthority: 'iw_co_ack_authority',
  ackWrittenSupersedesVerbal: 'iw_co_ack_written_supersedes_verbal',
  ackElectronicRecords: 'iw_co_ack_electronic_records',
  portalReference: 'iw_co_portal_reference',
} as const

export const HS_EMAIL = 'email' as const
