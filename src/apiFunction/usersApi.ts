/// <reference types="vite/client" />

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'An unknown error occurred' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    // For 204 No Content, there is no body to parse
    if (response.status === 204) {
        return null;
    }
    return response.json();
};


// READ: Fetch all users
export const getUsers = async () => {
    const response = await fetch(`${API_URL}/users`);
    return handleResponse(response);
};

// CREATE: Add a new user
export const createUser = async (userData: object) => {
    const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });
    return handleResponse(response);
};

// DELETE: Remove a user by ID
export const deleteUser = async (userId: number) => {
    const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
    });
    return handleResponse(response);
};

// UPDATE: Reset a user's password
export const resetUserPassword = async (userId: number, password: string) => {
    const response = await fetch(`${API_URL}/users/${userId}/password`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
    });
    return handleResponse(response);
};
