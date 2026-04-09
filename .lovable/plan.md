

# Readiness Fix Plan

## Summary
The app is functionally complete but has two critical issues preventing real-world use, plus minor cleanup.

## Critical Fixes

### 1. Fix profiles RLS so passengers can see driver info
Currently the `profiles` table only allows `auth.uid() = user_id` for SELECT. This means when a passenger loads My Bookings or Track Ride, the driver profile query returns empty.

**Fix:** Add an RLS policy allowing authenticated users to read any profile (names and phones are not highly sensitive in a ride-sharing context, and drivers expect passengers to see their info).

```sql
CREATE POLICY "Authenticated users can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);
```

### 2. Remove duplicate wildcard route in App.tsx
Delete the second `<Route path="*" element={<NotFound />} />` line.

### 3. (Optional) Document remaining gaps for the user
- Real-time GPS tracking requires the driver app to periodically update `shuttles.current_lat/lng`
- Email verification is not enforced
- Shuttles need `driver_id` assigned (via admin or driver self-assignment)

## Technical Details
- **Migration:** One SQL statement for the new RLS policy on `profiles`
- **Code change:** Remove duplicate line in `src/App.tsx` (line ~53)
- No new tables or columns needed

