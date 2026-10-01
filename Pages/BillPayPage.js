export class BillPayPage {
    constructor(page) {
        this.page = page;

        this.payeeName = page.getByRole('row', { name: 'Payee Name:' }).getByRole('textbox');
        this.payeeStreet = page.getByRole('row', { name: 'Address:' }).getByRole('textbox');
        this.payeeCity = page.getByRole('row', { name: 'City:' }).getByRole('textbox');
        this.payeeState = page.getByRole('row', { name: 'State:' }).getByRole('textbox');
        this.payeeZipCode = page.getByRole('row', { name: 'Zip Code:' }).getByRole('textbox');
        this.payeePhone = page.getByRole('row', { name: 'Phone #:' }).getByRole('textbox');
        this.payeeAccountNumber = page.getByRole('row', { name: /^Account #:/ }).getByRole('textbox');
        this.verifyAccountNumber = page.getByRole('row', { name: 'Verify Account #:' }).getByRole('textbox');
        this.amountInput = page.getByRole('row', { name: 'Amount:' }).getByRole('textbox');
        this.fromAccountId = page.getByRole('row', { name: 'From account #:' }).getByRole('combobox');
        this.sendPaymentButton = page.getByRole('button', { name: 'Send Payment', exact: true });
        this.resultPanel = page.getByRole('heading', { name: 'Bill Payment Complete', exact: true });
        // ParaBank has no named main/status region for its mixed validation copy.
        this.pageContent = page.locator('body');
    }

    async open() {
        await this.page.goto('billpay.htm');
        await this.payeeName.waitFor({ state: 'visible' });
        await this.fromAccountId.locator('option').first().waitFor({ state: 'attached' });
    }

    async fillPayeeInfo({
        payeeName,
        street,
        city,
        state,
        zipCode,
        phone,
        accountNumber,
        verifyAccount
    }) {
        if (payeeName !== undefined) await this.payeeName.fill(payeeName);
        if (street !== undefined) await this.payeeStreet.fill(street);
        if (city !== undefined) await this.payeeCity.fill(city);
        if (state !== undefined) await this.payeeState.fill(state);
        if (zipCode !== undefined) await this.payeeZipCode.fill(zipCode);
        if (phone !== undefined) await this.payeePhone.fill(phone);
        if (accountNumber !== undefined) await this.payeeAccountNumber.fill(accountNumber);
        if (verifyAccount !== undefined) await this.verifyAccountNumber.fill(verifyAccount);
    }

    async fillPaymentDetails(amount, fromAccountId) {
        if (amount !== undefined) await this.amountInput.fill(String(amount));
        if (fromAccountId !== undefined) await this.fromAccountId.selectOption(String(fromAccountId));
    }

    async submitPayment() {
        await this.sendPaymentButton.click();
    }

    async getResultText() {
        return (await this.resultPanel.textContent()).trim();
    }
}
