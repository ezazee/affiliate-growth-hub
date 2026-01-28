
export function getAuthHeaders(): HeadersInit {
    if (typeof window === 'undefined') {
        return {
            'Content-Type': 'application/json',
        };
    }

    const stored = localStorage.getItem('affiliate_user_session');
    if (!stored) {
        return {
            'Content-Type': 'application/json',
        };
    }

    try {
        // The backend expects the token to be a Base64 encoded JSON string of the session data
        // match: sessionData = JSON.parse(Buffer.from(token, 'base64').toString());
        const token = btoa(stored);

        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
    } catch (e) {
        console.error('Error creating auth headers:', e);
        return {
            'Content-Type': 'application/json',
        };
    }
}
