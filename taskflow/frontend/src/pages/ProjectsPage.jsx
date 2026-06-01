// src/pages/ProjectsPage.jsx
// Projects ki list dikhao + create/edit/delete modal

import React, { useState, useEffect } from 'react';
import { projectsAPI } from '../services/api';
import './ProjectsPage.css';

// ─── Project Card ───
function ProjectCard({ project, onEdit, onDelete }) {
  return (
    <div className="project-card">
      <div className="project-card-header">
        <div className="project-icon">📁</div>
        <div className="project-menu">
          <button className="icon-btn" onClick={() => onEdit(project)} title="Edit">✏️</button>
          <button className="icon-btn danger" onClick={() => onDelete(project.id)} title="Delete">🗑️</button>
        </div>
      </div>
      <h3 className="project-name">{project.name}</h3>
      <p className="project-desc">{project.description || 'No description added.'}</p>
      <div className="project-footer">
        <span className="task-count">📋 {project.task_count} tasks</span>
        <span className={`badge ${project.is_active ? 'badge-done' : 'badge-todo'}`}>
          {project.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>
    </div>
  );
}

// ─── Project Form Modal ───
function ProjectModal({ project, onClose, onSave }) {
  // Edit mode mein existing data prefill karo
  const [form, setForm]     = useState({ name: project?.name || '', description: project?.description || '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      if (project) {
        await projectsAPI.update(project.id, form); // update
      } else {
        await projectsAPI.create(form);              // create
      }
      onSave(); // parent ko batao - list refresh karo
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* onClick propagation rokao - modal click se band na ho */}
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{project ? '✏️ Edit Project' : '📁 New Project'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input
              className="form-input" placeholder="e.g. E-Commerce Platform"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea" placeholder="What is this project about?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ───
export default function ProjectsPage() {
  const [projects, setProjects]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null); // null = create mode

  // Projects fetch karo
  const fetchProjects = async () => {
    try {
      const res = await projectsAPI.getAll();
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleEdit = (project) => {
    setEditProject(project);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project? All tasks will be deleted too!')) return;
    try {
      await projectsAPI.delete(id);
      fetchProjects(); // list refresh karo
    } catch (err) {
      alert('Failed to delete project');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditProject(null);
  };

  const handleSave = () => {
    handleModalClose();
    fetchProjects(); // naya data lao
  };

  if (loading) return <div className="loading"><div className="spinner" />Loading projects...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} projects total</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📁</div>
          <h3>No projects yet</h3>
          <p>Create your first project to get started</p>
        </div>
      ) : (
        <div className="grid-3">
          {projects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal - sirf tab dikhao jab showModal true ho */}
      {showModal && (
        <ProjectModal
          project={editProject}
          onClose={handleModalClose}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
