# RSVP backend

Supabase project: pfrinblqlxbkgcduvzpf (Jane RSVP).
The live submit-rsvp Edge Function validates an unguessable invitation token, its expiry, the date in Asia/Manila, the response UUID, and both colors. It writes through Supabase's server-only service credential. No secret credential is in the frontend. verify_jwt=false is intentional because the function authenticates the private invitation token itself.

Both public.date_invitations and public.date_responses have RLS enabled and no browser grants. No policies is intentional: all browser reads and direct writes are denied. The Edge Function is the only visitor write path. Luke views responses in Supabase Table Editor → date_responses. There is no public admin route.

Public connection settings are in .env.production. These are safe-to-publish project URL and publishable key only. Never add a service-role key or the invitation token to source. The actual private link is stored separately in the task's outputs/rsvp-private-link.txt, outside this repository. Anyone given that full link can submit, so it is not proof of Jane's identity.

schema.sql documents the applied initial schema. Hosted migrations create_private_rsvp_storage and restrict_auto_rls_trigger_execution were applied through the Supabase connector. Do not rerun schema.sql on the existing project.

Deployment source: submit-rsvp.ts. Deploy it through Supabase with its existing built-in SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY server environment. No additional runtime secrets are required. The submission endpoint does not return stored choices. It returns only saved=true after a durable write, or on an identical request retry. Its CORS allowlist includes the GitHub Pages origin and local preview.

Verified against the live function: valid submission, matching retry, invalid token, past date, invalid color, and forbidden public reads of both tables. Persisted fixed pickup 16:30 and Asia/Manila were checked. The test row was removed afterward. Security advisor reports only informational no-policy notices for the intentionally private tables.

Publishing the frontend is separate: GitHub Pages must use the GitHub Actions workflow. Review the feature branch before merging it to main. Local preview uses npm ci, npm run build, and a static server on port 4173. Open the private preview link to test RSVP.
