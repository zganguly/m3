import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';

function AuthUsers() {
  const [authUsers, setAuthUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuthUsers();
  }, []);

  const loadAuthUsers = async () => {
    try {
      const response = await authAPI.getAllAuthUsers();
      setAuthUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading auth users:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <h2>Auth Users</h2>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Auth Users</h2>
      {authUsers.length > 0 ? (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Account Created</th>
            </tr>
          </thead>
          <tbody>
            {authUsers.map(user => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`status ${user.isLoggedIn ? 'active' : 'inactive'}`}>
                    {user.isLoggedIn ? 'Logged In' : 'Logged Out'}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No auth users found</p>
      )}
    </div>
  );
}

export default AuthUsers;
