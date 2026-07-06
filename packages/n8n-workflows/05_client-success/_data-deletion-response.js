const input = $('Execute Deletion').first().json
const email = $('Validate Payload').first().json.email
const status = input.status || input.error || 'unknown'

const ok = ['completed', 'partial', 'manual_review'].includes(status)
const title = ok ? 'Request received' : 'Processing issue'

const body = ok
  ? `<p>We have ${status === 'manual_review' ? 'received' : 'processed'} your data request for <strong>${email}</strong>.</p>
     <p>Status: <strong>${status}</strong></p>
     <p>If you have questions, reply to this email or contact privacy@intrawebtech.com.</p>`
  : `<p>We could not fully process your data request for <strong>${email}</strong>.</p>
     <p>Please contact privacy@intrawebtech.com for assistance.</p>`

return [
  {
    json: {
      to: email,
      subject: ok ? 'Your IntraWeb data request update' : 'Action needed — IntraWeb data request',
      html: body,
      status,
      ok,
      title,
    },
  },
]
