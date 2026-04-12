import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const DEFAULT_NAME_EN = 'Massar';
const DEFAULT_NAME_AR = 'مسار';

export const useAppName = () => {
  const [appNameEn, setAppNameEn] = useState(DEFAULT_NAME_EN);
  const [appNameAr, setAppNameAr] = useState(DEFAULT_NAME_AR);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('app_settings')
        .select('key, value')
        .in('key', ['app_name_en', 'app_name_ar']);
      
      if (data) {
        data.forEach((row) => {
          if (row.key === 'app_name_en' && row.value) setAppNameEn(row.value);
          if (row.key === 'app_name_ar' && row.value) setAppNameAr(row.value);
        });
      }
      setLoaded(true);
    };
    fetch();
  }, []);

  return { appNameEn, appNameAr, loaded };
};
