import { Novel } from '@/types';

const API_URL = 'http://localhost:8001';

export const bookmarkService = {
    async getBookmarks(token: string | null): Promise<Novel[]> {
        const headers: any = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_URL}/bookmarks`, {
            headers,
            credentials: 'include', // Important for sending cookies
        });

        if (!res.ok) {
            throw new Error('Failed to fetch bookmarks');
        }

        const data = await res.json();
        // Backend returns { "bookmarked_novels": [...] }
        return data.bookmarked_novels || [];
    },

    async addBookmark(token: string | null, novelId: number): Promise<void> {
        const headers: any = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_URL}/bookmarks/${novelId}`, {
            method: 'POST',
            headers,
            credentials: 'include',
        });

        if (!res.ok) {
            throw new Error('Failed to add bookmark');
        }
    },

    async removeBookmark(token: string | null, novelId: number): Promise<void> {
        const headers: any = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_URL}/bookmarks/${novelId}`, {
            method: 'DELETE',
            headers,
            credentials: 'include',
        });

        if (!res.ok) {
            throw new Error('Failed to remove bookmark');
        }
    },
};
