import { expect } from '@playwright/test';

export class TransferFundsPage {
    constructor(page) {
        this.page = page;

        this.amountInput = page.getByRole('textbox');
        // The live form exposes both account selects as unnamed comboboxes.
        this.fromAccountId = page.getByRole('combobox').nth(0);
        this.toAccountId = page.getByRole('combobox').nth(1);
        this.transferButton = page.getByRole('button', { name: 'Transfer', exact: true });
        this.resultPanel = page.getByRole('heading', { name: 'Transfer Complete!', exact: true });
        this.transferSummary = page.getByText('has been transferred from account');
        this.zeroAmountErrorHeading = page.getByRole('heading', { name: /invalid|error/i });
        this.negativeAmountErrorHeading = page.getByRole('heading', { name: /negative|invalid|error/i });
        this.nonNumericAmountErrorHeading = page.getByRole('heading', { name: /invalid|numeric|amount|error/i });
    }

    async open() {
        await this.page.goto('https://parabank.parasoft.com/parabank/transfer.htm');
        await expect(this.amountInput).toBeVisible();
        await expect(this.fromAccountId.getByRole('option')).not.toHaveCount(0);
        await expect(this.toAccountId.getByRole('option')).not.toHaveCount(0);
    }

    async transfer(amount, fromAccountId, toAccountId) {
        await this.amountInput.fill(String(amount));
        await this.fromAccountId.selectOption(String(fromAccountId));
        await this.toAccountId.selectOption(String(toAccountId));
        await this.transferButton.click();
    }

}
