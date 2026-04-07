-- Allow clients to withdraw pending change orders from the portal (RLS-scoped UPDATE).
-- HubSpot form submissions are independent; deleting them does not remove portal rows.

ALTER TABLE public.change_orders DROP CONSTRAINT IF EXISTS change_orders_status_check;
ALTER TABLE public.change_orders ADD CONSTRAINT change_orders_status_check
  CHECK (status IN ('pending', 'reviewed', 'approved', 'declined', 'cancelled'));

DROP POLICY IF EXISTS change_orders_update_cancel_pending ON public.change_orders;
CREATE POLICY change_orders_update_cancel_pending ON public.change_orders
  FOR UPDATE
  USING (
    project_id IN (SELECT public.project_ids_for_user())
    AND status = 'pending'
  )
  WITH CHECK (
    project_id IN (SELECT public.project_ids_for_user())
    AND status = 'cancelled'
  );
