import { useState } from 'react';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    const data = await res.json();
    if (!res.ok) return setError(data.message || 'Login failed');

    onLogin(data.token);
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#020617_0%,#111827_45%,#312e81_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/85 p-8 shadow-2xl shadow-slate-950/50 backdrop-blur">
          <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">Welcome</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Login</h2>
          <p className="mt-2 text-sm text-slate-300">Sign in to your task manager dashboard.</p>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <input className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <input className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            {error && <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
            <button className="w-full rounded-full bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400" type="submit">Login</button>
            <p className="text-center text-sm text-slate-300">Need an account? <a className="font-medium text-indigo-300 hover:text-indigo-200" href="/register">Create one</a></p>
          </form>
        </div>
      </div>
    </div>
  );
}
