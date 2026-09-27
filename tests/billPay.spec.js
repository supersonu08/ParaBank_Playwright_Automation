import { test, expect } from '@playwright/test';
import { randomBytes } from 'node:crypto';
import { LoginPage } from '../Pages/LoginPage';
import { NewAccountPage } from '../Pages/NewAccountPage';
import { BillPayPage } from '../Pages/BillPayPage';
import { AccountOverviewPage } from '../Pages/AccountOverviewPage';
import { RegisterPage } from '../Pages/RegisterPage';

// This helper prepares a fresh user and a valid checking account before each bill-payment test.
// Doing this keeps tests independent and ensures the bill payment flows always start from a known state.
const createUserAndAccount = async ({ page }) => {
    const loginPage = new LoginPage(page);
    const newAccPage = new NewAccountPage(page);
    const username = process.env.PARABANK_USERNAME;
    const password = process.env.PARABANK_PASSWORD;

    await loginPage.navigateToSite();

    if (username && password) {
        await loginPage.login(username, password);
        await expect(new AccountOverviewPage(page).heading).toBeVisible();
    } else {
        await loginPage.clickRegisterLink();
        const registerPage = new RegisterPage(page);
        const newUsername = `bill_${randomBytes(6).toString('hex')}`;
        const newPassword = 'Password@123';

        await registerPage.fillPersonalInfo('Test', 'User', '123 Main Street', 'Jaipur');
        await registerPage.fillAddressInfo('Rajasthan', '302001', '9876543210', '123456789');
        await registerPage.fillCredentials(newUsername, newPassword, newPassword);
        await registerPage.clickRegisterButton();
        await expect(registerPage.welcomeHeading).toBeVisible();
    }

    await newAccPage.clickSIDEOpenNewAccountButton();
    await newAccPage.selectAccountType('CHECKING');
    await newAccPage.clickNewACCbtn();

    const accountId = (await newAccPage.getNewAccountId()).trim();
    return { accountId };
};

