const baseUrl = process.env.APP_BASE_URL?.replace(/\/$/, "");

if (!baseUrl) {
  console.error("APP_BASE_URL is required, for example https://workpulse.example");
  process.exit(1);
}

if (!baseUrl.startsWith("https://") && !baseUrl.startsWith("http://localhost")) {
  console.error("APP_BASE_URL must use HTTPS (localhost HTTP is allowed for local checks)");
  process.exit(1);
}

const routes = [
  "/",
  "/api/health",
  "/privacy",
  "/terms",
  "/roadmap",
  "/for-teams",
  "/api/calendar/providers",
  "/api/calendar/google/status",
];
let failures = 0;

for (const route of routes) {
  const url = new URL(route, `${baseUrl}/`);

  try {
    const response = await fetch(url, {
      headers: { "user-agent": "WorkPulse release smoke test" },
      redirect: "follow",
    });

    if (!response.ok) {
      console.error(`FAIL ${url}: HTTP ${response.status}`);
      failures += 1;
      continue;
    }

    console.log(`PASS ${url}: HTTP ${response.status}`);

    if (route === "/") {
      const requiredHeaders = {
        "content-security-policy": "default-src 'self'",
        "permissions-policy": "camera=(self)",
        "referrer-policy": "strict-origin-when-cross-origin",
        "cross-origin-opener-policy": "same-origin",
        "x-content-type-options": "nosniff",
        "x-frame-options": "DENY",
        ...(baseUrl.startsWith("https://")
          ? { "strict-transport-security": "max-age=31536000" }
          : {}),
      };

      for (const [header, expectedValue] of Object.entries(requiredHeaders)) {
        const actualValue = response.headers.get(header) ?? "";
        if (!actualValue.includes(expectedValue)) {
          console.error(
            `FAIL ${url}: ${header} does not include ${JSON.stringify(expectedValue)}`,
          );
          failures += 1;
        }
      }

      const body = await response.text();
      if (!body.includes("WorkPulse")) {
        console.error(`FAIL ${url}: response does not contain WorkPulse`);
        failures += 1;
      }
    }
  } catch (error) {
    console.error(`FAIL ${url}: ${error instanceof Error ? error.message : error}`);
    failures += 1;
  }
}

if (failures > 0) {
  console.error(`Smoke test failed with ${failures} problem(s).`);
  process.exit(1);
}

console.log("Smoke test passed.");
