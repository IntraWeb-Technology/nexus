import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..', '..')
const env = readFileSync(join(root, '.env.iw-portal.local'), 'utf8')
const token = env.match(/HUBSPOT_PRIVATE_APP_TOKEN="([^"]+)"/)?.[1]
if (!token) throw new Error('Missing HUBSPOT_PRIVATE_APP_TOKEN')

const headers = {
  Authorization: `Bearer ${token}`,
  'content-type': 'application/json',
}

const searchBody = {
  filterGroups: [
    {
      filters: [
        { propertyName: 'lastname', operator: 'EQ', value: 'Weston' },
        { propertyName: 'firstname', operator: 'CONTAINS_TOKEN', value: 'Christopher' },
      ],
    },
    {
      filters: [
        { propertyName: 'company', operator: 'CONTAINS_TOKEN', value: 'Weston Digital Media' },
      ],
    },
  ],
  properties: ['firstname', 'lastname', 'email', 'company', 'replied_flag'],
  limit: 5,
}

const searchRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
  method: 'POST',
  headers,
  body: JSON.stringify(searchBody),
})
const search = await searchRes.json()
if (!searchRes.ok) {
  console.error(search)
  process.exit(1)
}

const contact = search.results?.[0]
if (!contact?.id) {
  console.log('No Weston Digital contact found')
  process.exit(0)
}

const today = new Date()
today.setUTCHours(0, 0, 0, 0)

const patchRes = await fetch(
  `https://api.hubapi.com/crm/v3/objects/contacts/${contact.id}`,
  {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      properties: {
        replied_flag: 'true',
        last_reactivation_sent_date: String(today.getTime()),
      },
    }),
  },
)
const patched = await patchRes.json()
if (!patchRes.ok) {
  console.error(patched)
  process.exit(1)
}

console.log(
  'Updated',
  contact.properties?.firstname,
  contact.properties?.lastname,
  `(${contact.properties?.email})`,
  '- replied_flag=true, last_reactivation_sent_date=today',
)
