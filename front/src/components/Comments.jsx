import { useState, useEffect } from 'react';
import { commentAPI, userAPI, postAPI } from '../services/api';
import Select from 'react-select';

function Comments() {
  const [comments, setComments] = useState([]);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filterPost, setFilterPost] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [formData, setFormData] = useState({ content: '', author: '', post: '' });

  useEffect(() => {
    loadComments();
    loadUsers();
    loadPosts();
  }, [currentPage, search, filterPost]);

  const loadComments = async () => {
    try {
      const response = await commentAPI.getAll(currentPage, search, filterPost || undefined);
      setComments(response.data.comments);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await userAPI.getAllActive();
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadPosts = async () => {
    try {
      const response = await postAPI.getAllActive();
      setPosts(response.data);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingComment) {
        await commentAPI.update(editingComment._id, formData);
      } else {
        await commentAPI.create(formData);
      }
      setShowForm(false);
      setEditingComment(null);
      setFormData({ content: '', author: '', post: '' });
      loadComments();
    } catch (error) {
      console.error('Error saving comment:', error);
    }
  };

  const handleEdit = (comment) => {
    setEditingComment(comment);
    setFormData({
      content: comment.content,
      author: comment.author._id || comment.author,
      post: comment.post._id || comment.post
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await commentAPI.delete(id);
        loadComments();
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await commentAPI.toggleStatus(id);
      loadComments();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  return (
    <div className="container">
      <h2>Comments</h2>
      <div className="header-actions">
        <input
          type="text"
          placeholder="Search comments..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="search-input"
        />
        <select
          value={filterPost}
          onChange={(e) => {
            setFilterPost(e.target.value);
            setCurrentPage(1);
          }}
          className="filter-select"
        >
          <option value="">All Posts</option>
          {posts.map(post => (
            <option key={post._id} value={post._id}>{post.title}</option>
          ))}
        </select>
        <button onClick={() => {
          setShowForm(true);
          setEditingComment(null);
          setFormData({ content: '', author: '', post: '' });
        }}>Add Comment</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form">
          <textarea
            placeholder="Content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            required
            rows="5"
          />
          <Select
            className="selectpicker"
            classNamePrefix="select"
            value={users.find(u => u._id === formData.author) ? { value: formData.author, label: users.find(u => u._id === formData.author)?.name } : null}
            onChange={selected =>
              setFormData({ ...formData, author: selected ? selected.value : '' })
            }
            options={users.map(user => ({
              value: user._id,
              label: user.name
            }))}
            placeholder="Select Author"
            isClearable
            isSearchable
          />
          <Select
            className="selectpicker"
            classNamePrefix="select"
            value={
              posts.find(p => p._id === formData.post)
                ? { value: formData.post, label: posts.find(p => p._id === formData.post)?.title }
                : null
            }
            onChange={selected =>
              setFormData({ ...formData, post: selected ? selected.value : '' })
            }
            options={posts.map(post => ({
              value: post._id,
              label: post.title
            }))}
            placeholder="Select Post"
            isClearable
            isSearchable
            required
          />
          <div className="form-actions">
            <button type="submit">{editingComment ? 'Update' : 'Create'}</button>
            <button type="button" onClick={() => {
              setShowForm(false);
              setEditingComment(null);
            }}>Cancel</button>
          </div>
        </form>
      )}

      <table className="table">
        <thead>
          <tr>
            <th>Content</th>
            <th>Author</th>
            <th>Post</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {comments.map(comment => (
            <tr key={comment._id}>
              <td className="content-cell">{comment.content}</td>
              <td>{comment.author?.name || 'N/A'}</td>
              <td>{comment.post?.title || 'N/A'}</td>
              <td>
                <span className={`status ${comment.isActive ? 'active' : 'inactive'}`}>
                  {comment.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>{new Date(comment.createdAt).toLocaleDateString()}</td>
              <td>
                <button onClick={() => handleEdit(comment)} className="btn-edit">Edit</button>
                <button onClick={() => handleToggleStatus(comment._id)} className="btn-toggle">
                  {comment.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => handleDelete(comment._id)} className="btn-delete">Delete</button>
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

export default Comments;
