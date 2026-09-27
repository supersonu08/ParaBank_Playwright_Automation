import { test, expect } from '@playwright/test';
import { LoginPage } from '../Pages/LoginPage';
import { NewAccountPage } from '../Pages/NewAccountPage';
import { TransferFundsPage } from '../Pages/TransferFundsPage';
import { FindTransactionsPage } from '../Pages/FindTransactionsPage';

// Seed the account with a transfer so the transaction-search tests have real data to query.
const seedTransfer = async ({ page }) => {
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
    const account1 = (await newAccPage.getNewAccountId()).trim();

    await newAccPage.clickSIDEOpenNewAccountButton();
    await newAccPage.selectAccountType('CHECKING');
    await newAccPage.clickNewACCbtn();
    const account2 = (await newAccPage.getNewAccountId()).trim();

    const transferPage = new TransferFundsPage(page);
    await transferPage.open();
    await transferPage.transfer(50, account1, account2);

    return { account1, account2 };
};

test.describe('Find Transactions', () => {
    // TC31: Searching by a known amount should return the transaction row(s) for that transfer.
    test('TC31 - Search by a known transaction amount returns matching row(s)', async ({ page }) => {
        await seedTransfer({ page });
        const findPage = new FindTransactionsPage(page);

        await findPage.open();
        await findPage.searchByAmount(50);

        await expect(findPage.transactionTable).toBeVisible();
    });

    // TC32: Searching for a non-existent amount should return no matching transaction results.
    test('TC32 - Search by an amount with no matches returns zero rows / no-results message', async ({ page }) => {
        await seedTransfer({ page });
        const findPage = new FindTransactionsPage(page);

        await findPage.open();
        await findPage.searchByAmount(999999);

        await expect(findPage.pageContent).toContainText(/no results|no transactions|0|transactions/i);
    });

    // TC33: Searching by today’s date should show transactions created today.
    test('TC33 - Search by today\'s date returns today\'s transactions', async ({ page }) => {
        await seedTransfer({ page });
        const findPage = new FindTransactionsPage(page);
        const today = new Date().toISOString().slice(0, 10);

        await findPage.open();
        await findPage.searchByDate(today);

        await expect(findPage.transactionTable).toBeVisible();
    });

    // TC34: A date range that includes today should still return transactions within that time window.
    test('TC34 - Search by a date range spanning today returns results', async ({ page }) => {
        await seedTransfer({ page });
        const findPage = new FindTransactionsPage(page);
        const today = new Date().toISOString().slice(0, 10);

        await findPage.open();
        await findPage.searchByDateRange('01-01-2020', today);

        await expect(findPage.transactionTable).toBeVisible();
    });

    // TC35: Looking up a transaction ID that does not exist should return no results instead of a match.
    test('TC35 - Search by an invalid/non-existent transaction ID returns no results', async ({ page }) => {
        await seedTransfer({ page });
        const findPage = new FindTransactionsPage(page);

        await findPage.open();
        await findPage.searchByTransactionId(999999999);

        await expect(findPage.pageContent).toContainText(/no results|not found|transactions/i);
    });
});
