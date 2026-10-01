export class RequestLoanPage {
    constructor(page) {
        this.page = page;

        this.navLink = page.getByRole('link', { name: 'Request Loan', exact: true });
        this.amountInput = page.locator('#amount');
        this.downPaymentInput = page.locator('#downPayment');
        this.fromAccountId = page.locator('#fromAccountId');
        this.applyButton = page.getByRole('button', { name: 'Apply Now', exact: true });
        this.resultHeading = page.getByRole('heading', { name: 'Loan Request Processed', exact: true });
        this.approvedStatus = page.getByRole('row', { name: 'Status: Approved', exact: true });
        this.deniedStatus = page.getByRole('row', { name: 'Status: Denied', exact: true });
        // Client-side validation is rendered without a named status region on this page.
        this.pageContent = page.locator('body');
    }

    async open() {
        await this.page.goto('requestloan.htm');
        await this.amountInput.waitFor({ state: 'visible' });
        await this.fromAccountId.locator('option').first().waitFor({ state: 'attached' });
    }

    async applyForLoan(amount, downPayment, fromAccountId) {
        await this.amountInput.fill(String(amount));
        await this.downPaymentInput.fill(String(downPayment));
        if (fromAccountId) await this.fromAccountId.selectOption(String(fromAccountId));
        await this.applyButton.click();
    }

    async getResultText() {
        return (await this.resultHeading.textContent())?.trim() ?? '';
    }
}
