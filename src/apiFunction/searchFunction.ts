export async function fetchMessagesByServer(serverID) {
    const url = `${import.meta.env.VITE_API_URL}/getMessagesByServer/${serverID}`;
    // console.log('Fetching messages from URL:', url);
    const response = await fetch(url, {
        method: 'GET',
        credentials: 'include', // Important: send cookies
        headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Messages:', data);
    return data;
}
