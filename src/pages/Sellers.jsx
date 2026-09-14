import { useEffect, useState } from "react"
import {
  Plus,
  Search,
  Store,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import {
  createSeller,
  getSellers,
} from "../services/sellers_api"

function Sellers() {
  const navigate = useNavigate()

  const [sellers, setSellers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    notes: "",
  })

  useEffect(() => {
    loadSellers()
  }, [])

  async function loadSellers() {
    try {
      setLoading(true)
      setError("")

      const data = await getSellers()

      setSellers(data)
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
      phone: "",
      notes: "",
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

  async function handleSubmit(event) {
    event.preventDefault()

    setFormError("")

    if (!formData.name.trim()) {
      setFormError(
        "Seller name is required."
      )
      return
    }

    try {
      setSaving(true)

      await createSeller({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        notes: formData.notes.trim(),
      })

      setShowForm(false)

      await loadSellers()
    } catch (error) {
      setFormError(error.message)
    } finally {
      setSaving(false)
    }
  }

  const filteredSellers = sellers.filter(
    (seller) => {
      const search = searchTerm
        .toLowerCase()
        .trim()

      if (!search) {
        return true
      }

      return (
        seller.name
          ?.toLowerCase()
          .includes(search) ||
        seller.phone
          ?.toLowerCase()
          .includes(search)
      )
    }
  )

  return (
    <section className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            Supplier management
          </p>

          <h3>Sellers</h3>

          <p className="page-description">
            Manage the people and businesses that
            supply your stock.
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

          New Seller
        </button>
      </div>

      <div className="sellers-toolbar">
        <div className="sellers-search">
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
            placeholder="Search sellers..."
          />
        </div>

        {!loading && !error && (
          <span className="sellers-count">
            {filteredSellers.length}{" "}
            {filteredSellers.length === 1
              ? "seller"
              : "sellers"}
          </span>
        )}
      </div>

      <div className="sellers-list-card">
        {loading && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Store
                size={22}
                strokeWidth={2}
              />
            </div>

            <h5>
              Loading sellers...
            </h5>

            <p>
              Getting the latest sellers from the
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
              Unable to load sellers
            </h5>

            <p>{error}</p>

            <button
              className="secondary-button"
              onClick={loadSellers}
            >
              Try again
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          filteredSellers.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Store
                  size={22}
                  strokeWidth={2}
                />
              </div>

              <h5>
                {searchTerm
                  ? "No sellers found"
                  : "No sellers yet"}
              </h5>

              <p>
                {searchTerm
                  ? "Try another seller name or phone number."
                  : "Add your first seller to start receiving stock."}
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

                  Add First Seller
                </button>
              )}
            </div>
          )}

        {!loading &&
          !error &&
          filteredSellers.length > 0 && (
            <div className="sellers-list">
              {filteredSellers.map((seller) => (
                <button
                  className="seller-row"
                  key={seller.id}
                  onClick={() =>
                    navigate(
                      `/sellers/${seller.id}`
                    )
                  }
                >
                  <div className="seller-main">
                    <div className="seller-icon">
                      <Store
                        size={19}
                        strokeWidth={2}
                      />
                    </div>

                    <div>
                      <strong>
                        {seller.name}
                      </strong>

                      <span>
                        {seller.phone ||
                          "No phone number"}
                      </span>
                    </div>
                  </div>

                  <div className="seller-status">
                    <span
                      className={
                        seller.is_active
                          ? "status-pill active"
                          : "status-pill inactive"
                      }
                    >
                      {seller.is_active
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
            className="product-modal seller-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <p className="eyebrow">
                  Supplier management
                </p>

                <h4>New Seller</h4>

                <p>
                  Add a person or business that
                  supplies your stock.
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
                <label htmlFor="seller-name">
                  Seller name
                </label>

                <input
                  id="seller-name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Adom Uniforms"
                  autoFocus
                />
              </div>

              <div className="form-field">
                <label htmlFor="seller-phone">
                  Phone number
                </label>

                <input
                  id="seller-phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="e.g. 024 123 4567"
                />

                <small>
                  Optional contact number.
                </small>
              </div>

              <div className="form-field">
                <label htmlFor="seller-notes">
                  Notes
                </label>

                <textarea
                  id="seller-notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Optional notes about this seller..."
                  rows="3"
                />
              </div>

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
                    : "Create Seller"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

export default Sellers