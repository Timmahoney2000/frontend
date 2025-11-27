export default function Footer() {
  return (
    <footer className="bg-zinc-900 border-t border-zinc-800 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-gray-400 text-sm">
          © {new Date().getFullYear()} Timothy J. Mahoney. All rights reserved.
        </p>
      </div>
    </footer>
  );
}