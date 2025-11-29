export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-20 py-8">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
        <p>© 2025 LibraryApp. Final Project Framework Programming.</p>
        <div className="flex gap-4 mt-4 md:mt-0">
          <a href="#" className="hover:text-blue-600 transition">About</a>
          <a href="#" className="hover:text-blue-600 transition">Contact</a>
          <a href="#" className="hover:text-blue-600 transition">GitHub</a>
        </div>
      </div>
    </footer>
  );
}