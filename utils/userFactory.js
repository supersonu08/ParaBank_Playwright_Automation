import { randomBytes } from 'node:crypto';

const numericValue = (length) => {
    const value = randomBytes(8).readBigUInt64BE() % (10n ** BigInt(length));
    return value.toString().padStart(length, '0');
};

export const createUniqueUser = (testInfo) => {
    const suffix = randomBytes(4).toString('hex');
    const timestamp = Date.now();

    return {
        firstName: `QA${testInfo.workerIndex}`,
        lastName: `Tester${suffix.slice(0, 4)}`,
        address: `${numericValue(3)} Test Way`,
        city: 'Testville',
        state: 'CA',
        zipCode: numericValue(5),
        phoneNumber: `9${numericValue(9)}`,
        ssn: numericValue(9),
        username: `qa_${testInfo.workerIndex}_${timestamp}_${suffix}`,
        password: 'Password@123',
    };
};