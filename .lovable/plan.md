## Goal
Split the app into two role-based experiences: **Doctor** and **Patient**, chosen at signup. Each role sees only their relevant tools. Add a "share to pharmacy" email feature for doctors.

## 1. Role system (database)
- Create `app_role` enum: `'doctor' | 'patient'`
- Create `user_roles` table (`id`, `user_id`, `role`, unique on `user_id+role`) with RLS + GRANTs
- Security-definer function `has_role(_user_id, _role)` and `get_user_role(_user_id)`
- Trigger on `auth.users` insert → reads `raw_user_meta_data.role` and inserts into `user_roles` (defaults to `patient`)

## 2. Auth page
- Add a **Role selector** (Doctor / Patient) on the signup form
- Pass `role` in `signUp` options.data so the trigger picks it up
- Login is unchanged — role is fetched after sign-in

## 3. Role-aware routing
- `useAuth` hook returns `{ user, role, loading }`
- `Dashboard` renders different tab sets based on role:
  - **Doctor**: New Rx (voice workflow) · Templates · History · Share to Pharmacy
  - **Patient**: Scan Rx · Product ID · MedAssist
- Tabs the role shouldn't see are hidden in `Header.tsx`

## 4. Share to pharmacy (doctor only)
- In `PreviewStep`, add **"Send to Pharmacy"** button next to Download
- Modal: pharmacy email input + optional note
- Calls `send-pharmacy-rx` edge function with prescription PDF/HTML + patient info
- Uses Lovable's built-in email infrastructure (requires email domain setup — will trigger setup dialog if not configured)

## 5. Files touched
- `supabase/migrations/...` — roles + trigger
- `src/hooks/useAuth.ts` — expose role
- `src/pages/Auth.tsx` — role selector on signup
- `src/components/Header.tsx` — role-filtered tabs
- `src/components/Dashboard.tsx` — role-gated default tab + tab list
- `src/components/PreviewStep.tsx` — Share-to-pharmacy button + modal
- `supabase/functions/send-pharmacy-rx/index.ts` — new edge function

## Technical notes
- Existing `hospital_templates` / `prescriptions` RLS stays scoped by `user_id`; doctor role is enforced at the UI/tab level (and we can later tighten with `has_role`-based policies if needed)
- Patient features (`PrescriptionScanner`, `ProductIdentifier`, `MedAssistant`) already exist — only routing changes
- If no email domain is configured, the pharmacy-share button will trigger the email domain setup flow before sending