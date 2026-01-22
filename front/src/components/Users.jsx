import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';

function Users() {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const loggedInUser = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    loadUsers();
  }, [currentPage, search]);

  const loadUsers = async () => {
    try {
      const response = await userAPI.getAll(currentPage, search);
      setUsers(response.data.users);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await userAPI.update(editingUser._id, formData);
      } else {
        await userAPI.create(formData);
      }
      setShowForm(false);
      setEditingUser(null);
      setFormData({ name: '', email: '' });
      loadUsers();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userAPI.delete(id);
        loadUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await userAPI.toggleStatus(id);
      loadUsers();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const isOwnRecord = (userId) => {
    if (!loggedInUser) return false;
    return String(loggedInUser.id) === String(userId);
  };

  return (
    <div className="container">
      <h2>Users</h2>
      <div className="header-actions">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="search-input"
        />
        <button onClick={() => {
          setShowForm(true);
          setEditingUser(null);
          setFormData({ name: '', email: '' });
        }}>Add User</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form">
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <div className="form-actions">
            <button type="submit">{editingUser ? 'Update' : 'Create'}</button>
            <button type="button" onClick={() => {
              setShowForm(false);
              setEditingUser(null);
            }}>Cancel</button>
          </div>
        </form>
      )}

      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Created By</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <span className={`status ${user.isActive ? 'active' : 'inactive'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>{user.createdByName || 'N/A'}</td>
              <td>{new Date(user.createdAt).toLocaleDateString()}</td>
              <td>
                {isOwnRecord(user.createdBy) && (
                <>
                <button onClick={() => handleEdit(user)} className="btn-edit">Edit</button>
                    <button onClick={() => handleToggleStatus(user._id)} className="btn-toggle">
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    {!user.isActive && (
                      <button onClick={() => handleDelete(user._id)} className="btn-delete">Delete</button>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}

export default Users;
