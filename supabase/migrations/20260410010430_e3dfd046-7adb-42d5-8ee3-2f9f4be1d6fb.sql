
-- Users to delete
-- dcedd259-b785-440d-8e7f-9ffc32572a4f (brandnow@gmail.com)
-- 9bda984e-8c4f-4dde-adc5-a01928252838 (01062268466@driver.massar.app)

-- Delete ride messages for their bookings
DELETE FROM public.ride_messages WHERE booking_id IN (
  SELECT id FROM public.bookings WHERE user_id IN ('dcedd259-b785-440d-8e7f-9ffc32572a4f', '9bda984e-8c4f-4dde-adc5-a01928252838')
);

-- Delete ratings for their bookings
DELETE FROM public.ratings WHERE user_id IN ('dcedd259-b785-440d-8e7f-9ffc32572a4f', '9bda984e-8c4f-4dde-adc5-a01928252838');
DELETE FROM public.ratings WHERE booking_id IN (
  SELECT id FROM public.bookings WHERE user_id IN ('dcedd259-b785-440d-8e7f-9ffc32572a4f', '9bda984e-8c4f-4dde-adc5-a01928252838')
);

-- Delete bookings
DELETE FROM public.bookings WHERE user_id IN ('dcedd259-b785-440d-8e7f-9ffc32572a4f', '9bda984e-8c4f-4dde-adc5-a01928252838');

-- Delete ride instances for their shuttles
DELETE FROM public.ride_instances WHERE driver_id IN ('dcedd259-b785-440d-8e7f-9ffc32572a4f', '9bda984e-8c4f-4dde-adc5-a01928252838');

-- Delete driver schedules
DELETE FROM public.driver_schedules WHERE driver_id IN ('dcedd259-b785-440d-8e7f-9ffc32572a4f', '9bda984e-8c4f-4dde-adc5-a01928252838');

-- Delete shuttle schedules for their shuttles
DELETE FROM public.shuttle_schedules WHERE shuttle_id IN (
  SELECT id FROM public.shuttles WHERE driver_id IN ('dcedd259-b785-440d-8e7f-9ffc32572a4f', '9bda984e-8c4f-4dde-adc5-a01928252838')
);

-- Delete shuttles
DELETE FROM public.shuttles WHERE driver_id IN ('dcedd259-b785-440d-8e7f-9ffc32572a4f', '9bda984e-8c4f-4dde-adc5-a01928252838');

-- Delete driver applications
DELETE FROM public.driver_applications WHERE user_id IN ('dcedd259-b785-440d-8e7f-9ffc32572a4f', '9bda984e-8c4f-4dde-adc5-a01928252838');

-- Delete route requests
DELETE FROM public.route_requests WHERE user_id IN ('dcedd259-b785-440d-8e7f-9ffc32572a4f', '9bda984e-8c4f-4dde-adc5-a01928252838');

-- Delete user roles
DELETE FROM public.user_roles WHERE user_id IN ('dcedd259-b785-440d-8e7f-9ffc32572a4f', '9bda984e-8c4f-4dde-adc5-a01928252838');

-- Delete profiles
DELETE FROM public.profiles WHERE user_id IN ('dcedd259-b785-440d-8e7f-9ffc32572a4f', '9bda984e-8c4f-4dde-adc5-a01928252838');

-- Delete auth users
DELETE FROM auth.users WHERE id IN ('dcedd259-b785-440d-8e7f-9ffc32572a4f', '9bda984e-8c4f-4dde-adc5-a01928252838');
