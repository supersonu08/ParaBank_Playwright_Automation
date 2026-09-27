import { test, expect } from '@playwright/test';
import { randomBytes } from 'node:crypto';
import { LoginPage } from '../Pages/LoginPage';
import { NewAccountPage } from '../Pages/NewAccountPage';
import { AccountOverviewPage } from '../Pages/AccountOverviewPage';
import { RegisterPage } from '../Pages/RegisterPage';

const ensureLoggedInUser = async ({ page, loginPage }) => {
    const username = process.env.PARABANK_USERNAME;
    const password = process.env.PARABANK_PASSWORD;

    await loginPage.navigateToSite();

    if (username && password) {
        await loginPage.login(username, password);
        await expect(new AccountOverviewPage(page).heading).toBeVisible();
        return;
    }

    await loginPage.clickRegisterLink();
    const registerPage = new RegisterPage(page);
    const newUsername = `newacc_${randomBytes(6).toString('hex')}`;
    const newPassword = 'Password@123';

    await registerPage.fillPersonalInfo('Test', 'User', '123 Main Street', 'Jaipur');
    await registerPage.fillAddressInfo('Rajasthan', '302001', '9876543210', '123456789');
    await registerPage.fillCredentials(newUsername, newPassword, newPassword);
    await registerPage.clickRegisterButton();

    await expect(registerPage.welcomeHeading).toBeVisible();
};

// These scenarios verify the new-account flow from registration through account creation and visibility.
test.describe('ParaBank Registration', () => {

    let loginPage;
    let newAccPage;
    let accOverviewPage;

    test.beforeEach(async ({ page }) => {
        // Each test starts with a fresh logged-in user and new-account helper.
        loginPage = new LoginPage(page);
        newAccPage = new NewAccountPage(page);
        accOverviewPage = new AccountOverviewPage(page);

        await ensureLoggedInUser({ page, loginPage });
    });

    // TC07: Creating a checking account should show the success message after account creation.
    test('TC07 - Open new Account - Checking', async ({ page }) => {
        await newAccPage.clickSIDEOpenNewAccountButton();

        await newAccPage.clickNewACCbtn();

        await expect(newAccPage.successMessage).toBeVisible();
    });

    // TC08: A savings account should be created successfully and its details should match the generated account ID.
    test('TC08 - Open new Savings account and verify account details', async ({ page }) => {
        await newAccPage.clickSIDEOpenNewAccountButton();
        await newAccPage.selectAccountType('SAVINGS');
        await newAccPage.clickNewACCbtn();

        await expect(newAccPage.successMessage).toBeVisible();
        await expect(newAccPage.newAccountIdLink).toHaveText(/^\d+$/);
        const newAccountId = (await newAccPage.getNewAccountId()).trim();

        await newAccPage.clickIDlink();

        await expect(newAccPage.accountDetailsHeading).toBeVisible();
        await expect(newAccPage.accNumber).toHaveText(newAccountId);
        await expect(newAccPage.accType).toHaveText('SAVINGS');
        await expect(newAccPage.balance).toContainText('$');
    });

    // TC09: After creation, the new account should be visible in the Accounts Overview and show a valid balance.
    test('TC09 - New account appears on Accounts Overview with correct number and balance', async ({ page }) => {
        await newAccPage.clickSIDEOpenNewAccountButton();
        await newAccPage.selectAccountType('CHECKING');
        await newAccPage.clickNewACCbtn();

        await expect(newAccPage.successMessage).toBeVisible();
        await expect(newAccPage.newAccountIdLink).toHaveText(/^\d+$/);
        const newAccountId = (await newAccPage.getNewAccountId()).trim();

        await accOverviewPage.clickAccountOverviewLink();

        const accountRow = accOverviewPage.getRowForAccount(newAccountId);
        await expect(accountRow).toBeVisible();

        const balance = accOverviewPage.getBalanceForAccount(newAccountId);
        await expect(balance).toHaveText(/^\$\d+(\.\d{2})?$/);
    });

});