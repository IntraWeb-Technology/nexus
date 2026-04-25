export const adminNavGroups = [
  {
    label: 'Command',
    items: [
      { href: '/admin', label: 'Overview' },
      { href: '/admin/operations', label: 'Operations Queue' },
      { href: '/admin/data-health', label: 'Data Health' },
      { href: '/admin/integrations', label: 'Integrations' },
    ],
  },
  {
    label: 'Portal',
    items: [
      { href: '/admin/clients', label: 'Clients' },
      { href: '/admin/projects', label: 'Projects' },
      { href: '/admin/messages', label: 'Message Triage' },
      { href: '/admin/change-orders', label: 'Change Orders' },
      { href: '/admin/billing', label: 'Billing' },
      { href: '/admin/os', label: 'OS Data' },
    ],
  },
  {
    label: 'System',
    items: [{ href: '/admin/settings', label: 'Settings' }],
  },
]
