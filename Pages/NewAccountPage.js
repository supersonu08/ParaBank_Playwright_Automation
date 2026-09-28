import { expect } from '@playwright/test';

export class NewAccountPage {

    constructor(page) {
        this.page = page;

        this.sideOpenNewAccountlink = page.getByRole('link', { name: 'Open New Account', exact: true });
        // The live form exposes both selects as unnamed comboboxes, so position distinguishes their purpose.
        this.accountTypeDropdown = page.getByRole('combobox').nth(0);
        this.fromAccountDropdown = page.getByRole('combobox').nth(1);
        this.buttonNewAcc = page.getByRole('button', { name: 'Open New Account', exact: true });
        this.newAccountIdLink = page.getByRole('link', { name: /^\d+$/, exact: true });
        this.successMessage = page.getByRole('heading', { name: 'Account Opened!', exact: true });
        this.accountDetailsHeading = page.getByRole('heading', { name: 'Account Details', exact: true });
        this.accNumber = page.getByRole('row', { name: /^Account Number:/ }).getByRole('cell', { name: /^\d+$/ });
        this.accType = page.getByRole('row', { name: /^Account Type:/ }).getByRole('cell', { name: /^(CHECKING|SAVINGS)$/ });
        this.balance = page.getByRole('row', { name: /^Balance:/ }).getByRole('cell', { name: /^\$\d+(\.\d{2})?$/ });
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
        await expect(this.fromAccountDropdown).toBeVisible({ timeout: 30000 });
        await expect(this.fromAccountDropdown.locator('option').filter({ hasText: /^\d+$/ })).not.toHaveCount(0, { timeout: 30000 });
    }

    async clickNewACCbtn() {
        await this.buttonNewAcc.click();
        await expect(this.successMessage).toBeVisible();
        await expect(this.newAccountIdLink).toHaveText(/^\d+$/);
    }

    

    async clickIDlink() {
        await this.newAccountIdLink.click();
    }

    async getNewAccountId() {
        return (await this.newAccountIdLink.textContent())?.trim() ?? '';
    }
}
