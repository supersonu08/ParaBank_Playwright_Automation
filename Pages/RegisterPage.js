export class RegisterPage {

    constructor(page) {
        this.page = page;

        this.firstName = page.getByRole('row', { name: 'First Name:', exact: true }).getByRole('textbox');
        this.lastName = page.getByRole('row', { name: 'Last Name:', exact: true }).getByRole('textbox');
        this.address = page.getByRole('row', { name: 'Address:', exact: true }).getByRole('textbox');
        this.city = page.getByRole('row', { name: 'City:', exact: true }).getByRole('textbox');
        this.state = page.getByRole('row', { name: 'State:', exact: true }).getByRole('textbox');
        this.zipCode = page.getByRole('row', { name: 'Zip Code:', exact: true }).getByRole('textbox');
        this.phoneNumber = page.getByRole('row', { name: 'Phone #:', exact: true }).getByRole('textbox');
        this.ssn = page.getByRole('row', { name: 'SSN:', exact: true }).getByRole('textbox');
        this.username = page.getByRole('row', { name: 'Username:', exact: true }).getByRole('textbox');
        this.password = page.getByRole('row', { name: 'Password:', exact: true }).getByRole('textbox');
        this.confirmPassword = page.getByRole('row', { name: 'Confirm:', exact: true }).getByRole('textbox');
        this.registerButton = page.getByRole('button', { name: 'Register', exact: true });
        this.welcomeHeading = page.getByRole('heading', { name: /^Welcome/ });
        this.firstNameRequiredMessage = page.getByText('First name is required.', { exact: true });
        this.lastNameRequiredMessage = page.getByText('Last name is required.', { exact: true });
        this.usernameRequiredMessage = page.getByText('Username is required.', { exact: true });
        this.passwordMismatchMessage = page.getByText('Passwords did not match.', { exact: true });
        this.usernameExistsMessage = page.getByText('This username already exists.', { exact: true });
    }

    async fillPersonalInfo(firstName, lastName, address, city) {
        await this.firstName.fill(firstName);
        await this.lastName.fill(lastName);
        await this.address.fill(address);
        await this.city.fill(city);
    }

    async fillAddressInfo(state, zipCode, phone, ssn) {
        await this.state.fill(state);
        await this.zipCode.fill(zipCode);
        await this.phoneNumber.fill(phone);
        await this.ssn.fill(ssn);
    }

    async fillCredentials(username, password, confirmPassword) {
        await this.username.fill(username);
        await this.password.fill(password);
        await this.confirmPassword.fill(confirmPassword);
    }

    async clickRegisterButton() {
        await this.registerButton.click();
    }
}