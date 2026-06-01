// src/pages/TasksPage.jsx
// Tasks ki full list - filter, create, edit, delete, status change

import React, { useState, useEffect } from 'react';
import { tasksAPI, projectsAPI, usersAPI } from '../services/api';
import './TasksPage.css';

// ─── Badges ───
const StatusBadge = ({ s }) => {
  const m = { todo: ['badge-todo','📋 To Do'], in_progress: ['badge-progress','⚙️ In Progress'], done: ['badge-done','✅ Done'] };
  const [cls, label] = m[s] || ['',''];
  return <span className={`badge ${cls}`}>{label}</span>;
};
const PriorityBadge = ({ p }) => {
  const m = { high: ['badge-high','🔴 High'], medium: ['badge-medium','🟡 Medium'], low: ['badge-low','🟢 Low'] };
  const [cls, label] = m[p] || ['',''];
  return <span className={`badge ${cls}`}>{label}</span>;
};

// ─── Task Form Modal ───
function TaskModal({ task, projects, users, onClose, onSave }) {
  const [form, setForm] = useState({
    title:       task?.title       || '',
    description: task?.description || '',
    status:      task?.status      || 'todo',
    priority:    task?.priority    || 'medium',
    due_date:    task?.due_date    || '',
    project_id:  task?.project_id  || (projects[0]?.id || ''),
    assigned_to: task?.assigned_to || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    // assigned_to ko number mein convert karo (select value string hoti hai)
    const payload = { ...form, assigned_to: form.assigned_to ? Number(form.assigned_to) : null };
    try {
      task ? await tasksAPI.update(task.id, payload) : await tasksAPI.create(payload);
      onSave();
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{task ? '✏️ Edit Task' : '✅ New Task'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Task Title *</label>
            <input className="form-input" placeholder="e.g. Design login page"
              value={form.title} onChange={e => set('title', e.target.value)} required autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" placeholder="Task details..."
              value={form.description} onChange={e => set('description', e.target.value)} />
          </div>
          {/* 2-column grid for dropdowns */}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Project *</label>
              <select className="form-select" value={form.project_id}
                onChange={e => set('project_id', Number(e.target.value))} required>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Assign To</label>
              <select className="form-select" value={form.assigned_to}
                onChange={e => set('assigned_to', e.target.value)}>
                <option value="">Unassigned</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={form.priority}
                onChange={e => set('priority', e.target.value)}>
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status}
                onChange={e => set('status', e.target.value)}>
                <option value="todo">📋 To Do</option>
                <option value="in_progress">⚙️ In Progress</option>
                <option value="done">✅ Done</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input type="date" className="form-input"
              value={form.due_date} onChange={e => set('due_date', e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ───
export default function TasksPage() {
  const [tasks, setTasks]         = useState([]);
  const [projects, setProjects]   = useState([]);
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask]   = useState(null);

  // Filters
  const [filterStatus,   setFilterStatus]   = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterProject,  setFilterProject]  = useState('');

  // Sab data fetch karo
  const fetchAll = async () => {
    try {
      const filters = {};
      if (filterStatus)   filters.status     = filterStatus;
      if (filterPriority) filters.priority   = filterPriority;
      if (filterProject)  filters.project_id = filterProject;

      const [tasksRes, projRes, usersRes] = await Promise.all([
        tasksAPI.getAll(filters),
        projectsAPI.getAll(),
        usersAPI.getAll(),
      ]);
      setTasks(tasksRes.data);
      setProjects(projRes.data);
      setUsers(usersRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [filterStatus, filterPriority, filterProject]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    await tasksAPI.delete(id);
    fetchAll();
  };

  // Quick status toggle - task pe click karke status change karo
  const cycleStatus = async (task) => {
    const next = { todo: 'in_progress', in_progress: 'done', done: 'todo' };
    await tasksAPI.update(task.id, { status: next[task.status] });
    fetchAll();
  };

  const handleSave = () => {
    setShowModal(false); setEditTask(null);
    fetchAll();
  };

  if (loading) return <div className="loading"><div className="spinner" />Loading tasks...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">{tasks.length} tasks found</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Task</button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <select className="form-select filter-select" value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <select className="form-select filter-select" value={filterPriority}
          onChange={e => setFilterPriority(e.target.value)}>
          <option value="">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select className="form-select filter-select" value={filterProject}
          onChange={e => setFilterProject(e.target.value)}>
          <option value="">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        {(filterStatus || filterPriority || filterProject) && (
          <button className="btn btn-secondary btn-sm"
            onClick={() => { setFilterStatus(''); setFilterPriority(''); setFilterProject(''); }}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* Task Table */}
      {tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✅</div>
          <h3>No tasks found</h3>
          <p>Create a task or change your filters</p>
        </div>
      ) : (
        <div className="task-table-wrapper card" style={{ padding: 0 }}>
          <table className="task-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Due Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task.id} className="task-table-row">
                  <td>
                    <div className="task-title">{task.title}</div>
                    {task.description && (
                      <div className="task-desc-preview">{task.description.slice(0, 50)}{task.description.length > 50 ? '…' : ''}</div>
                    )}
                  </td>
                  <td><PriorityBadge p={task.priority} /></td>
                  <td>
                    {/* Status badge click karne se next status pe jaao */}
                    <button className="status-toggle" onClick={() => cycleStatus(task)} title="Click to change status">
                      <StatusBadge s={task.status} />
                    </button>
                  </td>
                  <td>
                    <span className="assignee">
                      {task.assigned_to_name ? `👤 ${task.assigned_to_name}` : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </span>
                  </td>
                  <td>
                    <span className="due-date">
                      {task.due_date ? `📅 ${task.due_date}` : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="icon-btn" onClick={() => { setEditTask(task); setShowModal(true); }}>✏️</button>
                      <button className="icon-btn danger" onClick={() => handleDelete(task.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <TaskModal
          task={editTask}
          projects={projects}
          users={users}
          onClose={() => { setShowModal(false); setEditTask(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
