/// <reference types="vite/client" />

export async function logout() {
    const url = `${import.meta.env.VITE_API_URL}/signout`;
    try {
        console.log('Logging out...');
        const response = await fetch(url, {
            method: 'POST',
            // credentials: 'include', // Important: send cookies
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
            // body: JSON.stringify({ username, password }),
        });
        return response
    } catch (error) {
        alert('An error occurred during sign-in.');
    }
}
