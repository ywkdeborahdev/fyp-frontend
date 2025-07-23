/// <reference types="vite/client" />

export async function authentication(useremail, password) {
    const url = `${import.meta.env.VITE_API_URL}/login`;

    const response = await fetch(url, {
        method: 'POST',
        credentials: 'include', // Important: send cookies
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ useremail, password }),
    });
    return response

}
