export class NewAccountPage {

    constructor(page) {
        this.page = page;

        this.sideOpenNewAccountlink = page.getByRole('link', { name: 'Open New Account', exact: true });
        this.accountTypeDropdown = page.locator('#type');
        this.fromAccountDropdown = page.locator('#fromAccountId');
        this.buttonNewAcc = page.getByRole('button', { name: 'Open New Account', exact: true });
        this.newAccountIdLink = page.locator('#newAccountId');
        this.successMessage = page.getByRole('heading', { name: 'Account Opened!', exact: true });
        this.accountDetailsHeading = page.getByRole('heading', { name: 'Account Details', exact: true });
        this.accNumber = page.locator('#accountId');
        this.accType = page.locator('#accountType');
        this.balance = page.locator('#balance');
        this.gobtn = page.getByRole('button', { name: 'Go', exact: true });
    }

    async selectAccountType(type) {
        // type: 'CHECKING' or 'SAVINGS'
        await this.accountTypeDropdown.selectOption({ label: type });
    }

    async selectFromAccount(accountId) {
        await this.fromAccountDropdown.selectOption(accountId);
    }

    async clickSIDEOpenNewAccountButton() {
        await this.sideOpenNewAccountlink.click();
        await this.fromAccountDropdown.waitFor({ state: 'visible' });
        await this.fromAccountDropdown.locator('option').first().waitFor({ state: 'attached' });
    }

    async clickNewACCbtn() {
        await this.buttonNewAcc.click();
        await this.successMessage.waitFor({ state: 'visible' });
        await this.newAccountIdLink.waitFor({ state: 'visible' });
    }

    async clickIDlink() {
        await this.newAccountIdLink.click();
    }

    async getNewAccountId() {
        return (await this.newAccountIdLink.textContent())?.trim() ?? '';
    }
}
