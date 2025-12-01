const API_URL = 'http://localhost:8001';

export const reviewService = {
    async createReview(token: string | null, novelId: number, rating: number, comment: string): Promise<void> {
        const headers: any = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_URL}/novels/${novelId}/reviews`, {
            method: 'POST',
            headers,
            credentials: 'include',
            body: JSON.stringify({
                rating: rating,
                comment: comment,
            }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to submit review');
        }
    },

    async updateReview(token: string | null, novelId: number, rating: number, comment: string): Promise<void> {
        const headers: any = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_URL}/novels/${novelId}/reviews`, {
            method: 'PUT',
            headers,
            credentials: 'include',
            body: JSON.stringify({
                rating: rating,
                comment: comment,
            }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to update review');
        }
    },

    async getReviews(novelId: number): Promise<any[]> {
        const res = await fetch(`${API_URL}/novels/${novelId}/reviews`);

        if (!res.ok) {
            throw new Error('Failed to fetch reviews');
        }

        const data = await res.json();
        return data.reviews || [];
    },

    async getUserReview(token: string | null, novelId: number): Promise<any | null> {
        try {
            const headers: any = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(`${API_URL}/novels/${novelId}/reviews/user`, {
                headers,
                credentials: 'include',
            });

            if (res.status === 404) {
                return null;
            }

            if (!res.ok) {
                throw new Error('Failed to fetch user review');
            }

            const data = await res.json();
            return data.review;
        } catch (error) {
            return null;
        }
    },
};
