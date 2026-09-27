import { test, expect } from '@playwright/test';
import { randomBytes } from 'node:crypto';
import { LoginPage } from '../Pages/LoginPage';
import { NewAccountPage } from '../Pages/NewAccountPage';
import { TransferFundsPage } from '../Pages/TransferFundsPage';
import { AccountOverviewPage } from '../Pages/AccountOverviewPage';
import { RegisterPage } from '../Pages/RegisterPage';

// Create a user with two checking accounts so we can test transfers between the same customer’s accounts.
const createUserAndTwoAccounts = async ({ page }) => {
    const loginPage = new LoginPage(page);
    const newAccPage = new NewAccountPage(page);
    const username = process.env.PARABANK_USERNAME;
    const password = process.env.PARABANK_PASSWORD;

    await loginPage.navigateToSite();

    if (username && password) {
        await loginPage.login(username, password);
        await expect(new AccountOverviewPage(page).heading).toBeVisible();
    } else {
        await loginPage.clickRegisterLink();
        const registerPage = new RegisterPage(page);
        const newUsername = `xfer_${randomBytes(6).toString('hex')}`;
        const newPassword = 'Password@123';

        await registerPage.fillPersonalInfo('Test', 'User', '123 Main Street', 'Jaipur');
        await registerPage.fillAddressInfo('Rajasthan', '302001', '9876543210', '123456789');
        await registerPage.fillCredentials(newUsername, newPassword, newPassword);
        await registerPage.clickRegisterButton();

        await expect(registerPage.welcomeHeading).toBeVisible();
    }

    await newAccPage.clickSIDEOpenNewAccountButton();
    await newAccPage.selectAccountType('CHECKING');
    await newAccPage.clickNewACCbtn();
    const account1 = (await newAccPage.getNewAccountId()).trim();

    await newAccPage.clickSIDEOpenNewAccountButton();
    await newAccPage.selectAccountType('CHECKING');
    await newAccPage.clickNewACCbtn();
    const account2 = (await newAccPage.getNewAccountId()).trim();

    return { account1, account2 };
};

test.describe.serial('Transfer Funds', () => {
    // TC18: A normal transfer between two owned accounts should complete successfully.
    test('TC18 - Transfer a valid amount between own accounts succeeds', async ({ page }) => {
        const { account1, account2 } = await createUserAndTwoAccounts({ page });
        const transferPage = new TransferFundsPage(page);

        await transferPage.open();
        await transferPage.transfer(100, account1, account2);

        await expect(transferPage.resultPanel).toContainText('Transfer Complete!');
    });

    // TC19: The transfer should debit the source and credit the destination account balances.
    test('TC19 - Transferred amount is correctly debited from source and credited to destination', async ({ page }) => {
        const { account1, account2 } = await createUserAndTwoAccounts({ page });
        const transferPage = new TransferFundsPage(page);
        const accountOverviewPage = new AccountOverviewPage(page);

        await accountOverviewPage.clickAccountOverviewLink();
        const sourceBefore = await accountOverviewPage.getBalanceAmountForAccount(account1);
        const destinationBefore = await accountOverviewPage.getBalanceAmountForAccount(account2);

        await transferPage.open();
        await transferPage.transfer(100, account1, account2);

        await accountOverviewPage.clickAccountOverviewLink();
        const sourceAfter = await accountOverviewPage.getBalanceAmountForAccount(account1);
        const destinationAfter = await accountOverviewPage.getBalanceAmountForAccount(account2);

        expect(sourceAfter).toBe(sourceBefore - 100);
        expect(destinationAfter).toBe(destinationBefore + 100);
    });

    // TC20: The public demo currently completes zero-value transfers.
    test('TC20 - Zero amount is reported as transferred', async ({ page }) => {
        const { account1, account2 } = await createUserAndTwoAccounts({ page });
        const transferPage = new TransferFundsPage(page);

        await transferPage.open();
        await transferPage.transfer(0, account1, account2);

        await expect(transferPage.resultPanel).toBeVisible();
        await expect(transferPage.transferSummary).toHaveText(
            `$0.00 has been transferred from account #${account1} to account #${account2}.`
        );
    });

    // TC21: The public demo currently completes negative-value transfers.
    test('TC21 - Negative amount is reported as transferred', async ({ page }) => {
        const { account1, account2 } = await createUserAndTwoAccounts({ page });
        const transferPage = new TransferFundsPage(page);

        await transferPage.open();
        await transferPage.transfer(-1, account1, account2);

        await expect(transferPage.resultPanel).toBeVisible();
        await expect(transferPage.transferSummary).toHaveText(
            `-$1.00 has been transferred from account #${account1} to account #${account2}.`
        );
    });

    // TC22: Non-numeric values should not be accepted in the transfer amount field.
    test('TC22 - Transfer with non-numeric amount is rejected', async ({ page }) => {
        const { account1, account2 } = await createUserAndTwoAccounts({ page });
        const transferPage = new TransferFundsPage(page);

        await transferPage.open();
        await transferPage.amountInput.fill('abc');
        await transferPage.fromAccountId.selectOption(String(account1));
        await transferPage.toAccountId.selectOption(String(account2));
        await transferPage.transferButton.click();

        await expect(transferPage.nonNumericAmountErrorHeading).toBeVisible();
    });

    // TC23: Transferring to the same account should not change balances.
    test('TC23 - Transfer to the same account (from == to) — balance unchanged', async ({ page }) => {
        const { account1 } = await createUserAndTwoAccounts({ page });
        const transferPage = new TransferFundsPage(page);
        const overview = new AccountOverviewPage(page);

        await overview.clickAccountOverviewLink();
        const before = overview.getBalanceForAccount(account1);
        await expect(before).toHaveText(/^\$\d+(\.\d{2})?$/);
        const beforeText = await before.textContent();
        await transferPage.open();
        await transferPage.transfer(50, account1, account1);

        await overview.clickAccountOverviewLink();
        const after = overview.getBalanceForAccount(account1);
        await expect(after).toHaveText(beforeText);
    });
});
