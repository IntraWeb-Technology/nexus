/** Shared Marketing form field groups for contractual change orders (contacts, internal names iw_co_*). */

export const CONTACT_OBJECT_TYPE_ID = '0-1'

type HubSpotField = Record<string, unknown>

const emailField: HubSpotField = {
  objectTypeId: CONTACT_OBJECT_TYPE_ID,
  name: 'email',
  label: 'Email',
  required: true,
  hidden: false,
  fieldType: 'email',
  dependentFields: [],
  validation: { useDefaultBlockList: false, blockedEmailDomains: [] },
}

function singleLine(name: string, label: string, required: boolean, hidden = false): HubSpotField {
  return {
    objectTypeId: CONTACT_OBJECT_TYPE_ID,
    name,
    label,
    required,
    hidden,
    fieldType: 'single_line_text',
    dependentFields: [],
  }
}

function multiLine(name: string, label: string, required: boolean): HubSpotField {
  return {
    objectTypeId: CONTACT_OBJECT_TYPE_ID,
    name,
    label,
    required,
    hidden: false,
    fieldType: 'multi_line_text',
    dependentFields: [],
  }
}

function dropdown(
  name: string,
  label: string,
  options: { label: string; value: string }[],
  required: boolean,
): HubSpotField {
  return {
    objectTypeId: CONTACT_OBJECT_TYPE_ID,
    name,
    label,
    required,
    hidden: false,
    fieldType: 'dropdown',
    dependentFields: [],
    options: options.map((o, i) => ({
      label: o.label,
      value: o.value,
      displayOrder: i,
    })),
    defaultValues: [],
  }
}

function dateField(name: string, label: string, required: boolean): HubSpotField {
  return {
    objectTypeId: CONTACT_OBJECT_TYPE_ID,
    name,
    label,
    required,
    hidden: false,
    fieldType: 'datepicker',
    dependentFields: [],
  }
}

function checkbox(name: string, label: string, description: string | undefined, required: boolean): HubSpotField {
  return {
    objectTypeId: CONTACT_OBJECT_TYPE_ID,
    name,
    label,
    description,
    required,
    hidden: false,
    fieldType: 'single_checkbox',
    dependentFields: [],
  }
}

const orderedFields: HubSpotField[] = [
  emailField,
  singleLine('iw_co_title', 'Change order title', true),
  singleLine('iw_co_master_agreement_reference', 'Master agreement / SOW reference', true),
  multiLine('iw_co_current_scope_summary', 'Current scope (summary)', true),
  multiLine('iw_co_requested_scope_detail', 'Requested change (detail)', true),
  multiLine('iw_co_business_rationale', 'Business rationale', true),
  multiLine('iw_co_schedule_impact', 'Schedule impact', true),
  dropdown(
    'iw_co_cost_impact_type',
    'Cost impact type',
    [
      { label: 'No change', value: 'none' },
      { label: 'Increase', value: 'increase' },
      { label: 'Decrease', value: 'decrease' },
      { label: 'TBD', value: 'tbd' },
    ],
    true,
  ),
  multiLine('iw_co_cost_impact_description', 'Cost impact description', true),
  dateField('iw_co_proposed_effective_date', 'Proposed effective date', true),
  singleLine('iw_co_authorized_signer_name', 'Authorized signer — name', true),
  singleLine('iw_co_authorized_signer_title', 'Authorized signer — title', true),
  ...[
    checkbox('iw_co_ack_accuracy', 'I confirm the information is accurate', undefined, true),
    checkbox('iw_co_ack_authority', 'I am authorized to request this change', undefined, true),
    checkbox(
      'iw_co_ack_written_supersedes_verbal',
      'I understand written change orders govern scope and fees',
      undefined,
      true,
    ),
    checkbox('iw_co_ack_electronic_records', 'I consent to electronic records for this request', undefined, true),
  ],
  singleLine('iw_co_portal_reference', 'Portal reference (optional)', false, true),
]

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

/** Field group rows (max 3 fields per row per HubSpot convention). */
export function buildChangeOrderFormFieldGroups() {
  return chunk(orderedFields, 3).map((fields) => ({
    groupType: 'default_group',
    richTextType: 'text',
    fields,
  }))
}

export const CHANGE_ORDER_FORM_NAME = 'IntraWeb Portal — Contractual change order'

export function buildChangeOrderFormCreateBody() {
  const now = new Date().toISOString()
  return {
    formType: 'hubspot',
    name: CHANGE_ORDER_FORM_NAME,
    createdAt: now,
    updatedAt: now,
    archived: false,
    fieldGroups: buildChangeOrderFormFieldGroups(),
    configuration: {
      createNewContactForNewEmail: true,
      editable: true,
      allowLinkToResetKnownValues: false,
      postSubmitAction: { type: 'thank_you', value: 'Thank you. Your change order request was received.' },
      language: 'en',
      prePopulateKnownValues: false,
      cloneable: true,
      notifyContactOwner: false,
      recaptchaEnabled: false,
      archivable: true,
      notifyRecipients: [],
    },
    displayOptions: {
      renderRawHtml: false,
      theme: 'default_style',
      submitButtonText: 'Submit change order',
      style: {
        labelTextSize: '13px',
        legalConsentTextColor: '#33475b',
        fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
        legalConsentTextSize: '13px',
        backgroundWidth: '100%',
        helpTextSize: '11px',
        submitFontColor: '#ffffff',
        labelTextColor: '#33475b',
        submitAlignment: 'left',
        submitSize: '14px',
        helpTextColor: '#33475b',
        submitColor: '#00a4bd',
      },
    },
    legalConsentOptions: {
      type: 'none',
    },
  }
}
