import { useEffect, useState } from "react"
import {
  Package,
  Plus,
  Search,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import {
  createProduct,
  getProducts,
} from "../services/products_api"

function Products() {
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    cost_price: "",
    selling_price: "",
    required: true,
    required_quantity: "1",
  })

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    try {
      setLoading(true)
      setError("")

      const data = await getProducts()

      setProducts(data)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  function openForm() {
    setFormError("")

    setFormData({
      name: "",
      cost_price: "",
      selling_price: "",
      required: true,
      required_quantity: "1",
    })

    setShowForm(true)
  }

  function closeForm() {
    if (saving) {
      return
    }

    setShowForm(false)
    setFormError("")
  }

  function handleInputChange(event) {
    const { name, value } = event.target

    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function handleRequiredChange(event) {
    setFormData((current) => ({
      ...current,
      required: event.target.checked,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setFormError("")

    if (!formData.name.trim()) {
      setFormError(
        "Product name is required."
      )
      return
    }

    if (formData.cost_price === "") {
      setFormError(
        "Cost price is required."
      )
      return
    }

    if (formData.selling_price === "") {
      setFormError(
        "Selling price is required."
      )
      return
    }

    if (Number(formData.cost_price) < 0) {
      setFormError(
        "Cost price cannot be negative."
      )
      return
    }

    if (Number(formData.selling_price) < 0) {
      setFormError(
        "Selling price cannot be negative."
      )
      return
    }

    if (
      formData.required &&
      Number(formData.required_quantity) < 1
    ) {
      setFormError(
        "Required quantity must be at least 1."
      )
      return
    }

    try {
      setSaving(true)

      await createProduct({
        name: formData.name.trim(),
        cost_price: formData.cost_price,
        selling_price: formData.selling_price,
        required: formData.required,
        required_quantity: Number(
          formData.required_quantity
        ),
      })

      setShowForm(false)

      await loadProducts()
    } catch (error) {
      setFormError(error.message)
    } finally {
      setSaving(false)
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  )

  return (
    <section className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            Inventory setup
          </p>

          <h3>Products</h3>

          <p className="page-description">
            Manage the uniform items you sell.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={openForm}
        >
          <Plus
            size={17}
            strokeWidth={2.2}
          />

          New Product
        </button>
      </div>

      <div className="products-toolbar">
        <div className="products-search">
          <Search
            size={18}
            strokeWidth={2}
          />

          <input
            type="text"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
            placeholder="Search products..."
          />
        </div>

        {!loading && !error && (
          <span className="products-count">
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1
              ? "product"
              : "products"}
          </span>
        )}
      </div>

      <div className="products-list-card">
        {loading && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Package
                size={22}
                strokeWidth={2}
              />
            </div>

            <h5>Loading products...</h5>

            <p>
              Getting the latest products from the
              server.
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="empty-state">
            <div className="empty-state-icon">
              !
            </div>

            <h5>
              Unable to load products
            </h5>

            <p>{error}</p>

            <button
              className="secondary-button"
              onClick={loadProducts}
            >
              Try again
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          filteredProducts.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Package
                  size={22}
                  strokeWidth={2}
                />
              </div>

              <h5>
                {searchTerm
                  ? "No products found"
                  : "No products yet"}
              </h5>

              <p>
                {searchTerm
                  ? "Try another product name."
                  : "Create your first product to start managing inventory."}
              </p>

              {!searchTerm && (
                <button
                  className="primary-button"
                  onClick={openForm}
                >
                  <Plus
                    size={17}
                    strokeWidth={2.2}
                  />

                  Create Product
                </button>
              )}
            </div>
          )}

        {!loading &&
          !error &&
          filteredProducts.length > 0 && (
            <div className="products-list">
              {filteredProducts.map((product) => (
                <button
                  className="product-row product-row-button"
                  key={product.id}
                  onClick={() =>
                    navigate(
                      `/products/${product.id}`
                    )
                  }
                >
                  <div className="product-main">
                    <div className="product-icon">
                      <Package
                        size={19}
                        strokeWidth={2}
                      />
                    </div>

                    <div>
                      <strong>
                        {product.name}
                      </strong>

                      <span>
                        {product.required
                          ? `Required · ${product.required_quantity} ${
                              product.required_quantity === 1
                                ? "unit"
                                : "units"
                            }`
                          : "Optional"}
                      </span>
                    </div>
                  </div>

                  <div className="product-price">
                    <span>Cost price</span>

                    <strong>
                      GHS {product.cost_price}
                    </strong>
                  </div>

                  <div className="product-price">
                    <span>Selling price</span>

                    <strong>
                      GHS {product.selling_price}
                    </strong>
                  </div>

                  <div className="product-variants">
                    <span>Sizes</span>

                    {product.variants?.length > 0 ? (
                      <div className="variant-list">
                        {product.variants.map(
                          (variant) => (
                            <span
                              className={
                                variant.is_active
                                  ? "variant-badge"
                                  : "variant-badge inactive"
                              }
                              key={variant.id}
                            >
                              {variant.size}
                            </span>
                          )
                        )}
                      </div>
                    ) : (
                      <strong>
                        No sizes
                      </strong>
                    )}
                  </div>

                  <div className="product-status">
                    <span
                      className={
                        product.is_active
                          ? "status-pill active"
                          : "status-pill inactive"
                      }
                    >
                      {product.is_active
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
      </div>

      {showForm && (
        <div
          className="modal-backdrop"
          onMouseDown={closeForm}
        >
          <div
            className="product-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <p className="eyebrow">
                  Inventory setup
                </p>

                <h4>New Product</h4>

                <p>
                  Add an item that you sell.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={closeForm}
                disabled={saving}
                title="Close"
              >
                ×
              </button>
            </div>

            <form
              className="product-form"
              onSubmit={handleSubmit}
            >
              <div className="form-field">
                <label htmlFor="product-name">
                  Product name
                </label>

                <input
                  id="product-name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. School Shirt"
                  autoFocus
                />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="cost-price">
                    Cost price
                  </label>

                  <div className="price-input">
                    <span>GHS</span>

                    <input
                      id="cost-price"
                      name="cost_price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.cost_price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                    />
                  </div>

                  <small>
                    Amount owed to the seller per
                    unit.
                  </small>
                </div>

                <div className="form-field">
                  <label htmlFor="selling-price">
                    Selling price
                  </label>

                  <div className="price-input">
                    <span>GHS</span>

                    <input
                      id="selling-price"
                      name="selling_price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        formData.selling_price
                      }
                      onChange={handleInputChange}
                      placeholder="0.00"
                    />
                  </div>

                  <small>
                    Amount charged to the student.
                  </small>
                </div>
              </div>

              <div className="required-field">
                <div>
                  <label
                    htmlFor="required-product"
                    className="required-label"
                  >
                    Required product
                  </label>

                  <p>
                    Mark this if students are
                    expected to have this item.
                  </p>
                </div>

                <label className="toggle">
                  <input
                    id="required-product"
                    type="checkbox"
                    checked={formData.required}
                    onChange={
                      handleRequiredChange
                    }
                  />

                  <span className="toggle-track">
                    <span className="toggle-thumb" />
                  </span>
                </label>
              </div>

              {formData.required && (
                <div className="form-field">
                  <label htmlFor="required-quantity">
                    Required quantity
                  </label>

                  <input
                    id="required-quantity"
                    name="required_quantity"
                    type="number"
                    min="1"
                    step="1"
                    value={
                      formData.required_quantity
                    }
                    onChange={handleInputChange}
                  />

                  <small>
                    Recommended number of units a
                    student should have.
                  </small>
                </div>
              )}

              {formError && (
                <div className="form-error">
                  {formError}
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Creating..."
                    : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

export default Products