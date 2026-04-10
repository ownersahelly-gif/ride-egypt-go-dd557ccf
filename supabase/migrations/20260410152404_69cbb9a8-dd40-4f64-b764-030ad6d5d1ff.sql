
-- Delete all trip-related data
DELETE FROM public.ride_messages;
DELETE FROM public.ratings;
DELETE FROM public.bundle_purchases;
DELETE FROM public.bookings;
DELETE FROM public.ride_instances;
DELETE FROM public.driver_schedules;
DELETE FROM public.shuttle_schedules;
DELETE FROM public.saved_locations;
DELETE FROM public.route_requests;

-- Delete non-owner data
DELETE FROM public.driver_applications WHERE user_id != '8cae77ab-3d55-4a69-b316-90ec593d2a81';
DELETE FROM public.shuttles WHERE driver_id != '8cae77ab-3d55-4a69-b316-90ec593d2a81';
DELETE FROM public.user_roles WHERE user_id != '8cae77ab-3d55-4a69-b316-90ec593d2a81';
DELETE FROM public.profiles WHERE user_id != '8cae77ab-3d55-4a69-b316-90ec593d2a81';
