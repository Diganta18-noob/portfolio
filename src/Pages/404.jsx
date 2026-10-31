import {Link} from 'react-router-dom';
import {Home,LogIn} from 'lucide-react';

export default function NotFoundPage() {
  return <main className="min-h-screen bg-[#030014] text-white flex items-center justify-center px-6 py-16">
    <div className="w-full max-w-xl text-center">
      <p className="text-sm font-medium uppercase tracking-[0.25em] text-indigo-300">Diganta Biswas · Portfolio</p>
      <h1 className="mt-6 text-8xl sm:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">404</h1>
      <h2 className="mt-6 text-3xl sm:text-4xl font-semibold">Page not found</h2>
      <p className="mt-4 text-gray-400 leading-relaxed">This page may have moved or the address may be incorrect. You can return to the portfolio or sign in to the admin portal.</p>
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/" className="inline-flex justify-center items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-3 font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-300"><Home size={18}/>Back to portfolio</Link>
        <Link to="/login" className="inline-flex justify-center items-center gap-2 rounded-xl border border-white/20 hover:bg-white/5 px-6 py-3 font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-300"><LogIn size={18}/>Admin sign in</Link>
      </div>
    </div>
  </main>;
}
