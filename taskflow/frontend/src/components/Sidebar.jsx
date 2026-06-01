// src/components/Sidebar.jsx
// Left navigation sidebar - saare pages ka link yahan hoga

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

// Nav items ka data - ek array mein define karo
const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/projects',  label: 'Projects',  icon: '📁' },
  { path: '/tasks',     label: 'Tasks',     icon: '✅' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();              // context se logout karo
    navigate('/login');    // login page pe bhejo
  };

  // User name ke initials nikalo (avatar ke liye)
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <aside className="sidebar">
      {/* Logo / Brand */}
      <div className="sidebar-brand">
        <div className="brand-icon">⚡</div>
        <div>
          <div className="brand-name">TaskFlow</div>
          <div className="brand-tagline">Project Manager</div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        <div className="nav-label">MENU</div>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'nav-item-active' : ''}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Profile at bottom */}
      <div className="sidebar-footer">
        <div className="user-info">
          {/* Avatar with initials */}
          <div className="user-avatar">
            {getInitials(user?.name)}
          </div>
          <div className="user-details">
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout} title="Logout">
          🚪
        </button>
      </div>
    </aside>
  );
}
