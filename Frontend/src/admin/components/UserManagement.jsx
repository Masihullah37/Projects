import { useState, useEffect } from "react";
import { Search, UserX, Shield, Trash2, Eye, EyeOff } from "react-feather";
import { toast } from "react-toastify";
import styles from "../styles/UserManagement.module.css";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    username: "",
    email: "",
    password: ""
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user =>
      user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.telephone.includes(searchTerm)
    );
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/Backend/admin_routes.php?action=get_users', {
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (result.success) {
        setUsers(result.data.users);
      } else {
        toast.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
      
      // Get CSRF token
      const csrfResponse = await fetch('/Backend/admin_routes.php?action=get_csrf', {
        credentials: 'include'
      });
      const csrfData = await csrfResponse.json();
      const csrfToken = csrfData.data.csrf_token;

      const response = await fetch('/Backend/admin_routes.php?action=toggle_user_status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        credentials: 'include',
        body: JSON.stringify({
          user_id: userId,
          status: newStatus
        })
      });

      const result = await response.json();
      
      if (result.success && result.data.success) {
        toast.success(result.data.message);
        fetchUsers(); // Refresh the list
      } else {
        toast.error(result.data.message || "Failed to update user status");
      }
    } catch (error) {
      console.error("Failed to toggle user status:", error);
      toast.error("Failed to update user status");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      // Get CSRF token
      const csrfResponse = await fetch('/Backend/admin_routes.php?action=get_csrf', {
        credentials: 'include'
      });
      const csrfData = await csrfResponse.json();
      const csrfToken = csrfData.data.csrf_token;

      const response = await fetch(`/Backend/admin_routes.php?action=delete_user&user_id=${userId}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-Token': csrfToken
        },
        credentials: 'include'
      });

      const result = await response.json();
      
      if (result.success && result.data.success) {
        toast.success(result.data.message);
        fetchUsers(); // Refresh the list
      } else {
        toast.error(result.data.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user");
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    
    if (!newAdmin.username || !newAdmin.email || !newAdmin.password) {
      toast.error("All fields are required");
      return;
    }

    try {
      // Get CSRF token
      const csrfResponse = await fetch('/Backend/admin_routes.php?action=get_csrf', {
        credentials: 'include'
      });
      const csrfData = await csrfResponse.json();
      const csrfToken = csrfData.data.csrf_token;

      const response = await fetch('/Backend/admin_routes.php?action=create_admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        credentials: 'include',
        body: JSON.stringify(newAdmin)
      });

      const result = await response.json();
      
      if (result.success && result.data.success) {
        toast.success(result.data.message);
        setNewAdmin({ username: "", email: "", password: "" });
        setShowCreateForm(false);
      } else {
        toast.error(result.data.message || "Failed to create admin");
      }
    } catch (error) {
      console.error("Failed to create admin:", error);
      toast.error("Failed to create admin");
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className={styles.userManagement}>
      <div className={styles.pageHeader}>
        <h1>User Management</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className={styles.createButton}
        >
          <Shield size={18} />
          Create Admin
        </button>
      </div>

      {showCreateForm && (
        <div className={styles.createAdminForm}>
          <h3>Create New Admin Account</h3>
          <form onSubmit={handleCreateAdmin}>
            <div className={styles.formRow}>
              <input
                type="text"
                placeholder="Username"
                value={newAdmin.username}
                onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={newAdmin.email}
                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={newAdmin.password}
                onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                required
              />
            </div>
            <div className={styles.formActions}>
              <button type="submit" className={styles.submitButton}>
                Create Admin
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.searchContainer}>
        <div className={styles.searchBox}>
          <Search size={20} />
          <input
            type="text"
            placeholder="Search users by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.usersTable}>
        <div className={styles.tableHeader}>
          <div>Name</div>
          <div>Email</div>
          <div>Phone</div>
          <div>Status</div>
          <div>Created</div>
          <div>Actions</div>
        </div>

        <div className={styles.tableBody}>
          {filteredUsers.map((user) => (
            <div key={user.id} className={styles.tableRow}>
              <div className={styles.userName}>
                {user.nom} {user.prenom}
              </div>
              <div className={styles.userEmail}>{user.email}</div>
              <div className={styles.userPhone}>{user.telephone}</div>
              <div className={styles.userStatus}>
                <span className={`${styles.statusBadge} ${user.status === 'active' ? styles.active : styles.blocked}`}>
                  {user.status || 'active'}
                </span>
              </div>
              <div className={styles.userDate}>
                {new Date(user.created_at).toLocaleDateString()}
              </div>
              <div className={styles.userActions}>
                <button
                  onClick={() => handleToggleUserStatus(user.id, user.status || 'active')}
                  className={`${styles.actionButton} ${user.status === 'active' ? styles.blockButton : styles.unblockButton}`}
                  title={user.status === 'active' ? 'Block User' : 'Unblock User'}
                >
                  {user.status === 'active' ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                  title="Delete User"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredUsers.length === 0 && !loading && (
        <div className={styles.emptyState}>
          <Users size={48} />
          <h3>No users found</h3>
          <p>No users match your search criteria.</p>
        </div>
      )}
    </div>
  );
}

export default UserManagement;