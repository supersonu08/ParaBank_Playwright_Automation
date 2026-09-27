export class AccountOverviewPage {

    constructor(page) {
        this.page = page;

        this.accountOverviewLink = page.getByRole('link', { name: 'Accounts Overview', exact: true });
        this.heading = page.getByRole('heading', { name: 'Accounts Overview', exact: true });
        this.welcomeHeading = page.getByRole('heading', { name: /^Welcome/ });
    }

    async clickAccountOverviewLink() {
        await this.accountOverviewLink.click();
    }

    getRowForAccount(accountId) {
        return this.page.getByRole('row', { name: new RegExp(`^${accountId}\\s`) });
    }

    getBalanceForAccount(accountId) {
        const row = this.getRowForAccount(accountId);
        // Balance and available amount can have identical names, so use their table-column order.
        return row.getByRole('cell').nth(1);
    }

    async getBalanceAmountForAccount(accountId) {
        const balanceText = await this.getBalanceForAccount(accountId).textContent();
        return Number(balanceText.replace(/[^0-9.-]/g, ''));
    }
}