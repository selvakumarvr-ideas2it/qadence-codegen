# Recording App (React + Node + Playwright)

This application provides a **Playwright recording service** with a simple **React dashboard**.

It supports:

1. Receiving recording configuration via `RECORDING_CONFIG_URL`
2. Start/Stop recording control via `RECORDING_CONTROL_URL`
3. Invoking `npx playwright codegen` to generate a `record.spec.ts`
4. Post-processing the generated `record.spec.ts` to capture screenshots **after each event**
5. Running the test to actually generate screenshots
6. Uploading the spec + screenshots to an external endpoint (`UPLOAD_TEST_RECORDS_URL`)
7. Handling **multiple parallel recording sessions** (one per `recordingId`)
8. A small React UI to manage sessions

---

## Tech Stack

- **Backend**: Node.js, Express
- **Recording**: Playwright (`npx playwright codegen` and `npx playwright test`)
- **Frontend**: React + Vite (TypeScript)
- **Upload**: Axios + multipart form-data

---

## Prerequisites

- Node.js (>= 18 recommended)
- Playwright installed in the **server** project:

  ```bash
  cd server
  npm install -D @playwright/test
  npx playwright install
