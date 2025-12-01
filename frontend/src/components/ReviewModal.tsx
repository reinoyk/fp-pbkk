import React, { useState } from 'react';
import { Star, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { reviewService } from '@/services/reviewService';
import { useAuth } from '@/context/AuthContext';
import { Novel } from '@/types';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    novel: Novel;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, novel }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const { user, token } = useAuth();

    // Check for existing review when modal opens
    React.useEffect(() => {
        if (isOpen && user && novel.id) {
            const checkExistingReview = async () => {
                try {
                    const existingReview = await reviewService.getUserReview(token, novel.id);
                    if (existingReview) {
                        setRating(existingReview.rating);
                        setComment(existingReview.comment);
                        setIsEditing(true);
                    } else {
                        setRating(0);
                        setComment('');
                        setIsEditing(false);
                    }
                } catch (err) {
                    console.error("Failed to check existing review", err);
                }
            };
            checkExistingReview();
        }
    }, [isOpen, user, token, novel.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setError('');

        try {
            if (isEditing) {
                await reviewService.updateReview(token, novel.id, rating, comment);
            } else {
                await reviewService.createReview(token, novel.id, rating, comment);
            }
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                // Don't reset state here if we want to keep the edited values visible on next open
                // But for now, let's reset to clean state or keep it as is?
                // If we close, next time we open useEffect will run again.
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-xl z-50 p-6"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-800">{isEditing ? `Edit Review for "${novel.title}"` : `Review "${novel.title}"`}</h3>
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        {success ? (
                            <div className="text-center py-8">
                                <div className="bg-green-100 text-green-600 p-3 rounded-full w-fit mx-auto mb-3">
                                    <Star size={32} fill="currentColor" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-800">Thank You!</h4>
                                <p className="text-slate-500">Your review has been {isEditing ? 'updated' : 'submitted'}.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                className={`transition-colors ${rating >= star ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'}`}
                                            >
                                                <Star size={32} fill="currentColor" />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Comment</label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        required
                                        rows={4}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none resize-none"
                                        placeholder="Write your thoughts about this book..."
                                    />
                                </div>

                                {error && (
                                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading || rating === 0}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : (isEditing ? 'Update Review' : 'Submit Review')}
                                </button>
                            </form>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ReviewModal;