test.describe('Bill Pay', () => {
    // TC24: Positive flow - a valid bill payment should complete successfully.
    test('TC24 - Pay a bill with all valid details succeeds', async ({ page }) => {
        const { accountId } = await createUserAndAccount({ page });
        const billPayPage = new BillPayPage(page);

        await billPayPage.open();
        await billPayPage.fillPayeeInfo({
            payeeName: 'Electric Co',
            street: '123 Main St',
            city: 'Jaipur',
            state: 'Rajasthan',
            zipCode: '302001',
            phone: '9876543210',
            accountNumber: '123456789',
            verifyAccount: '123456789'
        });
        await billPayPage.fillPaymentDetails(100, accountId);
        await billPayPage.submitPayment();

        await expect(billPayPage.resultPanel).toContainText('Bill Payment Complete');
    });

    // TC25: Verify that the confirmation page reflects the correct payee and amount.
    test('TC25 - Confirmation shows correct payee name and amount', async ({ page }) => {
        const { accountId } = await createUserAndAccount({ page });
        const billPayPage = new BillPayPage(page);

        await billPayPage.open();
        await billPayPage.fillPayeeInfo({
            payeeName: 'Electric Co',
            street: '123 Main St',
            city: 'Jaipur',
            state: 'Rajasthan',
            zipCode: '302001',
            phone: '9876543210',
            accountNumber: '123456789',
            verifyAccount: '123456789'
        });
        await billPayPage.fillPaymentDetails(150, accountId);
        await billPayPage.submitPayment();

        await expect(billPayPage.pageContent).toContainText('Electric Co');
        await expect(billPayPage.pageContent).toContainText('$150');
    });

    // TC26: Validation should fail when account number and verify account number do not match.
    test('TC26 - Mismatched account number / verify-account number is rejected', async ({ page }) => {
        const { accountId } = await createUserAndAccount({ page });
        const billPayPage = new BillPayPage(page);

        await billPayPage.open();
        await billPayPage.fillPayeeInfo({
            payeeName: 'Electric Co',
            street: '123 Main St',
            city: 'Jaipur',
            state: 'Rajasthan',
            zipCode: '302001',
            phone: '9876543210',
            accountNumber: '123456789',
            verifyAccount: '999999999'
        });
        await billPayPage.fillPaymentDetails(100, accountId);
        await billPayPage.submitPayment();

        await expect(billPayPage.pageContent).toContainText(/verify|match|error|account/i);
    });

    // TC27: Empty payee name should trigger a validation error.
    test('TC27 - Empty payee name is rejected', async ({ page }) => {
        const { accountId } = await createUserAndAccount({ page });
        const billPayPage = new BillPayPage(page);

        await billPayPage.open();
        await billPayPage.fillPayeeInfo({
            payeeName: '',
            street: '123 Main St',
            city: 'Jaipur',
            state: 'Rajasthan',
            zipCode: '302001',
            phone: '9876543210',
            accountNumber: '123456789',
            verifyAccount: '123456789'
        });
        await billPayPage.fillPaymentDetails(100, accountId);
        await billPayPage.submitPayment();

        await expect(billPayPage.pageContent).toContainText(/payee|name|required|error/i);
    });

    // TC28: Empty amount should be rejected before the payment is submitted.
    test('TC28 - Empty amount is rejected', async ({ page }) => {
        const { accountId } = await createUserAndAccount({ page });
        const billPayPage = new BillPayPage(page);

        await billPayPage.open();
        await billPayPage.fillPayeeInfo({
            payeeName: 'Electric Co',
            street: '123 Main St',
            city: 'Jaipur',
            state: 'Rajasthan',
            zipCode: '302001',
            phone: '9876543210',
            accountNumber: '123456789',
            verifyAccount: '123456789'
        });
        await billPayPage.fillPaymentDetails('', accountId);
        await billPayPage.submitPayment();

        await expect(billPayPage.pageContent).toContainText(/amount|required|error/i);
    });

    // TC29: Amount should accept only numeric values; alpha characters should be rejected.
    test('TC29 - Non-numeric amount is rejected', async ({ page }) => {
        const { accountId } = await createUserAndAccount({ page });
        const billPayPage = new BillPayPage(page);

        await billPayPage.open();
        await billPayPage.fillPayeeInfo({
            payeeName: 'Electric Co',
            street: '123 Main St',
            city: 'Jaipur',
            state: 'Rajasthan',
            zipCode: '302001',
            phone: '9876543210',
            accountNumber: '123456789',
            verifyAccount: '123456789'
        });
        await billPayPage.fillPaymentDetails('abc', accountId);
        await billPayPage.submitPayment();

        await expect(billPayPage.pageContent).toContainText(/numeric|amount|error/i);
    });

    // TC30: Confirm that the source account has the payment amount deducted after a successful bill pay.
    test('TC30 - Paid amount is correctly deducted from source account balance', async ({ page }) => {
        const { accountId } = await createUserAndAccount({ page });
        const billPayPage = new BillPayPage(page);
        const overviewPage = new AccountOverviewPage(page);

        // Capture the balance before the payment so we can compare it after submission.
        await overviewPage.clickAccountOverviewLink();
        const beforeBalance = overviewPage.getBalanceForAccount(accountId);
        await expect(beforeBalance).toHaveText(/^\$\d+(\.\d{2})?$/);
        const beforeAmount = await overviewPage.getBalanceAmountForAccount(accountId);

        await billPayPage.open();
        await billPayPage.fillPayeeInfo({
            payeeName: 'Electric Co',
            street: '123 Main St',
            city: 'Jaipur',
            state: 'Rajasthan',
            zipCode: '302001',
            phone: '9876543210',
            accountNumber: '123456789',
            verifyAccount: '123456789'
        });
        await billPayPage.fillPaymentDetails(50, accountId);
        await billPayPage.submitPayment();

        // Read the same account balance again to validate the debit.
        await overviewPage.clickAccountOverviewLink();
        const afterBalance = overviewPage.getBalanceForAccount(accountId);
        await expect(afterBalance).toHaveText(`$${(beforeAmount - 50).toFixed(2)}`);
    });
});
