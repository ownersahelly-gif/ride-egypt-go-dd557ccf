
-- Trip data
DELETE FROM public.ride_messages;
DELETE FROM public.ratings;
DELETE FROM public.bundle_purchases;
DELETE FROM public.bookings;
DELETE FROM public.ride_instances;
DELETE FROM public.driver_schedules;
DELETE FROM public.shuttle_schedules;
DELETE FROM public.saved_locations;
DELETE FROM public.route_requests;

-- Route-related
DELETE FROM public.stops WHERE route_id != '589d4d7d-cc5c-4aad-9d05-1a25f294e8a1';
DELETE FROM public.ride_bundles WHERE route_id != '589d4d7d-cc5c-4aad-9d05-1a25f294e8a1';
DELETE FROM public.routes WHERE id != '589d4d7d-cc5c-4aad-9d05-1a25f294e8a1';

-- Users & vehicles
DELETE FROM public.driver_applications;
DELETE FROM public.shuttles;
DELETE FROM public.user_roles;
DELETE FROM public.profiles;
