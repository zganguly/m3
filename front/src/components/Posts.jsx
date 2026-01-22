import { useState, useEffect } from 'react';
import { postAPI, userAPI } from '../services/api';
import Select from 'react-select';

function Posts() {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({ title: '', slug: '', content: '', author: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const loggedInUser = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    loadPosts();
    loadUsers();
  }, [currentPage, search]);

  const loadPosts = async () => {
    try {
      const response = await postAPI.getAll(currentPage, search);
      setPosts(response.data.posts);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error loading posts:', error);
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        alert('Only PNG, JPG and JPEG images are allowed');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!editingPost && !imageFile) {
      alert('Image is required');
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('slug', formData.slug);
      submitData.append('content', formData.content);
      submitData.append('author', formData.author);
      
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      if (editingPost) {
        await postAPI.update(editingPost._id, submitData);
      } else {
        await postAPI.create(submitData);
      }
      
      setShowForm(false);
      setEditingPost(null);
      setFormData({ title: '', slug: '', content: '', author: '' });
      setImageFile(null);
      setImagePreview(null);
      loadPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      alert(error.response?.data?.error || 'Error saving post');
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      content: post.content,
      author: post.author._id || post.author
    });
    setImageFile(null);
    setImagePreview(post.image ? `http://localhost:5000/uploads/posts/${post.image}` : null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postAPI.delete(id);
        loadPosts();
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await postAPI.toggleStatus(id);
      loadPosts();
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
      <h2>Posts</h2>
      <div className="header-actions">
        <input
          type="text"
          placeholder="Search posts..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="search-input"
        />
        <button onClick={() => {
          setShowForm(true);
          setEditingPost(null);
          setFormData({ title: '', slug: '', content: '', author: '' });
          setImageFile(null);
          setImagePreview(null);
        }}>Add Post</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form" encType="multipart/form-data">
          <input
            type="text"
            placeholder="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Slug (optional, auto-generated)"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          />
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
          <div className="form-group">
            <label>Image {!editingPost && '(Required)'}</label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleImageChange}
              required={!editingPost}
            />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
          </div>
          <div className="form-actions">
            <button type="submit">{editingPost ? 'Update' : 'Create'}</button>
            <button type="button" onClick={() => {
              setShowForm(false);
              setEditingPost(null);
              setImageFile(null);
              setImagePreview(null);
            }}>Cancel</button>
          </div>
        </form>
      )}

      <table className="table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Title</th>
            <th>Slug</th>
            <th>Author</th>
            <th>Status</th>
            <th>Created By</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map(post => (
            <tr key={post._id}>
              <td>
                {post.image ? (
                  <img 
                    src={`http://localhost:5000/uploads/posts/${post.image}`} 
                    alt={post.title}
                    className="post-image-thumbnail"
                  />
                ) : (
                  <span>No Image</span>
                )}
              </td>
              <td>{post.title}</td>
              <td>{post.slug}</td>
              <td>{post.author?.name || 'N/A'}</td>
              <td>
                <span className={`status ${post.isActive ? 'active' : 'inactive'}`}>
                  {post.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>{post.createdByName || 'N/A'}</td>
              <td>{new Date(post.createdAt).toLocaleDateString()}</td>
              <td>
                {isOwnRecord(post.createdBy) && (
                <>
                <button onClick={() => handleEdit(post)} className="btn-edit">Edit</button>
                <button onClick={() => handleToggleStatus(post._id)} className="btn-toggle">
                  {post.isActive ? 'Deactivate' : 'Activate'}
                </button>
                {!post.isActive ? 
                <button onClick={() => handleDelete(post._id)} className="btn-delete">Delete</button>
                :
                (null)}
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

export default Posts;
