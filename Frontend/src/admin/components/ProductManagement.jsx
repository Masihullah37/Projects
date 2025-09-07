import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Package, Upload } from "react-feather";
import { toast } from "react-toastify";
import styles from "../styles/ProductManagement.module.css";

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    prix: "",
    stock: "",
    image: null
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter(product =>
      product.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredProducts(filtered);
  }, [products, searchTerm]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/Backend/routes.php?action=get_products', {
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (result.success) {
        setProducts(result.data.products || []);
      } else {
        toast.error("Failed to fetch products");
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nom || !formData.prix || !formData.stock) {
      toast.error("Name, price, and stock are required");
      return;
    }

    try {
      // Get CSRF token
      const csrfResponse = await fetch('/Backend/admin_routes.php?action=get_csrf', {
        credentials: 'include'
      });
      const csrfData = await csrfResponse.json();
      const csrfToken = csrfData.data.csrf_token;

      const formDataToSend = new FormData();
      formDataToSend.append('nom', formData.nom);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('prix', formData.prix);
      formDataToSend.append('stock', formData.stock);
      
      if (editingProduct) {
        formDataToSend.append('product_id', editingProduct.id);
      }
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const action = editingProduct ? 'admin_update_product' : 'admin_add_product';
      
      const response = await fetch(`/Backend/admin_routes.php?action=${action}`, {
        method: 'POST',
        headers: {
          'X-CSRF-Token': csrfToken
        },
        credentials: 'include',
        body: formDataToSend
      });

      const result = await response.json();
      
      if (result.success && result.data.success) {
        toast.success(result.data.message);
        setFormData({ nom: "", description: "", prix: "", stock: "", image: null });
        setShowForm(false);
        setEditingProduct(null);
        fetchProducts();
      } else {
        toast.error(result.data.message || "Operation failed");
      }
    } catch (error) {
      console.error("Operation failed:", error);
      toast.error("Operation failed");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      nom: product.nom,
      description: product.description || "",
      prix: product.prix,
      stock: product.stock,
      image: null
    });
    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      // Get CSRF token
      const csrfResponse = await fetch('/Backend/admin_routes.php?action=get_csrf', {
        credentials: 'include'
      });
      const csrfData = await csrfResponse.json();
      const csrfToken = csrfData.data.csrf_token;

      const response = await fetch(`/Backend/admin_routes.php?action=admin_delete_product&product_id=${productId}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-Token': csrfToken
        },
        credentials: 'include'
      });

      const result = await response.json();
      
      if (result.success && result.data.success) {
        toast.success(result.data.message);
        fetchProducts();
      } else {
        toast.error(result.data.message || "Failed to delete product");
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error("Failed to delete product");
    }
  };

  const resetForm = () => {
    setFormData({ nom: "", description: "", prix: "", stock: "", image: null });
    setEditingProduct(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className={styles.productManagement}>
      <div className={styles.pageHeader}>
        <h1>Product Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className={styles.addButton}
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {showForm && (
        <div className={styles.productForm}>
          <h3>{editingProduct ? "Edit Product" : "Add New Product"}</h3>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Product Name *</label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Price (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.prix}
                  onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Stock *</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Product Image</label>
                <div className={styles.fileUpload}>
                  <Upload size={20} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                  />
                  <span>{formData.image ? formData.image.name : "Choose image..."}</span>
                </div>
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="4"
              />
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.submitButton}>
                {editingProduct ? "Update Product" : "Add Product"}
              </button>
              <button type="button" onClick={resetForm} className={styles.cancelButton}>
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
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.productsGrid}>
        {filteredProducts.map((product) => (
          <div key={product.id} className={styles.productCard}>
            <div className={styles.productImage}>
              <img
                src={product.image ? `/images/${product.image}` : '/images/default-product.png'}
                alt={product.nom}
                onError={(e) => {
                  e.target.src = '/images/default-product.png';
                }}
              />
            </div>
            
            <div className={styles.productInfo}>
              <h3>{product.nom}</h3>
              <p className={styles.productDescription}>
                {product.description || "No description available"}
              </p>
              <div className={styles.productMeta}>
                <span className={styles.productPrice}>€{product.prix}</span>
                <span className={`${styles.productStock} ${product.stock < 10 ? styles.lowStock : ""}`}>
                  Stock: {product.stock}
                </span>
              </div>
            </div>
            
            <div className={styles.productActions}>
              <button
                onClick={() => handleEdit(product)}
                className={`${styles.actionButton} ${styles.editButton}`}
                title="Edit Product"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className={`${styles.actionButton} ${styles.deleteButton}`}
                title="Delete Product"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && !loading && (
        <div className={styles.emptyState}>
          <Package size={48} />
          <h3>No products found</h3>
          <p>No products match your search criteria.</p>
        </div>
      )}
    </div>
  );
}

export default ProductManagement;