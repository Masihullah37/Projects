import { useState, useEffect } from "react";
import { Users, Package, Tool, DollarSign, TrendingUp, Clock } from "react-feather";
import styles from "../styles/AdminDashboard.module.css";

function AdminDashboard() {
  const [stats, setStats] = useState({
    total_users: 0,
    total_products: 0,
    total_repairs: 0,
    pending_repairs: 0,
    total_revenue: 0,
    recent_orders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/Backend/admin_routes.php?action=get_dashboard_stats', {
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.total_users,
      icon: Users,
      color: "#3b82f6",
      bgColor: "#dbeafe"
    },
    {
      title: "Total Products",
      value: stats.total_products,
      icon: Package,
      color: "#10b981",
      bgColor: "#d1fae5"
    },
    {
      title: "Total Repairs",
      value: stats.total_repairs,
      icon: Tool,
      color: "#f59e0b",
      bgColor: "#fef3c7"
    },
    {
      title: "Pending Repairs",
      value: stats.pending_repairs,
      icon: Clock,
      color: "#ef4444",
      bgColor: "#fee2e2"
    },
    {
      title: "Total Revenue",
      value: `€${parseFloat(stats.total_revenue).toFixed(2)}`,
      icon: DollarSign,
      color: "#8b5cf6",
      bgColor: "#ede9fe"
    },
    {
      title: "Recent Orders",
      value: stats.recent_orders,
      icon: TrendingUp,
      color: "#06b6d4",
      bgColor: "#cffafe"
    }
  ];

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardHeader}>
        <h1>Dashboard Overview</h1>
        <p>Welcome to the admin panel. Here's what's happening with your business.</p>
      </div>

      <div className={styles.statsGrid}>
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className={styles.statCard}>
              <div className={styles.statIcon} style={{ backgroundColor: card.bgColor }}>
                <Icon size={24} style={{ color: card.color }} />
              </div>
              <div className={styles.statContent}>
                <h3>{card.value}</h3>
                <p>{card.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.quickActions}>
        <h2>Quick Actions</h2>
        <div className={styles.actionGrid}>
          <div className={styles.actionCard}>
            <Package size={32} />
            <h3>Add New Product</h3>
            <p>Add a new product to your catalog</p>
            <button onClick={() => window.location.href = '/admin/products'}>
              Go to Products
            </button>
          </div>
          
          <div className={styles.actionCard}>
            <Users size={32} />
            <h3>Manage Users</h3>
            <p>View and manage user accounts</p>
            <button onClick={() => window.location.href = '/admin/users'}>
              Go to Users
            </button>
          </div>
          
          <div className={styles.actionCard}>
            <Tool size={32} />
            <h3>Check Repairs</h3>
            <p>Review and update repair requests</p>
            <button onClick={() => window.location.href = '/admin/repairs'}>
              Go to Repairs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;