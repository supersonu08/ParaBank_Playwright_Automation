import { test, expect } from '@playwright/test';
import { randomBytes } from 'node:crypto';
import { LoginPage } from '../Pages/LoginPage';
import { AccountOverviewPage } from '../Pages/AccountOverviewPage';
import { RegisterPage } from '../Pages/RegisterPage';

const password = 'Password@123';

// Reusable setup for login tests: create a valid user first so we can test login behavior against a real account.
const registerUser = async ({ page }) => {
    const loginPage = new LoginPage(page);
    const username = process.env.PARABANK_USERNAME;
    const storedPassword = process.env.PARABANK_PASSWORD;

    await loginPage.navigateToSite();

    if (username && storedPassword) {
        await loginPage.login(username, storedPassword);
        await expect(new AccountOverviewPage(page).heading).toBeVisible();
        return { loginPage, username, password: storedPassword };
    }

    await loginPage.clickRegisterLink();
    const registerPage = new RegisterPage(page);
    const newUsername = `login_${randomBytes(6).toString('hex')}`;

    await registerPage.fillPersonalInfo('Test', 'User', '123 Main Street', 'Jaipur');
    await registerPage.fillAddressInfo('Rajasthan', '302001', '9876543210', '123456789');
    await registerPage.fillCredentials(newUsername, password, password);
    await registerPage.clickRegisterButton();

    await expect(registerPage.welcomeHeading).toBeVisible();
    return { loginPage, username: newUsername, password };
};

test.describe('ParaBank Login', () => {
    // TC10: A valid username and password should allow the user into the application.
    test('TC10 - Login with valid credentials succeeds', async ({ page }) => {
        const { loginPage, username, password: loginPassword } = await registerUser({ page });

        await loginPage.logout();
        await loginPage.login(username, loginPassword);

        await expect(new AccountOverviewPage(page).heading).toBeVisible();
    });

    // TC11: Wrong credentials should fail with an authentication error message.
    test('TC11 - Login with wrong password shows error', async ({ page }) => {
        const { loginPage, username } = await registerUser({ page });

        await loginPage.logout();
        await loginPage.login(username, 'WrongPassword@123');

        await expect(loginPage.loginErrorHeading).toBeVisible();
        await expect(loginPage.invalidCredentialsMessage).toBeVisible();
    });

    // TC12: An unknown account should not allow login and should show a server-side validation error.
    test('TC12 - Login with unknown username shows error', async ({ page }) => {
        const loginPage = new LoginPage(page);

        await loginPage.navigateToSite();
        await loginPage.login(`unknown_${Date.now()}`, password);

        await expect(loginPage.loginErrorHeading).toBeVisible();
        await expect(loginPage.invalidCredentialsMessage).toBeVisible();
    });

    // TC13: Empty login fields should trigger validation instead of successful authentication.
    test('TC13 - Login with empty username and password shows validation error', async ({ page }) => {
        const loginPage = new LoginPage(page);

        await loginPage.navigateToSite();
        await loginPage.login('', '');

        await expect(loginPage.loginErrorHeading).toBeVisible();
    });

    // TC14: A valid username without a password should be rejected as invalid login.
    test('TC14 - Login with valid username but empty password shows error', async ({ page }) => {
        const { loginPage, username } = await registerUser({ page });

        await loginPage.logout();
        await loginPage.login(username, '');

        await expect(loginPage.loginErrorHeading).toBeVisible();
    });

    // TC15: Username matching is case-sensitive; uppercase input should not authenticate the account.
    test('TC15 - Username is case-sensitive', async ({ page }) => {
        const { loginPage, username, password: loginPassword } = await registerUser({ page });

        await loginPage.logout();
        await loginPage.login(username.toUpperCase(), loginPassword);

        await expect(loginPage.loginErrorHeading).toBeVisible();
        await expect(loginPage.invalidCredentialsMessage).toBeVisible();
    });

    // TC16: A logged-in user should be able to log out and return to the login form.
    test('TC16 - Logged-in user can log out successfully', async ({ page }) => {
        const { loginPage } = await registerUser({ page });

        await loginPage.logout();

        await expect(loginPage.usernameInput).toBeVisible();
    });

    // TC17: Accessing a protected page without a valid session should redirect the user to login.
    test('TC17 - Direct navigation to overview without a session redirects to login', async ({ page }) => {
        const loginPage = new LoginPage(page);

        await page.goto('https://parabank.parasoft.com/parabank/overview.htm');

        await expect(loginPage.usernameInput).toBeVisible();
    });
});