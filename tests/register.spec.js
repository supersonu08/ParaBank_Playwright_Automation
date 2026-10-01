import { test, expect } from '@playwright/test';
import { randomBytes } from 'node:crypto';
import { LoginPage } from '../Pages/LoginPage';
import { RegisterPage } from '../Pages/RegisterPage';

// Registration tests all start from the same flow: load the app, open the register page, and fill user details.
test.describe('ParaBank Registration', () => {

    let loginPage;
    let registerPage;

    test.beforeEach(async ({ page }) => {
        // Each test gets a fresh browser state and a clean registration form.
        loginPage = new LoginPage(page);
        registerPage = new RegisterPage(page);

        await loginPage.navigateToSite();
        await loginPage.clickRegisterLink();
    });

    // TC01: A fully valid registration request should create a new customer account.
    test('TC01 - Register with valid details', async ({ page }) => {
        const username = `naveen_${randomBytes(6).toString('hex')}`;

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

        await expect(registerPage.welcomeHeading).toBeVisible();
    });

    // TC02: The first name is required; leaving it empty should show a field validation error.
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

        await expect(registerPage.firstNameRequiredMessage).toBeVisible();
    });

    // TC03: A missing last name should fail validation before account creation.
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

        await expect(registerPage.lastNameRequiredMessage).toBeVisible();
    });

    // TC04: Username is mandatory; a blank username should be rejected on submit.
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

        await expect(registerPage.usernameRequiredMessage).toBeVisible();
    });

    // TC05: Repeated password must match; a mismatch should trigger validation.
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

        await expect(registerPage.passwordMismatchMessage).toBeVisible();
    });

    // TC06: Username uniqueness is enforced; registering the same name twice should fail.
    test('TC06 - Register with a username that already exists', async ({ page }) => {
        const username = `naveen_${Date.now()}`;

        // First registration succeeds and consumes the username.
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
        await expect(registerPage.welcomeHeading).toBeVisible();

        // Second attempt uses the same username and should fail with a server-side validation error.
        await page.goto('register.htm');

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

        await expect(registerPage.usernameExistsMessage).toBeVisible();
    });

});