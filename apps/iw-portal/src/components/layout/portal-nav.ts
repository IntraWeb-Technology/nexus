export const portalNavGroups = [
  {
    label: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', shortLabel: 'Home' },
      { href: '/progress', label: 'Project Progress', shortLabel: 'Progress' },
    ],
  },
  {
    label: 'Communication',
    items: [
      { href: '/messages', label: 'Messages', shortLabel: 'Messages' },
      { href: '/notifications', label: 'Notifications', shortLabel: 'Alerts' },
    ],
  },
  {
    label: 'Project',
    items: [
      { href: '/documents', label: 'Documents', shortLabel: 'Docs' },
      { href: '/change-orders', label: 'Scope changes', shortLabel: 'Changes' },
      { href: '/scope', label: 'Scope of Work', shortLabel: 'Scope' },
    ],
  },
  {
    label: 'Account',
    items: [
      { href: '/billing', label: 'Billing', shortLabel: 'Billing' },
      { href: '/settings', label: 'Settings', shortLabel: 'Settings' },
      { href: '/help', label: 'Help & FAQ', shortLabel: 'Help' },
    ],
  },
]

export const portalNavItems = portalNavGroups.flatMap((group) =>
  group.items.map((item) => ({ ...item, group: group.label })),
)
