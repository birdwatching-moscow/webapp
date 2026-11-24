## Getting Started
Start Docker app
docker compose up -d
Open TablePlus → connect to `localhost:5432` / database `birdwatching_moscow` / user `postgres` / password `devpassword`
Start the Next.js dev server: 
pnpm dev

## E2E Tests (Playwright)

Tests live in `e2e/`. Structure: Page Object Model (`e2e/pages/`), custom fixtures (`e2e/fixtures/`), Zod API schemas (`e2e/schemas/`).

Install browsers once (first time only):
pnpm exec playwright install --with-deps chromium

Run all E2E tests locally (requires `pnpm dev` running):
pnpm exec playwright test

Run only API tests (no browser, no server needed):
pnpm exec playwright test --project=api

Open the HTML report after a local run:
pnpm exec playwright show-report

On CI the tests run automatically on every push/PR to `staging` (3 shards in parallel, reports merged into one HTML artifact).

Required GitHub secrets: `STAGING_URL`, `STAGING_USER`, `STAGING_PASS`, `AUTH_SECRET`, `E2E_USER_EMAIL`, `E2E_USER_ID`.

## Load Tests (k6)

Scripts live in `k6/`. Requires Docker.

Three scenarios for `POST /api/auth/check-email`:

Smoke — verify the endpoint is alive (1 VU, 10 requests):
docker run --rm -v "<absolute-path-to-repo>/k6:/scripts" grafana/k6 run /scripts/check-email.js -e BASE_URL=<url> -e STAGING_USER=<user> -e STAGING_PASS=<pass> -e SCENARIO=smoke

Load — realistic traffic, checks p95 < 300ms SLO (2 VUs, 60s):
docker run --rm -v "<absolute-path-to-repo>/k6:/scripts" grafana/k6 run /scripts/check-email.js -e BASE_URL=<url> -e STAGING_USER=<user> -e STAGING_PASS=<pass> -e SCENARIO=load

Boundary — ramps up to find where rate limiting kicks in:
docker run --rm -v "<absolute-path-to-repo>/k6:/scripts" grafana/k6 run /scripts/check-email.js -e BASE_URL=<url> -e STAGING_USER=<user> -e STAGING_PASS=<pass> -e SCENARIO=boundary

On CI: GitHub Actions → k6 Load Test → Run workflow → choose scenario (smoke/load/boundary).
Thresholds: p(95) < 300ms on successful responses, server errors < 1%, rate-limited requests < 5% (load only).