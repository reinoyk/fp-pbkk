import React, { useState, useEffect } from 'react';
import { X, Loader2, BookPlus, BookOpenCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { novelService } from '@/services/novelService';
import { useAuth } from '@/context/AuthContext';
import { Novel } from '@/types';

interface AddNovelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    novel?: Novel | null;
}

const AddNovelModal: React.FC<AddNovelModalProps> = ({ isOpen, onClose, onSuccess, novel }) => {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [rating, setRating] = useState(0);
    const [language, setLanguage] = useState('');
    const [yearPublished, setYearPublished] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const { user, token } = useAuth();

    useEffect(() => {
        if (novel) {
            setTitle(novel.title);
            setAuthor(novel.author);
            setRating(novel.rating);
            setLanguage(novel.language);
            setYearPublished(novel.year_published);
        } else {
            setTitle('');
            setAuthor('');
            setRating(0);
            setLanguage('');
            setYearPublished(new Date().getFullYear());
        }
    }, [novel, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setError('');

        try {
            const novelData = {
                title,
                author,
                rating: Number(rating),
                language,
                year_published: Number(yearPublished),
            };

            if (novel) {
                await novelService.updateNovel(token, novel.id, novelData);
            } else {
                await novelService.createNovel(token, novelData);
            }

            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                if (!novel) {
                    setTitle('');
                    setAuthor('');
                    setRating(0);
                    setLanguage('');
                    setYearPublished(new Date().getFullYear());
                }
                if (onSuccess) onSuccess();
            }, 1500);
        } catch (err: any) {
            setError(err.message || `Failed to ${novel ? 'update' : 'create'} novel`);
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
                            <h3 className="text-lg font-bold text-slate-800">{novel ? 'Edit Novel' : 'Add New Novel'}</h3>
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        {success ? (
                            <div className="text-center py-8">
                                <div className="bg-green-100 text-green-600 p-3 rounded-full w-fit mx-auto mb-3">
                                    {novel ? <BookOpenCheck size={32} /> : <BookPlus size={32} />}
                                </div>
                                <h4 className="text-xl font-bold text-slate-800">Success!</h4>
                                <p className="text-slate-500">Novel has been {novel ? 'updated' : 'added to the library'}.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                        placeholder="Enter book title"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Author</label>
                                    <input
                                        type="text"
                                        value={author}
                                        onChange={(e) => setAuthor(e.target.value)}
                                        required
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                        placeholder="Enter author name"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Rating</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="5"
                                        value={rating}
                                        onChange={(e) => setRating(parseFloat(e.target.value))}
                                        required
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                        placeholder="Enter rating (0-5)"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Language</label>
                                    <input
                                        type="text"
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        required
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                        placeholder="Enter language"
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Year Published</label>
                                    <input
                                        type="number"
                                        value={yearPublished}
                                        onChange={(e) => setYearPublished(parseInt(e.target.value))}
                                        required
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                        placeholder="Enter year published"
                                    />
                                </div>

                                {error && (
                                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : (novel ? 'Update Novel' : 'Add Novel')}
                                </button>
                            </form>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AddNovelModal;
