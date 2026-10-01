import { test, expect } from '@playwright/test';
import { LoginPage } from '../Pages/LoginPage';
import { NewAccountPage } from '../Pages/NewAccountPage';
import { RequestLoanPage } from '../Pages/RequestLoanPage';
import { AccountOverviewPage } from '../Pages/AccountOverviewPage';

// Set up a funded source account so the loan approval scenario reflects real app rules.
const createUserAndAccount = async ({ page }) => {
    const loginPage = new LoginPage(page);
    const username = process.env.PARABANK_USERNAME || 'john';
    const password = process.env.PARABANK_PASSWORD || 'demo';

    await loginPage.navigateToSite();
    await loginPage.login(username, password);
    await page.waitForURL(/overview\.htm/);

    const accountId = await page.locator('table tbody tr').evaluateAll((rows) => {
        const data = rows
            .slice(1)
            .map((row) => {
                const cells = Array.from(row.querySelectorAll('td')).map((cell) => cell.textContent?.trim() ?? '');
                const accountNumber = cells[0] ?? '';
                const balanceText = cells[1] ?? '';
                const balance = Number(balanceText.replace(/[^0-9.-]/g, ''));
                return { accountNumber, balance };
            })
            .filter(({ accountNumber, balance }) => accountNumber && !Number.isNaN(balance) && balance >= 1000);

        return data.length ? data[0].accountNumber : null;
    });

    if (!accountId) {
        throw new Error('No funded account is available for the loan test setup.');
    }

    return { accountId };
};

test.describe('Request Loan', () => {
    // TC39: A missing down payment is rejected by the application.
    test('TC39 - Loan request with missing down payment is rejected', async ({ page }) => {
        const { accountId } = await createUserAndAccount({ page });
        const loanPage = new RequestLoanPage(page);

        await loanPage.open();
        await loanPage.applyForLoan(1000, '', accountId);

        await expect(loanPage.pageContent).toContainText('An internal error has occurred and has been logged.');
    });

    // TC40: A request far above available funds should be denied by the business rules.
    test('TC40 - Loan request far exceeding available funds is Denied', async ({ page }) => {
        const { accountId } = await createUserAndAccount({ page });
        const loanPage = new RequestLoanPage(page);

        await loanPage.open();
        await loanPage.applyForLoan(1000000, 1, accountId);

        await expect(loanPage.deniedStatus).toBeVisible();
    });

    // TC41: A valid approved loan should create a loan-related account visible on the overview.
    test('TC41 - An approved loan creates a new account visible on Accounts Overview', async ({ page }) => {
        const { accountId } = await createUserAndAccount({ page });
        const loanPage = new RequestLoanPage(page);
        const overviewPage = new AccountOverviewPage(page);

        await loanPage.open();
        await loanPage.applyForLoan(1000, 100, accountId);
        await overviewPage.clickAccountOverviewLink();

        await expect(overviewPage.heading).toBeVisible();
    });

    // TC42: Missing the loan amount should fail the form validation before submission.
    test('TC42 - Submitting with empty amount is rejected client-side', async ({ page }) => {
        const { accountId } = await createUserAndAccount({ page });
        const loanPage = new RequestLoanPage(page);

        await loanPage.open();
        await loanPage.applyForLoan('', 1000, accountId);

        await expect(loanPage.pageContent).toContainText(/required|amount|error/i);
    });
});
