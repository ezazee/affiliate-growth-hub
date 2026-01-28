export const VALID_EMAIL_PROVIDERS = [
    'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
    'icloud.com', 'ymail.com', 'rocketmail.com',
    // Indonesia-specific providers
    'plasa.com', 'telkom.net', 'indo.net.id', 'cbn.net.id',
    'rad.net.id', 'centrin.net.id', 'klikbca.com', 'bni.co.id',
    'mandiri.co.id', 'bri.co.id'
];

export const BLOCKED_DOMAINS = [
    'example.com', 'test.com', 'demo.com', 'fake.com',
    'temp.com', 'throwaway.email', '10minutemail.com',
    'guerrillamail.com', 'mailinator.com', 'yopmail.com'
];

export function validateEmail(email: string): { isValid: boolean; message?: string } {
    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { isValid: false, message: 'Format email tidak valid' };
    }

    const domain = email.toLowerCase().split('@')[1];

    // Check for blocked domains
    if (BLOCKED_DOMAINS.some(blocked => domain.includes(blocked))) {
        return { isValid: false, message: 'Domain email tidak diizinkan. Gunakan email pribadi yang valid.' };
    }

    // Check for valid providers
    const isValidProvider = VALID_EMAIL_PROVIDERS.some(provider => domain === provider);

    if (!isValidProvider) {
        return {
            isValid: false,
            message: 'Hanya email dari provider terpercaya yang diizinkan (Gmail, Yahoo, Outlook, dll)'
        };
    }

    return { isValid: true };
}

export function validatePhone(phone: string): { isValid: boolean; message?: string; formatted?: string } {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');

    // Check if empty
    if (!cleanPhone) {
        return { isValid: false, message: 'Nomor telepon wajib diisi' };
    }

    // Check minimum length (Indonesia phone numbers: 9-13 digits after 62)
    if (cleanPhone.length < 9 || cleanPhone.length > 13) {
        return { isValid: false, message: 'Nomor telepon harus 9-13 digits' };
    }

    // Format with 62 prefix
    let formattedPhone = cleanPhone;
    if (!cleanPhone.startsWith('62')) {
        if (cleanPhone.startsWith('0')) {
            formattedPhone = '62' + cleanPhone.substring(1);
        } else {
            formattedPhone = '62' + cleanPhone;
        }
    }

    return { isValid: true, formatted: formattedPhone };
}

export function validatePassword(password: string): { isValid: boolean; message?: string } {
    if (!password) {
        return { isValid: false, message: 'Kata sandi wajib diisi' };
    }

    if (password.length < 6) {
        return { isValid: false, message: 'Kata sandi minimal 6 karakter' };
    }

    // Check for at least one letter
    const hasLetter = /[a-zA-Z]/.test(password);
    // Check for at least one number
    const hasNumber = /\d/.test(password);

    if (!hasLetter) {
        return { isValid: false, message: 'Kata sandi harus mengandung minimal 1 huruf' };
    }

    if (!hasNumber) {
        return { isValid: false, message: 'Kata sandi harus mengandung minimal 1 angka' };
    }

    return { isValid: true };
}
