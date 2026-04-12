import { useBookingNotifications } from '@/hooks/useBookingNotifications';
import { useRideMessageNotifications } from '@/hooks/useRideMessageNotifications';
import { usePushNotifications } from '@/hooks/usePushNotifications';

/**
 * Invisible component that activates all global notification hooks.
 * Must be rendered inside AuthProvider.
 */
const GlobalNotifications = () => {
  useBookingNotifications();
  useRideMessageNotifications();
  usePushNotifications();
  return null;
};

export default GlobalNotifications;
