import { expect } from '@playwright/test';

export class LoginPage {

    constructor(page) {
        this.page = page;

        this.usernameInput = page.locator('#loginPanel input[name="username"]');
        this.passwordInput = page.locator('#loginPanel input[name="password"]');
        this.loginButton = page.getByRole('button', { name: 'Log In', exact: true });
        this.logoutLink = page.getByRole('link', { name: 'Log Out', exact: true });
        this.forgotLoginLink = page.getByRole('link', { name: 'Forgot login info?', exact: true });
        this.registerLink = page.getByRole('link', { name: 'Register', exact: true });
        this.loginErrorHeading = page.getByRole('heading', { name: 'Error!', exact: true });
        this.invalidCredentialsMessage = page.getByText('The username and password could not be verified.', { exact: true });
    }

    async navigateToSite() {
        await this.page.goto("https://parabank.parasoft.com/parabank/index.htm", { waitUntil: 'domcontentloaded' });
        await expect(this.usernameInput).toBeVisible({ timeout: 30000 });
        await expect(this.passwordInput).toBeVisible({ timeout: 30000 });
        await expect(this.registerLink).toBeVisible({ timeout: 30000 });
    }

    async enterUsername(username) {
        await this.usernameInput.fill(username);
    }

    async enterPassword(password) {
        await this.passwordInput.fill(password);
    }

    async clickLoginButton() {
        await this.loginButton.click();
    }

    async logout() {
        await this.logoutLink.click();
    }

    async clickForgotLoginLink() {
        await this.forgotLoginLink.click();
    }

    async clickRegisterLink() {
        await this.registerLink.click();
    }

    async login(username, password) {
        await this.enterUsername(username);
        await this.enterPassword(password);
        await this.clickLoginButton();
    }
}