import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Contact Hub
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Contact Management Application
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-medium border-2 border-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            Register
          </Link>
        </div>
      </main>
    </div>
  );
}
