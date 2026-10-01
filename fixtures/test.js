import { test as base, expect } from '@playwright/test';
import { AccountOverviewPage } from '../Pages/AccountOverviewPage.js';
import { BillPayPage } from '../Pages/BillPayPage.js';
import { FindTransactionsPage } from '../Pages/FindTransactionsPage.js';
import { LoginPage } from '../Pages/LoginPage.js';
import { NewAccountPage } from '../Pages/NewAccountPage.js';
import { RegisterPage } from '../Pages/RegisterPage.js';
import { RequestLoanPage } from '../Pages/RequestLoanPage.js';
import { TransferFundsPage } from '../Pages/TransferFundsPage.js';
import { UpdateProfilePage } from '../Pages/UpdateProfilePage.js';
import { createUniqueUser } from '../utils/userFactory.js';

export const test = base.extend({
    pageObjects: async ({ page }, use) => {
        await use({
            accountOverview: new AccountOverviewPage(page),
            billPay: new BillPayPage(page),
            findTransactions: new FindTransactionsPage(page),
            login: new LoginPage(page),
            newAccount: new NewAccountPage(page),
            register: new RegisterPage(page),
            requestLoan: new RequestLoanPage(page),
            transferFunds: new TransferFundsPage(page),
            updateProfile: new UpdateProfilePage(page),
        });
    },

    userData: async ({}, use, testInfo) => {
        await use(createUniqueUser(testInfo));
    },

    registeredUser: async ({ pageObjects, userData }, use) => {
        await pageObjects.login.navigateToSite();
        await pageObjects.login.clickRegisterLink();
        await pageObjects.register.fillPersonalInfo(
            userData.firstName,
            userData.lastName,
            userData.address,
            userData.city,
        );
        await pageObjects.register.fillAddressInfo(
            userData.state,
            userData.zipCode,
            userData.phoneNumber,
            userData.ssn,
        );
        await pageObjects.register.fillCredentials(
            userData.username,
            userData.password,
            userData.password,
        );
        await pageObjects.register.clickRegisterButton();
        await expect(pageObjects.register.welcomeHeading).toBeVisible();

        await use(userData);
    },

    loggedInUser: async ({ pageObjects, registeredUser }, use) => {
        await pageObjects.login.logout();
        await pageObjects.login.login(registeredUser.username, registeredUser.password);
        await expect(pageObjects.accountOverview.heading).toBeVisible();

        await use(registeredUser);
    },
});

export { expect };