import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
    exp?: number; // expiration time in seconds since epoch
    // add other claims if needed
}

function isTokenValid(token: string): boolean {
    try {
        const decoded = jwtDecode<JwtPayload>(token);
        if (!decoded.exp) return false;

        const now = Date.now() / 1000; // current time in seconds
        return decoded.exp > now;
    } catch (error) {
        // Invalid token format
        return false;
    }
}
