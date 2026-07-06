const search = $('Search HubSpot Contact').first().json
const results = search.results || []
const email = $('Validate Unsubscribe Link').first().json.email
const contact = results[0] || null
const contactId = contact?.id ? String(contact.id) : ''
const firstName = contact?.properties?.firstname || ''
const lastName = contact?.properties?.lastname || ''

return [
  {
    json: {
      email,
      contactId,
      contactFound: Boolean(contactId),
      contactName: `${firstName} ${lastName}`.trim() || email,
    },
  },
]
