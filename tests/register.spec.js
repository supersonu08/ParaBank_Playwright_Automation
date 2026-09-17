import { test, expect } from '@playwright/test';
import { LoginPage } from '../Pages/LoginPage';
import { RegisterPage } from '../Pages/RegisterPage';


test.describe('ParaBank Registration', () => {

    let loginPage;
    let registerPage;

    test.beforeEach(async ({ page }) => {

        loginPage = new LoginPage(page);
        registerPage = new RegisterPage(page);

        await loginPage.navigateToSite();
        await loginPage.clickRegisterLink();
    });


    test('TC01 - Register with valid details', async ({ page }) => {

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

        await expect(page.locator('#rightPanel h1')).toContainText('Welcome');
    });


    test('TC02 - Register with empty first name', async ({ page }) => {

        const username = `naveen_${Date.now()}`;

        await registerPage.fillPersonalInfo(
            '',
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

        await expect(
            page.locator('#customer\\.firstName\\.errors')
        ).toBeVisible();
    });


    test('TC03 - Register with empty last name', async ({ page }) => {

        const username = `naveen_${Date.now()}`;

        await registerPage.fillPersonalInfo(
            'Naveen',
            '',
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

        await expect(
            page.locator('#customer\\.lastName\\.errors')
        ).toBeVisible();
    });


    test('TC04 - Register with empty username', async ({ page }) => {

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
            '',
            'Password@123',
            'Password@123'
        );

        await registerPage.clickRegisterButton();

        await expect(
            page.locator('#customer\\.username\\.errors')
        ).toBeVisible();
    });


    test('TC05 - Register with mismatched passwords', async ({ page }) => {

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
            'Password@456'
        );

        await registerPage.clickRegisterButton();

        await expect(
            page.locator('#repeatedPassword\\.errors')
        ).toBeVisible();
    });

    test('TC06 - Register with a username that already exists', async ({ page }) => {

        const username = `naveen_${Date.now()}`;

        // First registration - succeeds and consumes the username
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
        await expect(page.locator('#rightPanel h1')).toContainText('Welcome');

        // Second registration with the same username should fail on server-side validation
        await page.goto('https://parabank.parasoft.com/parabank/register.htm');

        await registerPage.fillPersonalInfo(
            'Naveen',
            'Pargi',
            '123 Main Street',
            'Jaipur'
        );

        await registerPage.fillAddressInfo(
            'Rajasthan',
            '302001',
            '9876543211',
            '987654321'
        );

        await registerPage.fillCredentials(
            username,
            'Password@123',
            'Password@123'
        );

        await registerPage.clickRegisterButton();

        await expect(
            page.locator('#customer\\.username\\.errors')
        ).toBeVisible();

        await expect(
            page.locator('#customer\\.username\\.errors')
        ).toContainText('already exists');
    });

});