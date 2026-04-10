
-- Add driver arrival tracking columns to bookings
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS driver_arrived_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS skipped_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS skip_refund_amount NUMERIC DEFAULT NULL;

-- Allow drivers to update bookings for their shuttle (for skip/arrival)
CREATE POLICY "Drivers can update bookings for their shuttles"
ON public.bookings
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM shuttles 
    WHERE shuttles.id = bookings.shuttle_id 
    AND shuttles.driver_id = auth.uid()
  )
);
