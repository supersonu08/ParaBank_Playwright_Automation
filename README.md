# ParaBank Playwright Automation

End-to-end UI test automation framework for [ParaBank](https://parabank.parasoft.com/parabank/index.htm), a publicly hosted online banking demo application, built with **Playwright** and **JavaScript** using the **Page Object Model**.

The suite validates core banking workflows: registration, login, account creation, fund transfers, bill payments, transaction search, profile updates, and loan requests — with both positive and negative scenarios for each.

---

## Table of Contents

- [Application Under Test](#application-under-test)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Test Coverage](#test-coverage)
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [Test Data Strategy](#test-data-strategy)
- [HTML Reporting](#html-reporting)
- [Continuous Integration](#continuous-integration)
- [Page Object Model](#page-object-model)
- [Quality Practices](#quality-practices)
- [Known Limitations](#known-limitations)

---

## Application Under Test

| | |
|---|---|
| **Application** | ParaBank Online Banking (Parasoft demo) |
| **URL** | https://parabank.parasoft.com/parabank/index.htm |
| **Automation Tool** | Playwright |
| **Language** | JavaScript |
| **Browsers** | Chromium, Firefox, WebKit |
| **Test Runner** | Playwright Test |

## Tech Stack

- **Playwright Test** — browser automation and assertions
- **JavaScript (ES Modules)** — test and framework code
- **Page Object Model** — one class per application screen
- **Playwright HTML Reporter** — results, traces, and screenshots on failure

## Project Structure

```text
ParaBank_Playwright_Automation/
│
├── Pages/
│   ├── AccountOverviewPage.js
│   ├── BillPayPage.js
│   ├── FindTransactionsPage.js
│   ├── LoginPage.js
│   ├── NewAccountPage.js
│   ├── RegisterPage.js
│   ├── RequestLoanPage.js
│   ├── TransferFundsPage.js
│   └── UpdateProfilePage.js
│
├── tests/
│   ├── billPay.spec.js
│   ├── findTransactions.spec.js
│   ├── login.spec.js
│   ├── newAccount.spec.js
│   ├── register.spec.js
│   ├── requestLoan.spec.js
│   ├── transferFunds.spec.js
│   └── updateProfile.spec.js
│
├── .github/workflows/
│   └── playwright.yml
│
├── playwright.config.js
├── package.json
└── README.md
```

Each page object exposes locators and reusable actions only — test files stay readable and independent of locator implementation details.

## Test Coverage

| Test Cases | Module |
|---|---|
| TC01–TC06 | User Registration |
| TC07–TC09 | New Account Creation |
| TC10–TC17 | Login & Session Management |
| TC18–TC23 | Fund Transfers |
| TC24–TC30 | Bill Payments |
| TC31–TC35 | Find Transactions |
| TC36–TC38 | Update Profile |
| TC39–TC42 | Request Loan |

**Total coverage: 42 end-to-end test cases**, covering positive paths, form validation, and backend-enforced negative scenarios (e.g. duplicate usernames, mismatched account verification).

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm
- Internet access to the public ParaBank demo application

### Installation

```bash
git clone https://github.com/supersonu08/ParaBank_Playwright_Automation.git
cd ParaBank_Playwright_Automation
npm install
npx playwright install
```

## Running Tests

```bash
# Run the full suite (sequential — see note below)
npx playwright test

# Run against a single browser
npx playwright test --project=chromium

# Run one spec file
npx playwright test login.spec.js --project=chromium

# Run a single test case by name
npx playwright test login.spec.js -g "TC10" --project=chromium

# Open the interactive UI mode while debugging
npx playwright test --ui
```

The project runs with `workers: 1` and `retries: 0` by default to avoid placing unnecessary load on the shared public ParaBank server.

## Test Data Strategy

Every test that needs an authenticated session **registers a fresh, dynamically generated user through the UI** (unique username per run) rather than depending on a fixed seeded account. This keeps the suite:

- **Self-contained** — no manual account setup before a run
- **Re-runnable** — no leftover state from a previous run to clean up
- **Parallel-safe** — no two tests fighting over the same login

If you want to point specific tests at a known existing account instead (useful for quick manual debugging against a stable login), the following environment variables are read as an optional override:

```bash
# PowerShell
$env:PARABANK_USERNAME="your_username"
$env:PARABANK_PASSWORD="your_password"

# Command Prompt
set PARABANK_USERNAME=your_username
set PARABANK_PASSWORD=your_password
```

This is a fallback for local debugging only — the default suite does not require it.

## HTML Reporting

```bash
npx playwright show-report
```

The report includes pass/fail status, execution duration, error messages, and — on failure — screenshots, video, and a full step-by-step trace.

## Continuous Integration

A GitHub Actions workflow (`.github/workflows/playwright.yml`) runs the suite on every push and pull request to `main`, and uploads the HTML report as a downloadable build artifact. Add a workflow status badge once the repo is public:

```markdown
[![Playwright Tests](https://github.com/supersonu08/ParaBank_Playwright_Automation/actions/workflows/playwright.yml/badge.svg)](https://github.com/supersonu08/ParaBank_Playwright_Automation/actions)
```

## Page Object Model

Each application module has a dedicated page object containing locators, navigation methods, form interactions, and reusable business actions:

```javascript
const loginPage = new LoginPage(page);
await loginPage.navigateToSite();
await loginPage.login(username, password);
await loginPage.logout();
```

## Quality Practices

- Tests organized by business functionality, one spec file per module
- Dynamic test data generation — no hard-coded, reusable credentials
- Positive and negative scenarios for every workflow
- Assertions validate business outcomes (e.g. account balances after a transfer), not just confirmation banners
- Explicit navigation and form-readiness waits to reduce flaky behavior
- Sequential execution against the shared public demo environment
- Shared setup logic centralized in reusable page object methods

## Known Limitations

ParaBank is a publicly hosted demo application; its database and availability are outside this project's control. Registration and account operations may occasionally fail due to shared test data, server resets, or slow responses from the public environment. For reliable CI execution, point the suite at a locally hosted or dedicated ParaBank instance.

**Specifically flaky area:** the Request Loan result renders inside an iframe, which is more timing-sensitive than the rest of the app — if `requestLoan.spec.js` fails intermittently, check the iframe result locator and load timing first.
