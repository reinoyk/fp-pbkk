import { Novel } from '@/types';

const API_URL = 'http://localhost:8001';

export const bookmarkService = {
    async getBookmarks(token: string): Promise<Novel[]> {
        const res = await fetch(`${API_URL}/bookmarks`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            throw new Error('Failed to fetch bookmarks');
        }

        const data = await res.json();
        return data.novels || [];
    },

    async addBookmark(token: string, novelId: number): Promise<void> {
        const res = await fetch(`${API_URL}/bookmarks/${novelId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            throw new Error('Failed to add bookmark');
        }
    },

    async removeBookmark(token: string, novelId: number): Promise<void> {
        const res = await fetch(`${API_URL}/bookmarks/${novelId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            throw new Error('Failed to remove bookmark');
        }
    },
};
