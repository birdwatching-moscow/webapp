import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate, Trend } from 'k6/metrics'
import encoding from 'k6/encoding'

const BASE_URL  = __ENV.BASE_URL    || 'http://localhost:3000'
const BASIC_USER = __ENV.STAGING_USER || ''
const BASIC_PASS = __ENV.STAGING_PASS || ''

// Custom metrics — tracked separately from built-in http_req_failed
const rateLimitRate = new Rate('rate_limited_requests')
const serverErrorRate = new Rate('server_error_requests')
const registeredLatency = new Trend('latency_registered_email', true)

// Scenario is selected via -e SCENARIO=smoke|load|boundary
const SCENARIO = __ENV.SCENARIO || 'load'

export const options = {
  scenarios: {
    default: SCENARIO === 'smoke'
      ? {
          // Smoke: 1 VU, 10 requests — just check the endpoint is alive
          executor: 'per-vu-iterations',
          vus: 1,
          iterations: 10,
        }
      : SCENARIO === 'boundary'
      ? {
          // Boundary: ramp up hard to find where rate limiting kicks in
          executor: 'ramping-vus',
          stages: [
            { duration: '5s',  target: 5  },
            { duration: '5s',  target: 15 },
            { duration: '5s',  target: 30 },
            { duration: '5s',  target: 0  },
          ],
        }
      : {
          // Load: realistic traffic — 2 concurrent users (one IP, login-like flow)
          executor: 'ramping-vus',
          stages: [
            { duration: '10s', target: 2  }, // ramp up
            { duration: '40s', target: 2  }, // hold
            { duration: '10s', target: 0  }, // ramp down
          ],
        },
  },

  thresholds: {
    // Real performance SLO: 95% of successful responses under 300ms
    'http_req_duration{expected_response:true}': ['p(95)<300'],

    // Real errors (5xx) must be near zero — 429 is not an error, it's a feature
    server_error_requests: ['rate<0.01'],

    // Rate limiting: acceptable in boundary test, should be 0 in load test
    ...(SCENARIO === 'load' ? { rate_limited_requests: ['rate<0.05'] } : {}),
  },
}

const headers = {
  'Content-Type': 'application/json',
  ...(BASIC_USER && BASIC_PASS
    ? { Authorization: `Basic ${encoding.b64encode(`${BASIC_USER}:${BASIC_PASS}`)}` }
    : {}),
}

function request(email) {
  const start = Date.now()
  const res = http.post(
    `${BASE_URL}/api/auth/check-email`,
    JSON.stringify({ email }),
    { headers },
  )

  // Track 429s and 5xx separately — they mean very different things
  rateLimitRate.add(res.status === 429)
  serverErrorRate.add(res.status >= 500)

  if (res.status === 200) {
    registeredLatency.add(Date.now() - start)
  }

  return res
}

export default function () {
  const resKnown = request('smekhova.p@gmail.com')
  check(resKnown, {
    'known email → 200':              (r) => r.status === 200,
    'known email → registered:true':  (r) => r.status === 200 && r.json('registered') === true,
    'rate limited (expected at load)': (r) => r.status !== 429 || SCENARIO === 'boundary',
  })

  sleep(1)

  const resUnknown = request('nobody-' + __VU + '@example.com')
  check(resUnknown, {
    'unknown email → 200':              (r) => r.status === 200,
    'unknown email → registered:false': (r) => r.status === 200 && r.json('registered') === false,
  })

  sleep(1)
}
