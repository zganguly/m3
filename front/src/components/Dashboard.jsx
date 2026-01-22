import { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const response = await dashboardAPI.getStats();
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      setLoading(false);
    }
  };

  const getMonthName = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
  };

  const formatMonthLabel = (year, month) => {
    return `${getMonthName(month)} ${year}`;
  };

  if (loading) {
    return (
      <div className="container">
        <h2>Dashboard</h2>
        <p>Loading...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container">
        <h2>Dashboard</h2>
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Users</h3>
          <div className="stat-number">{stats.users.total}</div>
          <div className="stat-details">
            <span className="stat-active">Active: {stats.users.active}</span>
            <span className="stat-inactive">Inactive: {stats.users.inactive}</span>
          </div>
        </div>

        <div className="stat-card">
          <h3>Posts</h3>
          <div className="stat-number">{stats.posts.total}</div>
          <div className="stat-details">
            <span className="stat-active">Active: {stats.posts.active}</span>
            <span className="stat-inactive">Inactive: {stats.posts.inactive}</span>
          </div>
        </div>

        <div className="stat-card">
          <h3>Comments</h3>
          <div className="stat-number">{stats.comments.total}</div>
        </div>
      </div>

      <div className="top-lists">
        <div className="top-list-card">
          <h3>Top 3 Users by Posts</h3>
          {stats.topUsersByPosts.length > 0 ? (
            <ul className="top-list">
              {stats.topUsersByPosts.map((user, index) => (
                <li key={user.userId} className="top-list-item">
                  <span className="rank">{index + 1}</span>
                  <div className="item-details">
                    <div className="item-name">{user.userName}</div>
                    <div className="item-email">{user.userEmail}</div>
                  </div>
                  <span className="item-count">{user.postCount} posts</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No data available</p>
          )}
        </div>

        <div className="top-list-card">
          <h3>Top 3 Posts by Comments</h3>
          {stats.topPostsByComments.length > 0 ? (
            <ul className="top-list">
              {stats.topPostsByComments.map((post, index) => (
                <li key={post.postId} className="top-list-item">
                  <span className="rank">{index + 1}</span>
                  <div className="item-details">
                    <div className="item-name">{post.postTitle}</div>
                    <div className="item-slug">{post.postSlug}</div>
                  </div>
                  <span className="item-count">{post.commentCount} comments</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No data available</p>
          )}
        </div>

        <div className="top-list-card">
          <h3>Top 3 Users by Comments</h3>
          {stats.topUsersByComments.length > 0 ? (
            <ul className="top-list">
              {stats.topUsersByComments.map((user, index) => (
                <li key={user.userId} className="top-list-item">
                  <span className="rank">{index + 1}</span>
                  <div className="item-details">
                    <div className="item-name">{user.userName}</div>
                    <div className="item-email">{user.userEmail}</div>
                  </div>
                  <span className="item-count">{user.commentCount} comments</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No data available</p>
          )}
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-card">
          <h3>Posts Submitted (Last 12 Months)</h3>
          {stats.postsByMonth.length > 0 ? (
            <div className="chart-container">
              <div className="chart-bars">
                {stats.postsByMonth.map((item, index) => {
                  const maxCount = Math.max(...stats.postsByMonth.map(p => p.count), 1);
                  const height = (item.count / maxCount) * 100;
                  return (
                    <div key={index} className="chart-bar-wrapper">
                      <div className="chart-bar" style={{ height: `${height}%` }}>
                        <span className="chart-value">{item.count}</span>
                      </div>
                      <div className="chart-label">{formatMonthLabel(item.year, item.month)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p>No data available</p>
          )}
        </div>

        <div className="chart-card">
          <h3>Comments Submitted (Last 12 Months)</h3>
          {stats.commentsByMonth.length > 0 ? (
            <div className="chart-container">
              <div className="chart-bars">
                {stats.commentsByMonth.map((item, index) => {
                  const maxCount = Math.max(...stats.commentsByMonth.map(c => c.count), 1);
                  const height = (item.count / maxCount) * 100;
                  return (
                    <div key={index} className="chart-bar-wrapper">
                      <div className="chart-bar" style={{ height: `${height}%` }}>
                        <span className="chart-value">{item.count}</span>
                      </div>
                      <div className="chart-label">{formatMonthLabel(item.year, item.month)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p>No data available</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
