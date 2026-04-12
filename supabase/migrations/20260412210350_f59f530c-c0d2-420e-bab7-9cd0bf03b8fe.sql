CREATE POLICY "Partners can update their own route requests"
ON public.partner_route_requests
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM partner_companies
    WHERE partner_companies.id = partner_route_requests.partner_id
    AND partner_companies.user_id = auth.uid()
  )
);