export class LoginPage {

    constructor(page) {
        this.page = page;

        this.usernameInput = page.locator('#username');
        this.passwordInput = page.locator('#password');
        this.loginButton = page.locator('input[type="submit"]');
        this.forgotLoginLink = page.locator('a[href="/forgot-password"]');
        this.registerLink = page.locator('//*[@id="loginPanel"]/p[2]/a');
    }

    async navigateToSite() {
        await this.page.goto("https://parabank.parasoft.com/parabank/index.htm");
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