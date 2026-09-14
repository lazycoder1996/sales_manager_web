import { useEffect, useState } from "react"
import {
  Boxes,
  Package,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import {
  getProducts,
  getProductVariants,
} from "../services/products_api"

import {
  getSellers,
} from "../services/sellers_api"

import {
  createStockReceipt,
  getStockBalance,
} from "../services/stock_api"

function Stock() {
  const navigate = useNavigate()

  const [stock, setStock] = useState([])
  const [searchTerm, setSearchTerm] = useState("")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [showReceiveForm, setShowReceiveForm] =
    useState(false)

  const [sellers, setSellers] = useState([])
  const [products, setProducts] = useState([])

  const [loadingFormData, setLoadingFormData] =
    useState(false)

  const [formError, setFormError] = useState("")
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    seller: "",
    source: "owner_supplied",
    received_at: getCurrentDateTime(),
    notes: "",
  })

  const [lines, setLines] = useState([
    createEmptyLine(),
  ])

  useEffect(() => {
    loadStock()
  }, [])

  async function loadStock() {
    try {
      setLoading(true)
      setError("")

      const data = await getStockBalance()

      setStock(data)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function openReceiveForm() {
    setFormError("")
    setLoadingFormData(true)

    setFormData({
      seller: "",
      source: "owner_supplied",
      received_at: getCurrentDateTime(),
      notes: "",
    })

    setLines([
      createEmptyLine(),
    ])

    setShowReceiveForm(true)

    try {
      const [
        sellersData,
        productsData,
      ] = await Promise.all([
        getSellers(),
        getProducts(),
      ])

      setSellers(
        sellersData.filter(
          (seller) => seller.is_active
        )
      )

      setProducts(
        productsData.filter(
          (product) => product.is_active
        )
      )
    } catch (error) {
      setFormError(error.message)
    } finally {
      setLoadingFormData(false)
    }
  }

  function closeReceiveForm() {
    if (saving) {
      return
    }

    setShowReceiveForm(false)
    setFormError("")
  }

  function handleFormChange(event) {
    const { name, value } = event.target

    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  async function handleProductChange(
    lineIndex,
    productId
  ) {
    updateLine(
      lineIndex,
      "product",
      productId
    )

    updateLine(
      lineIndex,
      "product_variant",
      ""
    )

    if (!productId) {
      updateLine(
        lineIndex,
        "variants",
        []
      )
      return
    }

    try {
      const variants =
        await getProductVariants(
          productId
        )

      updateLine(
        lineIndex,
        "variants",
        variants.filter(
          (variant) =>
            variant.is_active
        )
      )
    } catch (error) {
      setFormError(error.message)
    }
  }

  function updateLine(
    lineIndex,
    field,
    value
  ) {
    setLines((current) =>
      current.map((line, index) =>
        index === lineIndex
          ? {
              ...line,
              [field]: value,
            }
          : line
      )
    )
  }

  function addLine() {
    setLines((current) => [
      ...current,
      createEmptyLine(),
    ])
  }

  function removeLine(lineIndex) {
    if (lines.length === 1) {
      return
    }

    setLines((current) =>
      current.filter(
        (_, index) =>
          index !== lineIndex
      )
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setFormError("")

    if (!formData.seller) {
      setFormError(
        "Please select a seller."
      )
      return
    }

    if (!formData.received_at) {
      setFormError(
        "Received date and time are required."
      )
      return
    }

    if (lines.length === 0) {
      setFormError(
        "Add at least one stock item."
      )
      return
    }

    for (
      let index = 0;
      index < lines.length;
      index += 1
    ) {
      const line = lines[index]

      if (!line.product) {
        setFormError(
          `Please select a product for item ${index + 1}.`
        )
        return
      }

      if (
        line.variants.length > 0 &&
        !line.product_variant
      ) {
        setFormError(
          `Please select a size for item ${index + 1}.`
        )
        return
      }

      if (
        !line.quantity ||
        Number(line.quantity) < 1
      ) {
        setFormError(
          `Enter a valid quantity for item ${index + 1}.`
        )
        return
      }
    }

    const combinations = new Set()

    for (const line of lines) {
      const combination = `${
        line.product
      }-${
        line.product_variant || "none"
      }`

      if (
        combinations.has(combination)
      ) {
        setFormError(
          "The same product and size cannot appear more than once in the same receipt."
        )
        return
      }

      combinations.add(combination)
    }

    try {
      setSaving(true)

      await createStockReceipt({
        seller: formData.seller,
        source: formData.source,
        received_at: new Date(
          formData.received_at
        ).toISOString(),
        notes: formData.notes.trim(),
        lines: lines.map((line) => ({
          product: line.product,
          product_variant:
            line.product_variant || null,
          quantity: Number(
            line.quantity
          ),
        })),
      })

      setShowReceiveForm(false)

      await loadStock()
    } catch (error) {
      setFormError(error.message)
    } finally {
      setSaving(false)
    }
  }

  const filteredStock = stock.filter(
    (item) => {
      const search = searchTerm
        .toLowerCase()
        .trim()

      if (!search) {
        return true
      }

      return (
        item.product
          ?.toLowerCase()
          .includes(search) ||
        item.variant
          ?.toLowerCase()
          .includes(search)
      )
    }
  )

  const totalReceived = stock.reduce(
    (total, item) =>
      total + Number(item.received || 0),
    0
  )

  const totalSold = stock.reduce(
    (total, item) =>
      total + Number(item.sold || 0),
    0
  )

  const totalAvailable = stock.reduce(
    (total, item) =>
      total + Number(item.available || 0),
    0
  )

  return (
    <section className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            Inventory management
          </p>

          <h3>Stock</h3>

          <p className="page-description">
            Track what has been received, delivered,
            and what is currently available.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={openReceiveForm}
        >
          <Plus
            size={17}
            strokeWidth={2.2}
          />

          Receive Stock
        </button>
      </div>

      <div className="summary-grid">
        <article className="summary-card">
          <div className="summary-card-header">
            <span>Available</span>

            <span className="card-icon">
              <Boxes
                size={18}
                strokeWidth={2}
              />
            </span>
          </div>

          <strong>
            {totalAvailable}
          </strong>

          <p>
            Units currently in stock
          </p>
        </article>

        <article className="summary-card">
          <div className="summary-card-header">
            <span>Received</span>

            <span className="card-icon">
              <Package
                size={18}
                strokeWidth={2}
              />
            </span>
          </div>

          <strong>
            {totalReceived}
          </strong>

          <p>
            Total units received
          </p>
        </article>

        <article className="summary-card">
          <div className="summary-card-header">
            <span>Delivered</span>

            <span className="card-icon">
              ↗
            </span>
          </div>

          <strong>
            {totalSold}
          </strong>

          <p>
            Units delivered to students
          </p>
        </article>
      </div>

      <div className="stock-toolbar">
        <div className="stock-search">
          <Search
            size={18}
            strokeWidth={2}
          />

          <input
            type="text"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
            placeholder="Search products or sizes..."
          />
        </div>

        {!loading && !error && (
          <span className="stock-count">
            {filteredStock.length}{" "}
            {filteredStock.length === 1
              ? "item"
              : "items"}
          </span>
        )}
      </div>

      <div className="stock-list-card">
        {loading && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Boxes
                size={22}
                strokeWidth={2}
              />
            </div>

            <h5>
              Loading stock...
            </h5>

            <p>
              Getting the latest inventory from the
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
              Unable to load stock
            </h5>

            <p>{error}</p>

            <button
              className="secondary-button"
              onClick={loadStock}
            >
              Try again
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          filteredStock.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Boxes
                  size={22}
                  strokeWidth={2}
                />
              </div>

              <h5>
                {searchTerm
                  ? "No stock found"
                  : "No stock yet"}
              </h5>

              <p>
                {searchTerm
                  ? "Try another product or size."
                  : "Receive your first stock items to start tracking inventory."}
              </p>

              {!searchTerm && (
                <button
                  className="primary-button"
                  onClick={openReceiveForm}
                >
                  <Plus
                    size={17}
                    strokeWidth={2.2}
                  />

                  Receive First Stock
                </button>
              )}
            </div>
          )}

        {!loading &&
          !error &&
          filteredStock.length > 0 && (
            <div className="stock-list">
              <div className="stock-list-header">
                <span>Product</span>
                <span>Size</span>
                <span>Received</span>
                <span>Delivered</span>
                <span>Available</span>
              </div>

              {filteredStock.map((item) => (
                <button
                  className="stock-row"
                  key={`${item.product_id}-${item.variant_id || "none"}`}
                  onClick={() =>
                    navigate(
                      `/stock/${item.product_id}${
                        item.variant_id
                          ? `?variant=${item.variant_id}`
                          : ""
                      }`
                    )
                  }
                >
                  <div className="stock-product">
                    <div className="stock-product-icon">
                      <Package
                        size={18}
                        strokeWidth={2}
                      />
                    </div>

                    <strong>
                      {item.product}
                    </strong>
                  </div>

                  <span className="stock-size">
                    {item.variant || "—"}
                  </span>

                  <span>
                    {item.received}
                  </span>

                  <span>
                    {item.sold}
                  </span>

                  <strong className="stock-available">
                    {item.available}
                  </strong>
                </button>
              ))}
            </div>
          )}
      </div>

      {showReceiveForm && (
        <div
          className="modal-backdrop"
          onMouseDown={
            closeReceiveForm
          }
        >
          <div
            className="product-modal stock-receive-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <p className="eyebrow">
                  Inventory management
                </p>

                <h4>
                  Receive Stock
                </h4>

                <p>
                  Record stock received from a
                  seller.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={
                  closeReceiveForm
                }
                disabled={saving}
                title="Close"
              >
                <X
                  size={19}
                  strokeWidth={2}
                />
              </button>
            </div>

            {loadingFormData ? (
              <div className="empty-state modal-loading">
                <div className="empty-state-icon">
                  <Boxes
                    size={22}
                    strokeWidth={2}
                  />
                </div>

                <h5>
                  Loading form...
                </h5>

                <p>
                  Getting sellers and products.
                </p>
              </div>
            ) : (
              <form
                className="product-form"
                onSubmit={handleSubmit}
              >
                <div className="form-field">
                  <label htmlFor="stock-seller">
                    Seller
                  </label>

                  <select
                    id="stock-seller"
                    name="seller"
                    value={formData.seller}
                    onChange={
                      handleFormChange
                    }
                  >
                    <option value="">
                      Select seller
                    </option>

                    {sellers.map(
                      (seller) => (
                        <option
                          key={seller.id}
                          value={seller.id}
                        >
                          {seller.name}
                        </option>
                      )
                    )}
                  </select>

                  {sellers.length === 0 && (
                    <small>
                      No active sellers are
                      available.
                    </small>
                  )}
                </div>

                <div className="form-field">
                  <label htmlFor="stock-source">
                    Source
                  </label>

                  <select
                    id="stock-source"
                    name="source"
                    value={formData.source}
                    onChange={
                      handleFormChange
                    }
                  >
                    <option value="owner_supplied">
                      Owner supplied
                    </option>

                    <option value="purchased_on_behalf">
                      Purchased on behalf
                    </option>
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="stock-received-at">
                    Received date and time
                  </label>

                  <input
                    id="stock-received-at"
                    name="received_at"
                    type="datetime-local"
                    value={
                      formData.received_at
                    }
                    onChange={
                      handleFormChange
                    }
                  />
                </div>

                <div className="stock-lines-section">
                  <div className="stock-lines-header">
                    <div>
                      <h5>
                        Stock items
                      </h5>

                      <p>
                        Add each product and size
                        included in this receipt.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="secondary-button additional-purchase-add-button"
                      onClick={addLine}
                    >
                      <Plus
                        size={16}
                        strokeWidth={2.2}
                      />

                      Add item
                    </button>
                  </div>

                  <div className="stock-receive-lines">
                    {lines.map(
                      (
                        line,
                        lineIndex
                      ) => (
                        <div
                          className="stock-receive-line"
                          key={line.id}
                        >
                          <div className="stock-line-number">
                            {lineIndex + 1}
                          </div>

                          <div className="form-field">
                            <label
                              htmlFor={`stock-product-${line.id}`}
                            >
                              Product
                            </label>

                            <select
                              id={`stock-product-${line.id}`}
                              value={
                                line.product
                              }
                              onChange={(
                                event
                              ) =>
                                handleProductChange(
                                  lineIndex,
                                  event
                                    .target
                                    .value
                                )
                              }
                            >
                              <option value="">
                                Select product
                              </option>

                              {products.map(
                                (
                                  product
                                ) => (
                                  <option
                                    key={
                                      product.id
                                    }
                                    value={
                                      product.id
                                    }
                                  >
                                    {
                                      product.name
                                    }
                                  </option>
                                )
                              )}
                            </select>
                          </div>

                          <div className="form-field">
                            <label
                              htmlFor={`stock-variant-${line.id}`}
                            >
                              Size
                            </label>

                            <select
                              id={`stock-variant-${line.id}`}
                              value={
                                line.product_variant
                              }
                              onChange={(
                                event
                              ) =>
                                updateLine(
                                  lineIndex,
                                  "product_variant",
                                  event
                                    .target
                                    .value
                                )
                              }
                              disabled={
                                !line.product ||
                                line.variants
                                  .length ===
                                  0
                              }
                            >
                              <option value="">
                                {line.product &&
                                line.variants
                                  .length ===
                                  0
                                  ? "No sizes"
                                  : "Select size"}
                              </option>

                              {line.variants.map(
                                (
                                  variant
                                ) => (
                                  <option
                                    key={
                                      variant.id
                                    }
                                    value={
                                      variant.id
                                    }
                                  >
                                    {
                                      variant.size
                                    }
                                  </option>
                                )
                              )}
                            </select>
                          </div>

                          <div className="form-field">
                            <label
                              htmlFor={`stock-quantity-${line.id}`}
                            >
                              Quantity
                            </label>

                            <input
                              id={`stock-quantity-${line.id}`}
                              type="number"
                              min="1"
                              value={
                                line.quantity
                              }
                              onChange={(
                                event
                              ) =>
                                updateLine(
                                  lineIndex,
                                  "quantity",
                                  event
                                    .target
                                    .value
                                )
                              }
                              placeholder="0"
                            />
                          </div>

                          <button
                            type="button"
                            className="stock-line-remove"
                            onClick={() =>
                              removeLine(
                                lineIndex
                              )
                            }
                            disabled={
                              lines.length ===
                              1
                            }
                            title="Remove item"
                          >
                            <Trash2
                              size={17}
                              strokeWidth={2}
                            />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="stock-notes">
                    Notes
                  </label>

                  <textarea
                    id="stock-notes"
                    name="notes"
                    value={
                      formData.notes
                    }
                    onChange={
                      handleFormChange
                    }
                    rows="3"
                    placeholder="Optional notes about this receipt..."
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
                    onClick={
                      closeReceiveForm
                    }
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={
                      saving ||
                      loadingFormData
                    }
                  >
                    {saving
                      ? "Receiving..."
                      : "Receive Stock"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

function createEmptyLine() {
  return {
    id: crypto.randomUUID(),
    product: "",
    product_variant: "",
    quantity: "",
    variants: [],
  }
}

function getCurrentDateTime() {
  const now = new Date()

  const year = now.getFullYear()
  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0")
  const day = String(
    now.getDate()
  ).padStart(2, "0")
  const hours = String(
    now.getHours()
  ).padStart(2, "0")
  const minutes = String(
    now.getMinutes()
  ).padStart(2, "0")

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export default Stock