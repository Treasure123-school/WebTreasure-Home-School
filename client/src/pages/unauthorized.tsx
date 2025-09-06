import { Link } from "wouter";

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-lg text-gray-700 mb-8">
          You don't have permission to access this page.
        </p>
        <Link href="/">
          <a className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Return to Home
          </a>
        </Link>
      </div>
    </div>
  );
}
