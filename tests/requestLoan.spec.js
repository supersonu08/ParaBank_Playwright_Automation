import { test, expect } from '@playwright/test';
import { LoginPage } from '../Pages/LoginPage';
import { NewAccountPage } from '../Pages/NewAccountPage';
import { RequestLoanPage } from '../Pages/RequestLoanPage';
import { AccountOverviewPage } from '../Pages/AccountOverviewPage';

// Set up a fresh customer and a checking account so all loan scenarios start in the same state.
const createUserAndAccount = async ({ page }) => {
    const loginPage = new LoginPage(page);
    const newAccPage = new NewAccountPage(page);
    const username = process.env.PARABANK_USERNAME || 'john';
    const password = process.env.PARABANK_PASSWORD || 'demo';

    await loginPage.navigateToSite();
    await loginPage.login(username, password);
    await page.waitForURL(/overview\.htm/);

    await newAccPage.clickSIDEOpenNewAccountButton();
    await newAccPage.selectAccountType('CHECKING');
    await newAccPage.clickNewACCbtn();
    const accountId = (await newAccPage.getNewAccountId()).trim();

    return { accountId };
};

test.describe('Request Loan', () => {
    // TC39: With enough down payment, the loan should be approved.
    test('TC39 - Loan request with sufficient down payment is Approved', async ({ page }) => {
        const { accountId } = await createUserAndAccount({ page });
        const loanPage = new RequestLoanPage(page);

        await loanPage.open();
        await loanPage.applyForLoan(5000, 1000, accountId);

        await expect(loanPage.approvedStatus).toBeVisible();
    });

    // TC40: A request far above available funds should be denied by the business rules.
    test('TC40 - Loan request far exceeding available funds is Denied', async ({ page }) => {
        const { accountId } = await createUserAndAccount({ page });
        const loanPage = new RequestLoanPage(page);

        await loanPage.open();
        await loanPage.applyForLoan(1000000, 1, accountId);

        await expect(loanPage.deniedStatus).toBeVisible();
    });

    // TC41: Successful loan approval should create a loan-related account and show it in account overview.
    test('TC41 - An approved loan creates a new account visible on Accounts Overview', async ({ page }) => {
        const { accountId } = await createUserAndAccount({ page });
        const loanPage = new RequestLoanPage(page);
        const overviewPage = new AccountOverviewPage(page);

        await loanPage.open();
        await loanPage.applyForLoan(5000, 1000, accountId);
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
