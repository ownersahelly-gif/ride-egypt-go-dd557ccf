ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS custom_dropoff_lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS custom_dropoff_lng DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS custom_dropoff_name TEXT;