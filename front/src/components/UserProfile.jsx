import { useState } from 'react';
import { authAPI } from '../services/api';

function UserProfile({ onClose, mode }) {
  const loggedInUser = JSON.parse(localStorage.getItem('user') || 'null');
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [editData, setEditData] = useState({ name: loggedInUser?.name || '', email: loggedInUser?.email || '' });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await authAPI.changePassword({
        userId: loggedInUser.id,
        ...passwordData
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({});
      alert('Password changed successfully');
      onClose();
    } catch (error) {
      setPasswordErrors({ submit: error.response?.data?.error || 'Failed to change password' });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!editData.name.trim()) {
      errors.name = 'Name is required';
    }
    if (!editData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(editData.email)) {
      errors.email = 'Email is invalid';
    }
    
    setEditErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const response = await authAPI.updateAuthUser(loggedInUser.id, editData);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setEditErrors({});
      alert('Profile updated successfully');
      window.location.reload();
    } catch (error) {
      setEditErrors({ submit: error.response?.data?.error || 'Failed to update profile' });
    }
  };

  if (mode === 'password') {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Change Password</h3>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
          <form onSubmit={handlePasswordSubmit} className="form">
            <input
              type="password"
              placeholder="Current Password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className={passwordErrors.currentPassword ? 'error' : ''}
              required
            />
            {passwordErrors.currentPassword && <span className="error-text">{passwordErrors.currentPassword}</span>}
            <input
              type="password"
              placeholder="New Password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className={passwordErrors.newPassword ? 'error' : ''}
              required
            />
            {passwordErrors.newPassword && <span className="error-text">{passwordErrors.newPassword}</span>}
            <input
              type="password"
              placeholder="Confirm New Password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className={passwordErrors.confirmPassword ? 'error' : ''}
              required
            />
            {passwordErrors.confirmPassword && <span className="error-text">{passwordErrors.confirmPassword}</span>}
            {passwordErrors.submit && <div className="error-message">{passwordErrors.submit}</div>}
            <div className="form-actions">
              <button type="submit">Change Password</button>
              <button type="button" onClick={onClose}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Profile</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleEditSubmit} className="form">
          <input
            type="text"
            placeholder="Name"
            value={editData.name}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            className={editErrors.name ? 'error' : ''}
            required
          />
          {editErrors.name && <span className="error-text">{editErrors.name}</span>}
          <input
            type="email"
            placeholder="Email"
            value={editData.email}
            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
            className={editErrors.email ? 'error' : ''}
            required
          />
          {editErrors.email && <span className="error-text">{editErrors.email}</span>}
          {editErrors.submit && <div className="error-message">{editErrors.submit}</div>}
          <div className="form-actions">
            <button type="submit">Update Profile</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserProfile;
