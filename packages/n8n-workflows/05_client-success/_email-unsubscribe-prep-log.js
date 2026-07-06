const d = $('Extract Contact').first().json
const valid = $('Validate Unsubscribe Link').first().json.valid === true

return [
  {
    json: {
      workflowName: 'SYS 05 — Email Unsubscribe Handler',
      contactName: d.contactName || d.email,
      phone: '',
      eventType: 'email_unsubscribed',
      status: valid ? 'success' : 'error',
      notes: d.contactFound ? `HubSpot contact ${d.contactId}` : 'No HubSpot contact match',
    },
  },
]
