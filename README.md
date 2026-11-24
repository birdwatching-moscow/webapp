## Getting Started
Start Docker app
docker compose up -d
Open TablePlus → connect to `localhost:5432` / database `birdwatching_moscow` / user `postgres` / password `devpassword`
Start the Next.js dev server: 
pnpm dev

## E2E Tests (Playwright)

Install browsers once (first time only):
pnpm exec playwright install --with-deps chromium

Run all E2E tests locally (requires `pnpm dev` running):
pnpm exec playwright test

Run only API tests (no browser, no server needed):
pnpm exec playwright test --project=api

Open the HTML report after a local run:
pnpm exec playwright show-report

On CI the tests run automatically on every push/PR to `staging` against the staging deployment.