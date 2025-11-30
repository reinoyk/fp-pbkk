const API_URL = 'http://localhost:8001';

export const reviewService = {
    async createReview(token: string, novelId: number, rating: number, comment: string): Promise<void> {
        const res = await fetch(`${API_URL}/novels/${novelId}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
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

    async getReviews(novelId: number): Promise<any[]> {
        const res = await fetch(`${API_URL}/novels/${novelId}/reviews`);

        if (!res.ok) {
            throw new Error('Failed to fetch reviews');
        }

        const data = await res.json();
        return data.reviews || [];
    },
};
