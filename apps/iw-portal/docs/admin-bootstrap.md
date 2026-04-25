# Admin Bootstrap Runbook

The portal uses Clerk for identity and Supabase `staff_users` for authorization.
Do not create a separate Supabase Auth login for staff.

## First Admin

1. Create or identify the staff user in Clerk.
2. Copy the Clerk user id (`user_...`) and primary email.
3. Insert the first admin with the Supabase SQL editor or a service-role script:

```sql
insert into public.staff_users (clerk_user_id, email, display_name, role, is_active)
values ('user_REPLACE_ME', 'admin@example.com', 'Admin', 'admin', true)
on conflict (clerk_user_id) do update
set role = 'admin',
    is_active = true,
    email = excluded.email,
    updated_at = now();
```

After the first admin exists, use `/admin/settings` for role changes.

## Access Model

- `admin`: staff management, destructive actions, feature flags.
- `ops`: operational updates such as change-order review and project data repair.
- `support`: client-facing support updates and message triage.
- `viewer`: read-only admin console access.

All staff access is enforced by Supabase RLS helpers:

- `public.is_staff()`
- `public.staff_role()`
- `public.can_staff_mutate()`
- `public.is_admin()`
