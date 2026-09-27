import { expect } from '@playwright/test';

export class UpdateProfilePage {
    constructor(page) {
        this.page = page;

        this.navLink = page.getByRole('link', { name: 'Update Contact Info', exact: true });
        this.firstName = page.getByRole('row', { name: 'First Name:' }).getByRole('textbox');
        this.lastName = page.getByRole('row', { name: 'Last Name:' }).getByRole('textbox');
        this.address = page.getByRole('row', { name: 'Address:' }).getByRole('textbox');
        this.city = page.getByRole('row', { name: 'City:' }).getByRole('textbox');
        this.state = page.getByRole('row', { name: 'State:' }).getByRole('textbox');
        this.zipCode = page.getByRole('row', { name: 'Zip Code:' }).getByRole('textbox');
        this.phoneNumber = page.getByRole('row', { name: 'Phone #:' }).getByRole('textbox');
        this.updateButton = page.getByRole('button', { name: 'Update Profile', exact: true });
        this.successMessage = page.getByRole('heading', { name: 'Profile Updated', exact: true });
        this.addressRequiredMessage = page.getByText('Address is required.', { exact: true });
    }

    async open() {
        await this.page.goto('https://parabank.parasoft.com/parabank/updateprofile.htm');
        await expect(this.firstName).toBeVisible();
    }

    async fillContactInfo({
        firstName,
        lastName,
        street,
        city,
        state,
        zipCode,
        phoneNumber
    }) {
        if (firstName !== undefined) await this.firstName.fill(firstName);
        if (lastName !== undefined) await this.lastName.fill(lastName);
        if (street !== undefined) await this.address.fill(street);
        if (city !== undefined) await this.city.fill(city);
        if (state !== undefined) await this.state.fill(state);
        if (zipCode !== undefined) await this.zipCode.fill(zipCode);
        if (phoneNumber !== undefined) await this.phoneNumber.fill(phoneNumber);
    }

    async submit() {
        await this.updateButton.click();
    }
}
