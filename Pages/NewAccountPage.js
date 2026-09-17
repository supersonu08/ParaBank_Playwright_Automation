export class NewAccountPage {

    constructor(page) {
        this.page = page;

        this.sideOpenNewAccountlink = page.locator('//*[@id="leftPanel"]/ul/li[1]/a');
        
        this.accountTypeDropdown = page.locator('#type');
        this.fromAccountDropdown = page.locator('#fromAccountId');

        this.buttonNewAcc = page.getByRole('button', { name: 'Open New Account' });
        this.newAccountIdLink = page.locator('//*[@id="newAccountId"]');
        this.successMessage = page.locator('//*[@id="openAccountResult"]/h1');

        this.accNumber =  page.locator('//*[@id="accountId"]');
        this.accType = page.locator('//*[@id="accountType"]');
        this.balance = page.locator('//*[@id="balance"]');
        this.gobtn = page.locator("input[value='Go']")
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
        return await this.newAccountIdLink.textContent();
    }

      
        
}
