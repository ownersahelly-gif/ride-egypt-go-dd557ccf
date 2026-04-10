
-- Delete all bookings' related data first
DELETE FROM public.ride_messages WHERE booking_id IN (SELECT id FROM public.bookings);
DELETE FROM public.ratings WHERE booking_id IN (SELECT id FROM public.bookings);
DELETE FROM public.bookings;

-- Delete all ride instances
DELETE FROM public.ride_instances;

-- Delete all driver schedules
DELETE FROM public.driver_schedules;

-- Delete all shuttle schedules
DELETE FROM public.shuttle_schedules;
