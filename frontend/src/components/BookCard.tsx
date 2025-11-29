"use client";

import React, { useState } from 'react';
import { Novel } from '@/types';
import { Search, BookOpen, Star, AlertCircle, Loader2, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { bookmarkService } from '@/services/bookmarkService';


interface BookCardProps {
  novel: Novel;
  index: number;
  isBookmarked?: boolean;
  onToggleBookmark?: (novel: Novel) => void;
}

const BookCard: React.FC<BookCardProps> = ({ novel, index, isBookmarked = false, onToggleBookmark }) => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [bookmarked, setBookmarked] = useState(isBookmarked);

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || !token || loading) return;

    setLoading(true);
    try {
      if (bookmarked) {
        await bookmarkService.removeBookmark(token, novel.id);
        setBookmarked(false);
      } else {
        await bookmarkService.addBookmark(token, novel.id);
        setBookmarked(true);
      }
      if (onToggleBookmark) {
        onToggleBookmark(novel);
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      // Animasi saat muncul (Stagger effect)
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}

      // Animasi saat di-hover (Melayang)
      whileHover={{
        y: -8,
        boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.1)",
        borderColor: "rgba(59, 130, 246, 0.3)"
      }}

      className="bg-white rounded-2xl border border-gray-100 p-6 cursor-pointer transition-colors relative overflow-hidden group h-full flex flex-col"
    >
      {/* Dekorasi Background Gradient Halus saat Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-transparent to-blue-50/0 group-hover:from-blue-50/30 group-hover:to-purple-50/30 transition-all duration-500" />

      {/* Header Kartu: Ikon Buku & Rating */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="bg-blue-50 text-blue-600 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
          <BookOpen size={24} strokeWidth={1.5} />
        </div>
        <div className="flex gap-2">
          {user && (
            <button
              onClick={handleBookmarkClick}
              disabled={loading}
              className={`p-2 rounded-lg transition-colors ${bookmarked ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400 hover:text-red-500'}`}
            >
              <Heart size={18} fill={bookmarked ? "currentColor" : "none"} className={loading ? "animate-pulse" : ""} />
            </button>
          )}
          <div className="flex items-center gap-1.5 bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-lg text-sm font-bold shadow-sm h-fit">
            <Star size={14} fill="currentColor" className="text-yellow-500" />
            {novel.rating.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Konten Kartu */}
      <div className="relative z-10 flex-grow">
        <h3 className="font-bold text-lg text-slate-800 leading-snug mb-2 group-hover:text-blue-700 transition-colors line-clamp-2">
          {novel.title}
        </h3>
        <p className="text-slate-500 text-sm font-medium mb-4">
          {novel.author}
        </p>
      </div>

      {/* Footer Kartu */}
      <div className="flex items-center justify-between text-xs text-slate-400 border-t border-gray-100 pt-4 mt-2 relative z-10">
        <span className="bg-gray-100 px-2 py-1 rounded-md text-slate-600 font-medium">
          {novel.year_published}
        </span>
        <span className="font-medium tracking-wide text-slate-400">
          {novel.language}
        </span>
      </div>
    </motion.div>
  );
};

export default BookCard;