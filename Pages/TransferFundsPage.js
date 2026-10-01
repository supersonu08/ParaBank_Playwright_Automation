export class TransferFundsPage {
    constructor(page) {
        this.page = page;

        this.amountInput = page.locator('#amount');
        this.fromAccountId = page.locator('#fromAccountId');
        this.toAccountId = page.locator('#toAccountId');
        this.transferButton = page.getByRole('button', { name: 'Transfer', exact: true });
        this.resultPanel = page.getByRole('heading', { name: 'Transfer Complete!', exact: true });
        this.transferSummary = page.getByText('has been transferred from account');
        this.zeroAmountErrorHeading = page.getByRole('heading', { name: /invalid|error/i });
        this.negativeAmountErrorHeading = page.getByRole('heading', { name: /negative|invalid|error/i });
        this.nonNumericAmountErrorHeading = page.getByRole('heading', { name: /invalid|numeric|amount|error/i });
    }

    async open() {
        await this.page.goto('transfer.htm');
        await this.amountInput.waitFor({ state: 'visible' });
        await this.fromAccountId.locator('option').first().waitFor({ state: 'attached' });
        await this.toAccountId.locator('option').first().waitFor({ state: 'attached' });
    }

    async transfer(amount, fromAccountId, toAccountId) {
        await this.amountInput.fill(String(amount));
        await this.fromAccountId.selectOption(String(fromAccountId));
        await this.toAccountId.selectOption(String(toAccountId));
        await this.transferButton.click();
    }

}
