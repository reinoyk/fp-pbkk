"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Novel } from '@/types';
import { novelService } from '@/services/novelService';
import BookCard from '@/components/BookCard';
import AddNovelModal from '@/components/AddNovelModal';
import { Plus, Loader2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [novels, setNovels] = useState<Novel[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNovel, setSelectedNovel] = useState<Novel | null>(null);
    const { token } = useAuth();

    useEffect(() => {
        if (!authLoading) {
            if (!user || user.role !== 'admin') {
                router.push('/');
            } else {
                fetchNovels();
            }
        }
    }, [user, authLoading, router]);

    const fetchNovels = async () => {
        try {
            setLoading(true);
            const data = await novelService.getNovels();
            setNovels(data.novels);
        } catch (error) {
            console.error("Failed to fetch novels", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!user || !confirm('Are you sure you want to delete this novel?')) return;

        try {
            await novelService.deleteNovel(token, id);
            fetchNovels();
        } catch (error) {
            alert('Failed to delete novel');
        }
    };

    const handleEdit = (novel: Novel) => {
        setSelectedNovel(novel);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedNovel(null);
        setIsModalOpen(true);
    };

    if (authLoading || (user && user.role !== 'admin')) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#FAFAFA] text-slate-800 font-sans">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-900 text-white p-2 rounded-lg">
                            <ShieldAlert size={20} />
                        </div>
                        <h1 className="text-xl font-bold text-slate-900">Admin Dashboard</h1>
                    </div>
                    <div className="flex items-center gap-4">
                         <Link href="/" className="text-sm font-medium text-slate-500 hover:text-blue-600">
                            Back to Home
                        </Link>
                        <button
                            onClick={handleAdd}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            <Plus size={18} />
                            Add Novel
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-blue-600" size={32} />
                    </div>
                ) : (
                    <>
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-slate-800">Manage Novels</h2>
                            <p className="text-slate-500 text-sm">Total {novels.length} novels in database</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {novels.map((novel, index) => (
                                <div key={novel.id} className="relative group">
                                    <BookCard
                                        novel={novel}
                                        index={index}
                                        isBookmarked={false}
                                    />
                                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleEdit(novel);
                                            }}
                                            className="bg-white/90 p-2 rounded-full shadow-sm hover:bg-blue-50 text-blue-600"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleDelete(novel.id);
                                            }}
                                            className="bg-white/90 p-2 rounded-full shadow-sm hover:bg-red-50 text-red-600"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <AddNovelModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchNovels}
                novel={selectedNovel}
            />
        </main>
    );
}
