import { useEffect, useMemo, useState } from 'react';

export default function Dashboard({ token, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', status: 'pending' });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const pageSize = 6;

  const resetForm = () => {
    setForm({ title: '', description: '', status: 'pending' });
    setEditingTaskId(null);
  };

  const loadTasks = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/tasks', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to load tasks');
      }

      setTasks(data);
    } catch (err) {
      setError(err.message || 'Unable to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadTasks();
    }
  }, [token]);

  const saveTask = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      setError('Task title is required.');
      return;
    }

    setError('');

    const url = editingTaskId ? `/api/tasks/${editingTaskId}` : '/api/tasks';
    const method = editingTaskId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, title: form.title.trim(), description: form.description.trim() })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.message || 'Unable to save task');
      return;
    }

    resetForm();
    loadTasks();
  };

  const toggleStatus = async (task) => {
    const res = await fetch(`/api/tasks/${task._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: task.status === 'completed' ? 'pending' : 'completed' })
    });

    if (!res.ok) {
      setError('Unable to update task status');
      return;
    }

    loadTasks();
  };

  const startEdit = (task) => {
    setEditingTaskId(task._id);
    setForm({ title: task.title, description: task.description || '', status: task.status });
  };

  const deleteTask = async (id) => {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });

    if (!res.ok) {
      setError('Unable to delete task');
      return;
    }

    if (editingTaskId === id) resetForm();
    loadTasks();
  };

  const filteredTasks = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return tasks;

    return tasks.filter((task) =>
      [task.title, task.description, task.status].some((value) =>
        String(value || '').toLowerCase().includes(query)
      )
    );
  }, [tasks, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / pageSize));
  const pagedTasks = filteredTasks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#111827,#020617_55%)] text-slate-100">
      <main className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-8 flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/50 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">Welcome back</p>
            <h2 className="mt-1 text-3xl font-semibold text-white">Task Manager Dashboard</h2>
          </div>
          <button className="rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-indigo-400 hover:bg-slate-700" onClick={onLogout}>Logout</button>
        </nav>

        <section className="mb-8 grid gap-6 md:grid-cols-3">
          <article className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/45">
            <span className="text-sm text-slate-300">Total Tasks</span>
            <strong className="mt-2 block text-3xl font-semibold text-white">{tasks.length}</strong>
          </article>
          <article className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/45">
            <span className="text-sm text-slate-300">Completed</span>
            <strong className="mt-2 block text-3xl font-semibold text-emerald-300">{tasks.filter((task) => task.status === 'completed').length}</strong>
          </article>
          <article className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/45">
            <span className="text-sm text-slate-300">Pending</span>
            <strong className="mt-2 block text-3xl font-semibold text-amber-300">{tasks.filter((task) => task.status === 'pending').length}</strong>
          </article>
        </section>

        <div className="grid gap-8 xl:grid-cols-[1fr_1.3fr]">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/45">
            <h3 className="text-xl font-semibold text-white">{editingTaskId ? 'Edit Task' : 'Add Task'}</h3>
            <p className="mt-1 text-sm text-slate-300">Plan your work and keep everything on track.</p>
            <form className="mt-6 space-y-4" onSubmit={saveTask}>
              <input className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <textarea className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows="4" />
              <select className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
              <div className="flex flex-wrap gap-3">
                <button className="rounded-full bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400" type="submit">{editingTaskId ? 'Update Task' : 'Add Task'}</button>
                {editingTaskId && <button className="rounded-full border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-700" type="button" onClick={resetForm}>Cancel Edit</button>}
              </div>
            </form>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/45">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-white">Task List</h3>
                <p className="text-sm text-slate-300">{filteredTasks.length} results</p>
              </div>
            </div>

            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tasks by title, status, or description"
              className="mt-5 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
            />

            {error && <p className="mt-4 rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}

            {loading ? (
              <p className="mt-4 text-slate-300">Loading tasks...</p>
            ) : (
              <div className="mt-6 space-y-4">
                {pagedTasks.map((task) => (
                  <article className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-lg shadow-slate-950/30" key={task._id}>
                    <div className="flex items-start justify-between gap-3">
                      <strong className="text-lg text-white">{task.title}</strong>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${task.status === 'completed' ? 'bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/20' : 'bg-amber-400/10 text-amber-200 ring-1 ring-amber-400/20'}`}>{task.status}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-300">{task.description || 'No description provided.'}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button className="rounded-full border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-700" onClick={() => toggleStatus(task)}>Toggle Status</button>
                      <button className="rounded-full border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-700" onClick={() => startEdit(task)}>Edit</button>
                      <button className="rounded-full bg-rose-500/90 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-400" onClick={() => deleteTask(task._id)}>Delete</button>
                    </div>
                  </article>
                ))}

                {!pagedTasks.length && <p className="rounded-2xl border border-dashed border-slate-700 p-4 text-sm text-slate-300">No tasks match your search. Try another keyword.</p>}
              </div>
            )}

            {!loading && filteredTasks.length > pageSize && (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300">
                <button className="rounded-full border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1}>Previous</button>
                <span>Page {currentPage} of {totalPages}</span>
                <button className="rounded-full border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages}>Next</button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
