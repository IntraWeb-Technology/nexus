/**
 * Portal copy for change-order acknowledgments and PDF preamble.
 *
 * IMPORTANT: This is not legal advice. Have counsel review and approve
 * `preamble`, `ack*Label`, and `ack*Detail` before relying on them in production.
 */

export const changeOrderLegalCopy = {
  preamble: [
    'This document records a request to change the scope, timeline, fees, or other terms of an existing agreement between the parties. It is a record of the client’s request as submitted through the IntraWeb client portal.',
    'Execution or approval of this change order by IntraWeb Technologies may be required before any changed work begins. Fees and schedules are not modified until mutually agreed in writing.',
  ],
  ackAccuracy: {
    label: 'Accuracy',
    detail:
      'I confirm that the information provided in this change order request is accurate and complete to the best of my knowledge.',
  },
  ackAuthority: {
    label: 'Authority',
    detail:
      'I represent that I am authorized to request this change on behalf of my organization.',
  },
  ackWrittenSupersedesVerbal: {
    label: 'Written change orders',
    detail:
      'I understand that scope, pricing, and timelines are not changed by verbal requests alone and require a written change order agreed by both parties.',
  },
  ackElectronicRecords: {
    label: 'Electronic records',
    detail:
      'I consent to use of electronic records and signatures for this request, to the extent permitted by applicable law and any master agreement between the parties.',
  },
} as const
