// src/pages/Dashboard.jsx
// Dashboard page - stats cards + recent tasks overview

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI, tasksAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

// ─── Stat Card Component (small reusable component) ───
function StatCard({ label, value, icon, color }) {
  return (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

// ─── Status Badge ───
function StatusBadge({ status }) {
  const map = {
    todo:        { cls: 'badge-todo',     label: 'To Do' },
    in_progress: { cls: 'badge-progress', label: 'In Progress' },
    done:        { cls: 'badge-done',     label: 'Done' },
  };
  const { cls, label } = map[status] || { cls: '', label: status };
  return <span className={`badge ${cls}`}>{label}</span>;
}

// ─── Priority Badge ───
function PriorityBadge({ priority }) {
  const map = {
    high:   { cls: 'badge-high',   label: '🔴 High' },
    medium: { cls: 'badge-medium', label: '🟡 Medium' },
    low:    { cls: 'badge-low',    label: '🟢 Low' },
  };
  const { cls, label } = map[priority] || { cls: '', label: priority };
  return <span className={`badge ${cls}`}>{label}</span>;
}

export default function Dashboard() {
  const { user }         = useAuth();
  const [stats, setStats]   = useState(null);
  const [tasks, setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Parallel mein dono API calls karo - faster!
    Promise.all([
      dashboardAPI.getStats(),
      tasksAPI.getAll(),
    ]).then(([statsRes, tasksRes]) => {
      setStats(statsRes.data);
      // Sirf latest 5 tasks dikhao
      setTasks(tasksRes.data.slice(0, 5));
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="loading"><div className="spinner" />Loading dashboard...</div>;
  }

  // Progress percentage calculate karo
  const donePercent = stats?.total_tasks
    ? Math.round((stats.done_tasks / stats.total_tasks) * 100)
    : 0;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="page-subtitle">Here's what's happening with your projects today.</p>
        </div>
        <Link to="/tasks" className="btn btn-primary">+ New Task</Link>
      </div>

      {/* Stats Grid */}
      <div className="grid-3" style={{ marginBottom: 32 }}>
        <StatCard label="Total Projects"    value={stats?.total_projects}    icon="📁" color="purple" />
        <StatCard label="Total Tasks"       value={stats?.total_tasks}       icon="✅" color="blue" />
        <StatCard label="High Priority"     value={stats?.high_priority_tasks} icon="🔴" color="red" />
        <StatCard label="To Do"             value={stats?.todo_tasks}        icon="📋" color="gray" />
        <StatCard label="In Progress"       value={stats?.in_progress_tasks} icon="⚙️" color="yellow" />
        <StatCard label="Completed"         value={stats?.done_tasks}        icon="🎉" color="green" />
      </div>

      {/* Progress Bar */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="progress-header">
          <span className="progress-title">Overall Completion</span>
          <span className="progress-percent">{donePercent}%</span>
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${donePercent}%` }} />
        </div>
        <div className="progress-labels">
          <span>{stats?.done_tasks} done</span>
          <span>{stats?.total_tasks} total</span>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="card">
        <div className="section-header">
          <h2 className="section-title">Recent Tasks</h2>
          <Link to="/tasks" className="btn btn-secondary btn-sm">View All →</Link>
        </div>

        {tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No tasks yet</h3>
            <p>Create your first task to get started</p>
          </div>
        ) : (
          <div className="task-list">
            {tasks.map(task => (
              <div key={task.id} className="task-row">
                <div className="task-row-info">
                  <div className="task-row-title">{task.title}</div>
                  {task.assigned_to_name && (
                    <div className="task-row-meta">👤 {task.assigned_to_name}</div>
                  )}
                </div>
                <div className="task-row-badges">
                  <PriorityBadge priority={task.priority} />
                  <StatusBadge status={task.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
