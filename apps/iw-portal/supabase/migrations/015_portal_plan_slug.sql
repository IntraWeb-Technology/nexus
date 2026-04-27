-- HubSpot-mirrored commercial tier for maintenance package eligibility (closed-set slug, e.g. launch / growth).
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS portal_plan_slug text;

COMMENT ON COLUMN public.projects.portal_plan_slug IS
  'Synced from HubSpot deal property (see HUBSPOT_DEAL_PORTAL_PLAN_PROPERTY). Used to filter STRIPE_MAINTENANCE_PACKAGES plan_slugs.';
