"use client";

import { Novel } from '@/types';
import React, { useState, useEffect } from 'react';
import BookCard from '@/components/BookCard';
import { Search, BookOpen, Star, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { bookmarkService } from '@/services/bookmarkService';


export default function Home() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const { user, token, logout } = useAuth();
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:8001/novels");

        if (!res.ok) {
          throw new Error("Backend offline");
        }

        const json = await res.json();
        setNovels(json.novels);
        setError(false);
      } catch (err) {
        console.log("Menggunakan data dummy untuk preview karena backend tidak terdeteksi di lingkungan cloud.");
      } finally {
        // Sedikit delay buatan biar loading animation terlihat keren
        setTimeout(() => setLoading(false), 800);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchBookmarks() {
      if (user && token) {
        try {
          const bookmarks = await bookmarkService.getBookmarks(token);
          const ids = new Set(bookmarks.map(b => b.id));
          setBookmarkedIds(ids);
        } catch (error) {
          console.error("Failed to fetch bookmarks", error);
        }
      } else {
        setBookmarkedIds(new Set());
      }
    }
    fetchBookmarks();
  }, [user, token]);

  // Logic Filter
  const filteredNovels = novels.filter((novel) =>
    novel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    novel.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-slate-800 font-sans selection:bg-blue-100">

      {/* --- HEADER SECTION --- */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">

            {/* Logo */}
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="bg-blue-600 text-white p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
                <BookOpen size={20} fill="currentColor" className="text-white/20" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">
                  Novel Library<span className="text-blue-600">App</span>.
                </h1>
                <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase mt-0.5">
                  Final Project PBKK
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-96 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Find book title, author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-4 py-2.5 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all shadow-inner placeholder:text-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs bg-gray-200 px-1.5 py-0.5 rounded-md"
                >
                  ESC
                </button>
              )}
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-4">
              {user ? (
                // TAMPILAN JIKA SUDAH LOGIN
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-slate-700">
                    Halo, {user.name} 👋
                  </span>
                  <button
                    onClick={logout}
                    className="text-sm text-red-500 hover:text-red-700 font-medium"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                // TAMPILAN JIKA BELUM LOGIN
                <div className="flex gap-3">
                  <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-600">
                    Login
                  </Link>
                  <Link href="/register" className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* State: Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
            <p className="text-slate-500 font-medium animate-pulse">Menghubungkan ke server...</p>
          </div>
        ) : (
          <>
            {/* Info Bar */}
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Book Collection</h2>
                <p className="text-slate-500 text-sm mt-1">
                  Showing <span className="font-bold text-slate-800">{filteredNovels.length}</span> result from database.
                </p>
              </div>
            </div>

            {/* Grid Layout */}
            <AnimatePresence>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredNovels.map((novel, index) => (
                  <BookCard
                    key={novel.id}
                    novel={novel}
                    index={index}
                    isBookmarked={bookmarkedIds.has(novel.id)}
                  />
                ))}
              </div>
            </AnimatePresence>

            {/* State: Kosong / Tidak Ketemu */}
            {!loading && filteredNovels.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-300"
              >
                <div className="bg-red-50 p-4 rounded-full mb-4">
                  <AlertCircle size={40} className="text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Buku tidak ditemukan</h3>
                <p className="text-slate-500 text-sm mt-2 max-w-xs text-center">
                  Coba cari dengan kata kunci lain atau pastikan penulisan judul benar.
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-6 text-blue-600 font-medium text-sm hover:underline"
                >
                  Bersihkan pencarian
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Footer Simple */}
      <footer className="max-w-7xl mx-auto px-6 py-8 border-t border-gray-200 mt-10">
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
          <p>&copy; 2025 LibraryApp Project. All rights reserved.</p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <span className="cursor-pointer hover:text-blue-600">Privacy</span>
            <span className="cursor-pointer hover:text-blue-600">Terms</span>
            <span className="cursor-pointer hover:text-blue-600">GitHub</span>
          </div>
        </div>
      </footer>
    </main>
  );
}