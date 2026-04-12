
DROP POLICY "System can create referrals" ON public.partner_referrals;
CREATE POLICY "Authenticated users can create referrals" ON public.partner_referrals FOR INSERT WITH CHECK (auth.uid() = referred_user_id);
