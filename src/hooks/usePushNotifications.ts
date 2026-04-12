import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Registers the device for push notifications on native platforms (iOS/Android).
 * Saves the FCM/APNs token to the device_tokens table.
 * On web, this is a no-op.
 */
export const usePushNotifications = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    if (!Capacitor.isNativePlatform()) return;

    const register = async () => {
      try {
        let permStatus = await PushNotifications.checkPermissions();

        if (permStatus.receive === 'prompt') {
          permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive !== 'granted') {
          console.log('Push notification permission not granted');
          return;
        }

        await PushNotifications.register();
      } catch (err) {
        console.error('Push registration error:', err);
      }
    };

    // Listen for registration success
    const registrationListener = PushNotifications.addListener(
      'registration',
      async (token) => {
        const platform = Capacitor.getPlatform(); // 'ios' | 'android'

        // Upsert the token
        const { data: existing } = await supabase
          .from('device_tokens')
          .select('id')
          .eq('user_id', user.id)
          .eq('platform', platform)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('device_tokens')
            .update({ token: token.value, updated_at: new Date().toISOString() })
            .eq('id', existing.id);
        } else {
          await supabase
            .from('device_tokens')
            .insert({ user_id: user.id, token: token.value, platform });
        }

        console.log('Push token registered:', platform);
      }
    );

    // Listen for errors
    const errorListener = PushNotifications.addListener(
      'registrationError',
      (error) => {
        console.error('Push registration error:', error);
      }
    );

    // Listen for notifications received while app is open
    const notifListener = PushNotifications.addListener(
      'pushNotificationReceived',
      (notification) => {
        console.log('Push notification received:', notification);
      }
    );

    register();

    return () => {
      registrationListener.then(l => l.remove());
      errorListener.then(l => l.remove());
      notifListener.then(l => l.remove());
    };
  }, [user]);
};
