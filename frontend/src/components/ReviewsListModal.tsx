import React, { useState, useEffect } from 'react';
import { X, Star, User, Calendar, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { reviewService } from '@/services/reviewService';
import { Novel, Review } from '@/types';

interface ReviewsListModalProps {
    isOpen: boolean;
    onClose: () => void;
    novel: Novel;
}

const ReviewsListModal: React.FC<ReviewsListModalProps> = ({ isOpen, onClose, novel }) => {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchReviews();
        }
    }, [isOpen, novel.id]);

    const fetchReviews = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await reviewService.getReviews(novel.id);
            setReviews(data);
        } catch (err) {
            setError('Failed to load reviews');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
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
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-xl z-50 flex flex-col max-h-[80vh]"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Reviews</h3>
                                <p className="text-sm text-slate-500 font-medium">{novel.title}</p>
                            </div>
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto p-6 flex-grow">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-3" />
                                    <p className="text-slate-400 text-sm">Loading reviews...</p>
                                </div>
                            ) : error ? (
                                <div className="text-center py-12 text-red-500 bg-red-50 rounded-xl">
                                    {error}
                                </div>
                            ) : reviews.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="bg-gray-50 p-4 rounded-full w-fit mx-auto mb-4">
                                        <Star size={32} className="text-gray-300" />
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-700">No reviews yet</h4>
                                    <p className="text-slate-500 text-sm mt-1">Be the first to review this book!</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {reviews.map((review) => (
                                        <div key={review.id} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                                                        <User size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-sm">
                                                            {review.user?.name || 'Anonymous User'}
                                                        </p>
                                                        <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                                                            <Calendar size={12} />
                                                            {formatDate(review.CreatedAt || review.createdAt)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-gray-200 shadow-sm">
                                                    <Star size={12} className="text-yellow-400" fill="currentColor" />
                                                    <span className="text-sm font-bold text-slate-700">{review.rating}</span>
                                                </div>
                                            </div>
                                            <p className="text-slate-600 text-sm leading-relaxed">
                                                {review.comment}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ReviewsListModal;
