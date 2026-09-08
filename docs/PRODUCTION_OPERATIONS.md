# FitFlow Production Operations

This document is a release checklist, not a substitute for configuring the
hosting, Supabase, EAS, and error-monitoring providers.

## Required configuration

- `EXPO_PUBLIC_SUPABASE_URL`: the staging or production Supabase project URL.
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: the corresponding public client key.
- Supabase Auth email provider and redirect URLs for the `fitflow` scheme and
  production web origin.
- EAS Android signing and iOS distribution credentials.
- A production error/crash provider configured without collecting passwords,
  access tokens, refresh tokens, or full recovery URLs.

## Database release procedure

1. Apply migrations to a clean staging project with the Supabase CLI.
2. Verify the profile and session tables, indexes, triggers, and RLS policies.
3. Test anonymous access, same-user access, and cross-user denial.
4. Take or verify a recoverable backup before production migration.
5. Apply the exact tested migration set to production.
6. Record the applied migration version and verify the deployment.

## Recovery requirements

- Enable Supabase backups or point-in-time recovery appropriate to the plan.
- Perform a restore drill before launch and retain the result.
- Keep the previous mobile/web release available for rollback.
- Do not apply destructive migrations without a tested backup and rollback plan.

## Monitoring and alerting

Monitor and alert on:

- App initialization failures
- Authentication failures and recovery failures
- Profile synchronization failures
- Workout-session synchronization failures
- Supabase database errors and elevated latency
- Crash-free sessions and release health
- Web availability and deployment failures

Operational logs must contain event names and non-sensitive technical context
only. The client observability boundary is in `src/services/observability.ts`.

## Release verification

- Run the CI quality workflow on Node 22.13.x.
- Run `npx expo-doctor` and `npx expo export --platform web`.
- Build Android and iOS release artifacts with EAS.
- Install the artifacts on real target devices.
- Test signup, login, logout, password recovery, profile updates, workout
  completion, failed writes, deep links, and notification behavior.
- Confirm monitoring receives a controlled staging error without sensitive data.
