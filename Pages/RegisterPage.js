export class RegisterPage {

    constructor(page) {
        this.page = page;

        this.firstName = page.locator("#customer\\.firstName");
        this.lastName = page.locator("#customer\\.lastName");
        this.address = page.locator("#customer\\.address\\.street");
        this.city = page.locator("#customer\\.address\\.city");
        this.state = page.locator("#customer\\.address\\.state");
        this.zipCode = page.locator("#customer\\.address\\.zipCode");
        this.phoneNumber = page.locator("#customer\\.phoneNumber");
        this.ssn = page.locator("#customer\\.ssn");
        this.username = page.locator("#customer\\.username");
        this.password = page.locator("#customer\\.password");
        this.confirmPassword = page.locator("#repeatedPassword");
        this.registerButton = page.locator("input[value='Register']");
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