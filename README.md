# MyTravaly Playwright Automation

This repository contains the end-to-end (E2E) UI test automation suite for [MyTravaly.in](https://www.mytravaly.in/), built with **Playwright**.

## Project Structure
This framework is built using the Page Object Model (POM) design pattern and features a unique hybrid setup allowing JavaScript and TypeScript to seamlessly co-exist to support parallel team development.

- `tests/` - Contains all test spec files.
  - `*.spec.js` - Authored by **Alekhya** (Home Page, Payment, Footer, FAQ).
  - `*.spec.ts` - Authored by **Anshuman** (Checkout, Dashboards, Extranet, Blog, Search, Accessibility).
- `pages/` (and `tests/pages/`) - Page Object Models abstracting UI locators and actions.
- `utils/` - Custom utilities, including the Excel Reporter.
- `test-data/` - Holds test fixtures and the QA test cases spreadsheets.

## Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)

## Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Install Playwright browsers (if this is your first time using Playwright):
   ```bash
   npx playwright install
   ```

## Running the Tests

### Playwright UI Mode (Recommended for Local Dev)
Playwright provides a highly visual time-travel debugger.
```bash
npx playwright test --ui
```
*Note: In the UI mode sidebar, tests are visually separated into **"Anshuman (Your Tests)"** and **"Alekhya (Her Tests)"** projects for easy filtering!*

### CLI Execution
Run all tests in headless mode:
```bash
npx playwright test
```

Run only Anshuman's tests (TypeScript):
```bash
npx playwright test --project="Anshuman (Your Tests)"
```

Run only Alekhya's tests (JavaScript):
```bash
npx playwright test --project="Alekhya (Her Tests)"
```

## Automated Excel Reporting & Collaboration
This project features a custom persistent reporter (`utils/excelReporter.js`) designed for collaborative QA handover between **Anshuman** and **Alekhya**.

Every time you run the test suites (via CLI or UI mode):
1. **Persistent Accumulation:** The reporter checks if `test-data/QA_Test_Cases_Results.xlsx` already exists on disk. If so, it accumulates and updates new results without wiping out previously executed test suites from other files!
2. **Column Correlating:** It maps each test using the Test ID (`MTW-TC-01`, `BLOG-SCN-02`, etc.) in **Column D** (and Scenario TID in Column A) to automatically update **Column I (Status)** and **Column H (Actual Result)**.
3. **Visual Formatting & Data Validation:**
   - **Pass:** Highlighted in solid Green 🟢 with automated execution confirmation.
   - **Fail:** Highlighted in solid Red 🔴 with the exact error message and line number (confirming live bugs).
   - **Skipped:** Highlighted in solid Yellow 🟡 for tests skipped per user instructions or environment limitations.
   - **Data Validation Dropdowns:** Every Status cell in Column I is automatically configured with a spreadsheet data validation dropdown list (`Pass`, `Fail`, `Skipped`, `Not Executed`, `Blocked`) for seamless manual overrides and QA auditing across Excel and Apple Numbers.
4. **Git-Tracked Report:** Unlike standard temporary test artifacts, `test-data/QA_Test_Cases_Results.xlsx` is explicitly tracked in Git so that both teammates and project reviewers can download and inspect the latest spreadsheet directly from GitHub!

## Production Safety
Tests are executed against the live production server. As such:
- `fullyParallel` is disabled in `playwright.config.js` to avoid crashing the server.
- Dangerous transactions (finalizing payments, submitting contact forms, mutating live extranet inventory) are skipped or marked with `test.fixme()` to prevent database pollution.

---
**Authors:** Anshuman & Alekhya
