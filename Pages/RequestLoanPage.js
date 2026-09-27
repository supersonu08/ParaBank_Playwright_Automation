export class RequestLoanPage {
    constructor(page) {
        this.page = page;

        this.navLink = page.locator('a[href="requestloan.htm"]');
        this.amountInput = page.locator('#amount');
        this.downPaymentInput = page.locator('#downPayment');
        this.fromAccountId = page.locator('#fromAccountId');
        this.applyButton = page.locator('input[value="Apply Now"]');
        this.resultHeading = page.getByRole('heading', { name: 'Loan Request Processed', exact: true });
        this.approvedStatus = page.getByRole('row', { name: 'Status: Approved', exact: true });
        this.deniedStatus = page.getByRole('row', { name: 'Status: Denied', exact: true });
        // Client-side validation is rendered without a named status region on this page.
        this.pageContent = page.locator('body');
    }

    async open() {
        await this.page.goto('https://parabank.parasoft.com/parabank/requestloan.htm');
        await this.page.waitForURL(/requestloan\.htm/);
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
        return (await this.resultText.textContent()).trim();
    }
}
