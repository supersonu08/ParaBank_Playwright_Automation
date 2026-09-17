import { test, expect } from '@playwright/test';
import { LoginPage } from '../Pages/LoginPage';
import { RegisterPage } from '../Pages/RegisterPage';
import { NewAccountPage } from '../Pages/NewAccountPage';

test.describe('ParaBank Registration', () => {

    let loginPage;
    let registerPage;
    let newAccPage;

    test.beforeEach(async ({ page }) => {

        loginPage = new LoginPage(page);
        registerPage = new RegisterPage(page);
        newAccPage = new NewAccountPage(page);

        await loginPage.navigateToSite();
        await loginPage.clickRegisterLink();
    });


    test('TC07 - Open new Account - Checking', async ({ page }) => {

        const username = `naveen_${Date.now()}`;

        await registerPage.fillPersonalInfo(
            'Naveen',
            'Pargi',
            '123 Main Street',
            'Jaipur'
        );

        await registerPage.fillAddressInfo(
            'Rajasthan',
            '302001',
            '9876543210',
            '123456789'
        );

        await registerPage.fillCredentials(
            username,
            'Password@123',
            'Password@123'
        );

        await registerPage.clickRegisterButton();
        await newAccPage.clickSIDEOpenNewAccountButton();

       
        await newAccPage.clickNewACCbtn();
       // await newAccPage.clickIDlink()

        await expect(newAccPage.successMessage).toContainText('Account Opened!');

    });

    test('TC08 - Open new Savings account and verify account details', async ({ page }) => {

     const username = `naveen_${Date.now()}`;

    await registerPage.fillPersonalInfo(
        'Naveen',
        'Pargi',
        '123 Main Street',
        'Jaipur'
    );

    await registerPage.fillAddressInfo(
        'Rajasthan',
        '302001',
        '9876543210',
        '123456789'
    );

    await registerPage.fillCredentials(
        username,
        'Password@123',
        'Password@123'
    );

    await registerPage.clickRegisterButton();
    

    await newAccPage.clickSIDEOpenNewAccountButton();
    await newAccPage.selectAccountType('SAVINGS');
    await newAccPage.clickNewACCbtn();

   // await expect(newAccPage.successMessage).toContainText('Account Opened!');

    // Capture the new account number so we can verify the details page
    // actually shows THIS account, not just any account.
    const newAccountId = (await newAccPage.getNewAccountId()).trim();
    expect(newAccountId).toMatch(/^\d+$/);

    await newAccPage.clickIDlink();
    await page.waitForURL(/activity\.htm/);

    await expect(newAccPage.accNumber).toHaveText(newAccountId);
    await expect(newAccPage.accType).toHaveText('SAVINGS');
    await expect(newAccPage.balance).toContainText('$');
});


});