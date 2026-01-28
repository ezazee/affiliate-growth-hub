import { validateEmail, validatePhone, validatePassword } from './validation';

describe('Validation Utils', () => {
    describe('validateEmail', () => {
        it('should return valid for allowed providers', () => {
            expect(validateEmail('test@gmail.com').isValid).toBe(true);
            expect(validateEmail('user@yahoo.com').isValid).toBe(true);
            expect(validateEmail('admin@plasa.com').isValid).toBe(true);
        });

        it('should return invalid for blocked domains', () => {
            const result = validateEmail('spammer@yopmail.com');
            expect(result.isValid).toBe(false);
            expect(result.message).toContain('Domain email tidak diizinkan');
        });

        it('should return invalid for unknown/untrusted providers', () => {
            const result = validateEmail('user@unknown-provider.xyz');
            expect(result.isValid).toBe(false);
            expect(result.message).toContain('Hanya email dari provider terpercaya');
        });

        it('should return invalid for malformed email', () => {
            expect(validateEmail('invalid-email').isValid).toBe(false);
            expect(validateEmail('user@').isValid).toBe(false);
            expect(validateEmail('@domain.com').isValid).toBe(false);
        });
    });

    describe('validatePhone', () => {
        it('should format numbers starting with 0 correctly', () => {
            const result = validatePhone('08123456789');
            expect(result.isValid).toBe(true);
            expect(result.formatted).toBe('628123456789');
        });

        it('should keep numbers starting with 62 as is', () => {
            const result = validatePhone('628123456789');
            expect(result.isValid).toBe(true);
            expect(result.formatted).toBe('628123456789');
        });

        it('should format numbers without prefix correctly', () => {
            const result = validatePhone('8123456789');
            expect(result.isValid).toBe(true);
            expect(result.formatted).toBe('628123456789');
        });

        it('should reject numbers too short', () => {
            const result = validatePhone('08123');
            expect(result.isValid).toBe(false);
            expect(result.message).toContain('9-13 digit');
        });

        it('should reject numbers too long', () => {
            const result = validatePhone('08123456789012345');
            expect(result.isValid).toBe(false);
            expect(result.message).toContain('9-13 digit');
        });

        it('should handle non-numeric characters by stripping them', () => {
            const result = validatePhone('0812-3456-789');
            expect(result.isValid).toBe(true);
            expect(result.formatted).toBe('628123456789');
        });
    });

    describe('validatePassword', () => {
        it('should return valid for strong password', () => {
            expect(validatePassword('Password123').isValid).toBe(true);
        });

        it('should reject short passwords', () => {
            expect(validatePassword('123').isValid).toBe(false);
        });

        it('should reject password without letters', () => {
            expect(validatePassword('123456').isValid).toBe(false);
        });

        it('should reject password without numbers', () => {
            expect(validatePassword('password').isValid).toBe(false);
        });
    });
});
