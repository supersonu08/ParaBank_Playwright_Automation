import { expect } from '@playwright/test';

export class NewAccountPage {

    constructor(page) {
        this.page = page;

        this.sideOpenNewAccountlink = page.locator('a[href="openaccount.htm"]');
        this.accountTypeDropdown = page.locator('select').nth(0);
        this.fromAccountDropdown = page.locator('select').nth(1);
        this.buttonNewAcc = page.locator('input[value="Open New Account"]');
        this.newAccountIdLink = page.locator('a').filter({ hasText: /^\d+$/ }).first();
        this.successMessage = page.locator('h1:has-text("Account Opened!")');
        this.accountDetailsHeading = page.locator('h1:has-text("Account Details")');
        this.accNumber = page.locator('tr:has-text("Account Number:") td');
        this.accType = page.locator('tr:has-text("Account Type:") td');
        this.balance = page.locator('tr:has-text("Balance:") td');
        this.gobtn = page.locator('input[value="Go"]');
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
        await expect(this.fromAccountDropdown).toBeVisible({ timeout: 30000 });
        await expect.poll(async () => await this.fromAccountDropdown.locator('option').count(), {
            timeout: 30000
        }).toBeGreaterThan(0);
    }

    async clickNewACCbtn() {
        await this.buttonNewAcc.click();
        await expect(this.successMessage).toBeVisible({ timeout: 30000 });
        await expect(this.newAccountIdLink).toHaveText(/^\d+$/, { timeout: 30000 });
    }

    

    async clickIDlink() {
        await this.newAccountIdLink.click();
    }

    async getNewAccountId() {
        return (await this.newAccountIdLink.textContent())?.trim() ?? '';
    }
}
