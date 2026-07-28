# Bug Audit Findings

## BUG 1: AuthContext stores `response.data.user` but backend returns `{ token, userId, businessId }`
- AuthContext.tsx lines 33-34, 42-43: stores `response.data.user` which is `undefined`
- Dashboard.tsx line 41: uses `user?.businessName` which will be undefined
- Fix: Store `response.data` as user, map fields to camelCase

## BUG 2: Dashboard API returns `{ appointments, pendingChats }` but frontend expects `{ totalContacts, upcomingAppointments, totalAppointments, totalMessages, recentActivity }`
- dashboard.controller.ts returns raw appointments array + pendingChats
- Dashboard.tsx expects aggregate counters
- Fix: Update backend to return aggregate data, or fix frontend to use actual data

## BUG 3: Appointments list returns snake_case DB fields but frontend expects camelCase
- listAppointments returns `start_time`, `end_time`, `contact_name`
- Frontend expects `startTime`, `endTime`, `title`
- appointments table has no `title` column
- Fix: Map response fields in backend or frontend

## BUG 4: Settings API contract mismatch
- Frontend sends `{ businessName, email, phone }`, backend accepts `{ faq, hours }`
- Frontend expects `{ businessName, email, phone, createdAt }`, backend returns `{ name, phone, hours_json, faq_json, subscription_tier }`
- Fix: Update backend settings controller to handle businessName/email/phone

## BUG 5: Chat messages use DB fields `message`, `created_at`, sender `customer`/`ai`
- Frontend expects `content`, `timestamp`, sender `user`
- Fix: Map fields in chat controller response

## BUG 6: index.html has broken analytics script tag
- Line 20-23: references `%VITE_ANALYTICS_ENDPOINT%` which won't resolve in Vercel
- Fix: Remove or guard the script tag

## BUG 7: Frontend API hardcoded to production URL
- api.ts line 3: hardcoded to onrender.com URL (this is correct for frontend deployment)

## BUG 8: Appointments update returns only `{ message }` not the updated appointment
- Frontend doesn't refetch after update (not a bug per se but poor UX)
