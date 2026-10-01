export class FindTransactionsPage {
    constructor(page) {
        this.page = page;

        this.accountId = page.locator('#accountId');
        this.transactionId = page.locator('#transactionId');
        this.transactionDate = page.locator('#transactionDate');
        this.fromDate = page.locator('#fromDate');
        this.toDate = page.locator('#toDate');
        this.amountInput = page.locator('#amount');
        this.findByIdButton = page.locator('#findById');
        this.findByDateButton = page.locator('#findByDate');
        this.findByDateRangeButton = page.locator('#findByDateRange');
        this.findByAmountButton = page.locator('#findByAmount');
        this.transactionTable = page.locator('#transactionTable');
        this.transactionRows = this.transactionTable.getByRole('row');
        // The search page renders no-results copy without a named status region.
        this.pageContent = page.locator('body');
    }

    async open() {
        await this.page.goto('findtrans.htm');
        await this.accountId.waitFor({ state: 'visible' });
        await this.accountId.locator('option').first().waitFor({ state: 'attached' });
        await this.amountInput.waitFor({ state: 'visible' });
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
