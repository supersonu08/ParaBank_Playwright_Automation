import { expect } from '@playwright/test';

export class FindTransactionsPage {
    constructor(page) {
        this.page = page;

        this.accountId = page.getByRole('combobox');
        // The search textboxes have no accessible names; their positions follow the visible form order.
        this.transactionId = page.getByRole('textbox').nth(0);
        this.transactionDate = page.getByRole('textbox').nth(1);
        this.fromDate = page.getByRole('textbox').nth(2);
        this.toDate = page.getByRole('textbox').nth(3);
        this.amountInput = page.getByRole('textbox').nth(4);
        // Each search button has the same accessible name; position distinguishes the four search modes.
        this.findByIdButton = page.getByRole('button', { name: 'Find Transactions', exact: true }).nth(0);
        this.findByDateButton = page.getByRole('button', { name: 'Find Transactions', exact: true }).nth(1);
        this.findByDateRangeButton = page.getByRole('button', { name: 'Find Transactions', exact: true }).nth(2);
        this.findByAmountButton = page.getByRole('button', { name: 'Find Transactions', exact: true }).nth(3);
        this.transactionTable = page.getByRole('table');
        this.transactionRows = this.transactionTable.getByRole('row');
        // The search page renders no-results copy without a named status region.
        this.pageContent = page.locator('body');
    }

    async open() {
        await this.page.goto('https://parabank.parasoft.com/parabank/findtrans.htm');
        await expect(this.accountId).toBeVisible();
        await expect(this.accountId.getByRole('option')).not.toHaveCount(0);
        await expect(this.amountInput).toBeVisible();
    }

    async searchByAmount(amount) {
        await this.amountInput.fill(String(amount));
        await this.findByAmountButton.click();
    }

    async searchByTransactionId(id) {
        await this.transactionId.fill(String(id));
        await this.findByIdButton.click();
    }

    async searchByDate(date) {
        await this.transactionDate.fill(this.toParaBankDate(date));
        await this.findByDateButton.click();
    }

    async searchByDateRange(fromDate, toDate) {
        await this.fromDate.fill(this.toParaBankDate(fromDate));
        await this.toDate.fill(this.toParaBankDate(toDate));
        await this.findByDateRangeButton.click();
    }

    toParaBankDate(date) {
        const isoDate = /^\d{4}-\d{2}-\d{2}$/.test(date);
        return isoDate ? `${date.slice(5, 7)}-${date.slice(8, 10)}-${date.slice(0, 4)}` : date;
    }

    async getRows() {
        return this.transactionRows;
    }

    async getVisibleRowCount() {
        return await this.getRows().count();
    }
}
