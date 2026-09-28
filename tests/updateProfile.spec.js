import { test, expect } from '@playwright/test';
import { randomBytes } from 'node:crypto';
import { LoginPage } from '../Pages/LoginPage';
import { RegisterPage } from '../Pages/RegisterPage';
import { UpdateProfilePage } from '../Pages/UpdateProfilePage';

const createUser = async ({ page }) => {
    const loginPage = new LoginPage(page);
    const username = process.env.PARABANK_USERNAME;
    const password = process.env.PARABANK_PASSWORD;

    await loginPage.navigateToSite();

    if (username && password) {
        await loginPage.login(username, password);
        await page.waitForURL(/overview\.htm/);
        return { username };
    }

    await loginPage.clickRegisterLink();
    const registerPage = new RegisterPage(page);
    const newUsername = `profile_${randomBytes(6).toString('hex')}`;
    const newPassword = 'Password@123';

    await registerPage.fillPersonalInfo('Test', 'User', '123 Main Street', 'Jaipur');
    await registerPage.fillAddressInfo('Rajasthan', '302001', '9876543210', '123456789');
    await registerPage.fillCredentials(newUsername, newPassword, newPassword);
    await registerPage.clickRegisterButton();
    await expect(registerPage.welcomeHeading).toBeVisible();

    return { username: newUsername };
};

test.describe('Update Profile', () => {
    // TC36: Updating all editable fields with valid values should persist successfully.
    test('TC36 - Update all editable fields with valid data succeeds', async ({ page }) => {
        await createUser({ page });
        const profilePage = new UpdateProfilePage(page);

        await profilePage.open();
        await profilePage.fillContactInfo({
            firstName: 'Updated',
            lastName: 'User',
            street: '456 New Street',
            city: 'Delhi',
            state: 'Delhi',
            zipCode: '110001',
            phoneNumber: '9999999999'
        });
        await profilePage.submit();

        await expect(profilePage.successMessage).toBeVisible();
    });

    // TC37: Clearing a required field like street should be rejected with validation feedback.
    test('TC37 - Clearing a required field (e.g. street) is rejected', async ({ page }) => {
        await createUser({ page });
        const profilePage = new UpdateProfilePage(page);

        await profilePage.open();
        await profilePage.fillContactInfo({
            firstName: 'Updated',
            lastName: 'User',
            street: '',
            city: 'Delhi',
            state: 'Delhi',
            zipCode: '110001',
            phoneNumber: '9999999999'
        });
        await profilePage.submit();

        await expect(profilePage.addressRequiredMessage).toBeVisible();
    });

    // TC38: Changes should remain saved even after leaving and revisiting the profile page.
    test('TC38 - Updated info persists after navigating away and back', async ({ page }) => {
        await createUser({ page });
        const profilePage = new UpdateProfilePage(page);

        await profilePage.open();
        await profilePage.fillContactInfo({
            firstName: 'Persist',
            lastName: 'User',
            street: '999 Persist Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            phoneNumber: '8888888888'
        });
        await profilePage.submit();

        await profilePage.open();
        await expect(profilePage.firstName).toHaveValue('Persist');
        await expect(profilePage.address).toHaveValue('999 Persist Street');
    });
});
