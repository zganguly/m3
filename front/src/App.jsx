import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Dashboard from './components/Dashboard';
import Users from './components/Users';
import AuthUsers from './components/AuthUsers';
import Posts from './components/Posts';
import Comments from './components/Comments';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import UserProfile from './components/UserProfile';
import ProtectedRoute from './components/ProtectedRoute';
import { authAPI } from './services/api';
import './App.css';

function Navigation() {
  const navigate = useNavigate();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await authAPI.logout({ refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <nav className="tabs">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/users"
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          Users
        </NavLink>
        <NavLink
          to="/auth-users"
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          Auth Users
        </NavLink>
        <NavLink
          to="/posts"
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          Posts
        </NavLink>
        <NavLink
          to="/comments"
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          Comments
        </NavLink>
        <div className="user-info">
          <span>{user.name}</span>
          <button onClick={() => setShowEditModal(true)} className="btn-profile">Edit Profile</button>
          <button onClick={() => setShowPasswordModal(true)} className="btn-password-header">Change Password</button>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </nav>
      {showPasswordModal && <UserProfile mode="password" onClose={() => setShowPasswordModal(false)} />}
      {showEditModal && <UserProfile mode="edit" onClose={() => setShowEditModal(false)} />}
    </>
  );
}

function Layout() {
  return (
    <>
      <header className="app-header">
        <h1>Mini Blog CRUD</h1>
        <Navigation />
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
          <Route path="/auth-users" element={<ProtectedRoute><AuthUsers /></ProtectedRoute>} />
          <Route path="/posts" element={<ProtectedRoute><Posts /></ProtectedRoute>} />
          <Route path="/comments" element={<ProtectedRoute><Comments /></ProtectedRoute>} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/*" element={<Layout />} />
      </Routes>
    </div>
  );
}

export default App;
