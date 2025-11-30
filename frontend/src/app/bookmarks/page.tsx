"use client";

import React, { useState, useEffect } from 'react';
import { Novel } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { bookmarkService } from '@/services/bookmarkService';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Star, Trash2, MessageSquarePlus, Loader2, MessageSquareText } from 'lucide-react';
import Link from 'next/link';
import ReviewModal from '@/components/ReviewModal';
import ReviewsListModal from '@/components/ReviewsListModal';

export default function BookmarksPage() {
    const { user, token } = useAuth();
    const [bookmarks, setBookmarks] = useState<Novel[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedNovel, setSelectedNovel] = useState<Novel | null>(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedNovelForView, setSelectedNovelForView] = useState<Novel | null>(null);

    useEffect(() => {
        async function fetchBookmarks() {
            if (user && token) {
                try {
                    setLoading(true);
                    const data = await bookmarkService.getBookmarks(token);
                    setBookmarks(data);
                } catch (error) {
                    console.error("Failed to fetch bookmarks", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        }
        fetchBookmarks();
    }, [user, token]);

    const handleRemoveBookmark = async (novelId: number) => {
        if (!token) return;
        try {
            await bookmarkService.removeBookmark(token, novelId);
            setBookmarks(bookmarks.filter(b => b.id !== novelId));
        } catch (error) {
            console.error("Failed to remove bookmark", error);
        }
    };

    const openReviewModal = (novel: Novel) => {
        setSelectedNovel(novel);
        setIsReviewModalOpen(true);
    };

    const openReviewsListModal = (novel: Novel) => {
        setSelectedNovelForView(novel);
    };

    if (!user && !loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] px-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h1>
                    <p className="text-slate-500 mb-6">Please login to view your bookmarks.</p>
                    <Link href="/login" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                        Login Now
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#FAFAFA] text-slate-800 font-sans selection:bg-blue-100">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
                            <div className="bg-blue-600 text-white p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
                                <BookOpen size={20} fill="currentColor" className="text-white/20" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">
                                    Novel Library<span className="text-blue-600">App</span>.
                                </h1>
                            </div>
                        </Link>
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-semibold text-slate-700">
                                Halo, {user?.name} 👋
                            </span>
                            <Link href="/" className="text-sm text-slate-500 hover:text-blue-600 font-medium">
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10">
                <div className="flex items-end gap-3 mb-8">
                    <h2 className="text-2xl font-bold text-slate-800">My Bookmarks</h2>
                    <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-bold mb-1">
                        {bookmarks.length}
                    </span>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
                        <p className="text-slate-500 font-medium animate-pulse">Loading bookmarks...</p>
                    </div>
                ) : bookmarks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                        <div className="bg-blue-50 p-4 rounded-full mb-4">
                            <BookOpen size={40} className="text-blue-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">No bookmarks yet</h3>
                        <p className="text-slate-500 text-sm mt-2 max-w-xs text-center mb-6">
                            Start exploring novels and bookmark your favorites to see them here.
                        </p>
                        <Link href="/" className="text-blue-600 font-medium text-sm hover:underline">
                            Browse Novels
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {bookmarks.map((novel) => (
                                <motion.div
                                    key={novel.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2 }}
                                    className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col relative group hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
                                            <BookOpen size={24} strokeWidth={1.5} />
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-lg text-sm font-bold">
                                            <Star size={14} fill="currentColor" className="text-yellow-500" />
                                            {novel.rating.toFixed(2)}
                                        </div>
                                    </div>

                                    <h3 className="font-bold text-lg text-slate-800 leading-snug mb-2 line-clamp-2">
                                        {novel.title}
                                    </h3>
                                    <p className="text-slate-500 text-sm font-medium mb-4 flex-grow">
                                        {novel.author}
                                    </p>

                                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => openReviewModal(novel)}
                                            className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-2 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors"
                                        >
                                            <MessageSquarePlus size={16} />
                                            Review
                                        </button>
                                        <button
                                            onClick={() => openReviewsListModal(novel)}
                                            className="flex-1 flex items-center justify-center gap-2 bg-gray-50 text-gray-600 py-2 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors"
                                        >
                                            <MessageSquareText size={16} />
                                            Reviews
                                        </button>
                                        <button
                                            onClick={() => handleRemoveBookmark(novel.id)}
                                            className="flex items-center justify-center p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                                            title="Remove Bookmark"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {selectedNovel && (
                <ReviewModal
                    isOpen={isReviewModalOpen}
                    onClose={() => setIsReviewModalOpen(false)}
                    novel={selectedNovel}
                />
            )}

            {selectedNovelForView && (
                <ReviewsListModal
                    isOpen={!!selectedNovelForView}
                    onClose={() => setSelectedNovelForView(null)}
                    novel={selectedNovelForView}
                />
            )}
        </main>
    );
}
