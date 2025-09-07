import { useState, useEffect } from "react";
import { Search, Tool, Send, Clock, CheckCircle, AlertCircle } from "react-feather";
import { toast } from "react-toastify";
import styles from "../styles/RepairManagement.module.css";

function RepairManagement() {
  const [repairs, setRepairs] = useState([]);
  const [filteredRepairs, setFilteredRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState({
    status: "",
    notes: ""
  });

  useEffect(() => {
    fetchRepairs();
  }, []);

  useEffect(() => {
    const filtered = repairs.filter(repair =>
      repair.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repair.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repair.marque.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repair.modele.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRepairs(filtered);
  }, [repairs, searchTerm]);

  const fetchRepairs = async () => {
    try {
      const response = await fetch('/Backend/admin_routes.php?action=get_repairs', {
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (result.success) {
        setRepairs(result.data.repairs);
      } else {
        toast.error("Failed to fetch repairs");
      }
    } catch (error) {
      console.error("Failed to fetch repairs:", error);
      toast.error("Failed to fetch repairs");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    
    if (!statusUpdate.status) {
      toast.error("Please select a status");
      return;
    }

    try {
      // Get CSRF token
      const csrfResponse = await fetch('/Backend/admin_routes.php?action=get_csrf', {
        credentials: 'include'
      });
      const csrfData = await csrfResponse.json();
      const csrfToken = csrfData.data.csrf_token;

      const response = await fetch('/Backend/admin_routes.php?action=update_repair_status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        credentials: 'include',
        body: JSON.stringify({
          repair_id: selectedRepair.id,
          status: statusUpdate.status,
          notes: statusUpdate.notes
        })
      });

      const result = await response.json();
      
      if (result.success && result.data.success) {
        toast.success(result.data.message);
        setSelectedRepair(null);
        setStatusUpdate({ status: "", notes: "" });
        fetchRepairs();
      } else {
        toast.error(result.data.message || "Failed to update repair status");
      }
    } catch (error) {
      console.error("Failed to update repair status:", error);
      toast.error("Failed to update repair status");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'en_attente':
        return <Clock size={16} className={styles.statusIconPending} />;
      case 'en_cours':
        return <AlertCircle size={16} className={styles.statusIconProgress} />;
      case 'termine':
        return <CheckCircle size={16} className={styles.statusIconCompleted} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'en_attente':
        return 'Pending';
      case 'en_cours':
        return 'In Progress';
      case 'termine':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading repairs...</p>
      </div>
    );
  }

  return (
    <div className={styles.repairManagement}>
      <div className={styles.pageHeader}>
        <h1>Repair Management</h1>
        <div className={styles.statsBar}>
          <div className={styles.statItem}>
            <span>Total: {repairs.length}</span>
          </div>
          <div className={styles.statItem}>
            <span>Pending: {repairs.filter(r => r.statut === 'en_attente').length}</span>
          </div>
          <div className={styles.statItem}>
            <span>In Progress: {repairs.filter(r => r.statut === 'en_cours').length}</span>
          </div>
          <div className={styles.statItem}>
            <span>Completed: {repairs.filter(r => r.statut === 'termine').length}</span>
          </div>
        </div>
      </div>

      <div className={styles.searchContainer}>
        <div className={styles.searchBox}>
          <Search size={20} />
          <input
            type="text"
            placeholder="Search repairs by name, email, brand, or model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.repairsGrid}>
        {filteredRepairs.map((repair) => (
          <div key={repair.id} className={styles.repairCard}>
            <div className={styles.repairHeader}>
              <div className={styles.repairId}>#{repair.id}</div>
              <div className={styles.repairStatus}>
                {getStatusIcon(repair.statut)}
                <span>{getStatusLabel(repair.statut)}</span>
              </div>
            </div>
            
            <div className={styles.repairInfo}>
              <h3>{repair.nom}</h3>
              <p className={styles.repairContact}>
                <strong>Email:</strong> {repair.email}<br />
                <strong>Phone:</strong> {repair.telephone}
              </p>
              <p className={styles.repairDevice}>
                <strong>Device:</strong> {repair.marque} {repair.modele}
              </p>
              <p className={styles.repairProblem}>
                <strong>Problem:</strong> {repair.probleme}
              </p>
              {repair.services && (
                <p className={styles.repairServices}>
                  <strong>Services:</strong> {repair.services}
                </p>
              )}
              <p className={styles.repairDate}>
                <strong>Created:</strong> {new Date(repair.created_at).toLocaleDateString()}
              </p>
            </div>
            
            <div className={styles.repairActions}>
              <button
                onClick={() => setSelectedRepair(repair)}
                className={styles.updateButton}
              >
                <Send size={16} />
                Update Status
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedRepair && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Update Repair Status</h3>
            <p><strong>Repair:</strong> {selectedRepair.marque} {selectedRepair.modele} for {selectedRepair.nom}</p>
            
            <form onSubmit={handleStatusUpdate}>
              <div className={styles.formGroup}>
                <label>Status *</label>
                <select
                  value={statusUpdate.status}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                  required
                >
                  <option value="">Select status</option>
                  <option value="en_attente">Pending</option>
                  <option value="en_cours">In Progress</option>
                  <option value="termine">Completed</option>
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label>Notes (optional)</label>
                <textarea
                  value={statusUpdate.notes}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, notes: e.target.value })}
                  placeholder="Add any notes for the customer..."
                  rows="4"
                />
              </div>
              
              <div className={styles.modalActions}>
                <button type="submit" className={styles.submitButton}>
                  Update & Notify Customer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRepair(null);
                    setStatusUpdate({ status: "", notes: "" });
                  }}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {filteredRepairs.length === 0 && !loading && (
        <div className={styles.emptyState}>
          <Tool size={48} />
          <h3>No repairs found</h3>
          <p>No repairs match your search criteria.</p>
        </div>
      )}
    </div>
  );
}

export default RepairManagement;