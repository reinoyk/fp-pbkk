const API_URL = 'http://localhost:8001';

export interface NovelData {
    title: string;
    author: string;
    rating: number;
    language: string;
    year_published: number;
}

export const novelService = {
    async getNovels(): Promise<any> {
        const res = await fetch(`${API_URL}/novels`);
        if (!res.ok) {
            throw new Error('Failed to fetch novels');
        }
        return res.json();
    },

    async createNovel(token: string | null, novelData: NovelData): Promise<void> {
        const headers: any = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_URL}/novels`, {
            method: 'POST',
            headers,
            body: JSON.stringify(novelData),
            credentials: 'include',
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to create novel');
        }
    },

    async updateNovel(token: string | null, id: number, novelData: NovelData): Promise<void> {
        const headers: any = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_URL}/novels/${id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(novelData),
            credentials: 'include',
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to update novel');
        }
    },

    async deleteNovel(token: string | null, id: number): Promise<void> {
        const headers: any = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_URL}/novels/${id}`, {
            method: 'DELETE',
            headers,
            credentials: 'include',
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to delete novel');
        }
    },

    async getProfile(token?: string): Promise<any> {
        const headers: any = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_URL}/profile`, {
            headers,
            credentials: 'include',
        });

        if (!res.ok) {
            throw new Error('Failed to fetch profile');
        }
        return res.json();
    },
};
