import { useEffect, useState } from "react"
import {
  ArrowLeft,
  Check,
  Package,
  Pencil,
  Plus,
  Power,
  Ruler,
  X,
} from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"

import {
  activateProductVariant,
  createProductVariant,
  deactivateProductVariant,
  getProduct,
  getProductVariants,
  updateProduct,
} from "../services/products_api"

function ProductDetail() {
  const { productId } = useParams()
  const navigate = useNavigate()

  const [product, setProduct] = useState(null)
  const [variants, setVariants] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [showVariantForm, setShowVariantForm] =
    useState(false)

  const [variantSize, setVariantSize] =
    useState("")

  const [savingVariant, setSavingVariant] =
    useState(false)

  const [variantError, setVariantError] =
    useState("")

  const [changingVariant, setChangingVariant] =
    useState("")

  const [showEditForm, setShowEditForm] =
    useState(false)

  const [savingProduct, setSavingProduct] =
    useState(false)

  const [productFormError, setProductFormError] =
    useState("")

  const [productFormData, setProductFormData] =
    useState({
      name: "",
      cost_price: "",
      selling_price: "",
      required: true,
      required_quantity: "1",
    })

  useEffect(() => {
    loadProduct()
  }, [productId])

  async function loadProduct() {
    try {
      setLoading(true)
      setError("")

      const [productData, variantData] =
        await Promise.all([
          getProduct(productId),
          getProductVariants(productId),
        ])

      setProduct(productData)
      setVariants(variantData)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  function openVariantForm() {
    setVariantSize("")
    setVariantError("")
    setShowVariantForm(true)
  }

  function closeVariantForm() {
    if (savingVariant) {
      return
    }

    setShowVariantForm(false)
    setVariantError("")
  }

  async function handleCreateVariant(event) {
    event.preventDefault()

    setVariantError("")

    const size = variantSize.trim()

    if (!size) {
      setVariantError(
        "Size is required."
      )
      return
    }

    try {
      setSavingVariant(true)

      await createProductVariant(
        productId,
        {
          size,
        }
      )

      setShowVariantForm(false)
      setVariantSize("")

      const updatedVariants =
        await getProductVariants(
          productId
        )

      setVariants(updatedVariants)
    } catch (error) {
      setVariantError(error.message)
    } finally {
      setSavingVariant(false)
    }
  }

  async function handleVariantStatus(
    variant
  ) {
    try {
      setChangingVariant(variant.id)

      if (variant.is_active) {
        await deactivateProductVariant(
          productId,
          variant.id
        )
      } else {
        await activateProductVariant(
          productId,
          variant.id
        )
      }

      const updatedVariants =
        await getProductVariants(
          productId
        )

      setVariants(updatedVariants)
    } catch (error) {
      setVariantError(error.message)
    } finally {
      setChangingVariant("")
    }
  }

  function openEditForm() {
    setProductFormError("")

    setProductFormData({
      name: product.name,
      cost_price: product.cost_price,
      selling_price: product.selling_price,
      required: product.required,
      required_quantity:
        product.required_quantity,
    })

    setShowEditForm(true)
  }

  function closeEditForm() {
    if (savingProduct) {
      return
    }

    setShowEditForm(false)
    setProductFormError("")
  }

  function handleProductInputChange(event) {
    const { name, value } = event.target

    setProductFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function handleProductRequiredChange(event) {
    setProductFormData((current) => ({
      ...current,
      required: event.target.checked,
    }))
  }

  async function handleUpdateProduct(event) {
    event.preventDefault()

    setProductFormError("")

    if (!productFormData.name.trim()) {
      setProductFormError(
        "Product name is required."
      )
      return
    }

    if (productFormData.cost_price === "") {
      setProductFormError(
        "Cost price is required."
      )
      return
    }

    if (productFormData.selling_price === "") {
      setProductFormError(
        "Selling price is required."
      )
      return
    }

    if (Number(productFormData.cost_price) < 0) {
      setProductFormError(
        "Cost price cannot be negative."
      )
      return
    }

    if (
      Number(productFormData.selling_price) < 0
    ) {
      setProductFormError(
        "Selling price cannot be negative."
      )
      return
    }

    if (
      productFormData.required &&
      Number(
        productFormData.required_quantity
      ) < 1
    ) {
      setProductFormError(
        "Required quantity must be at least 1."
      )
      return
    }

    try {
      setSavingProduct(true)

      const updatedProduct =
        await updateProduct(
          productId,
          {
            name: productFormData.name.trim(),
            cost_price:
              productFormData.cost_price,
            selling_price:
              productFormData.selling_price,
            required:
              productFormData.required,
            required_quantity: Number(
              productFormData.required_quantity
            ),
          }
        )

      setProduct(updatedProduct)
      setShowEditForm(false)
    } catch (error) {
      setProductFormError(error.message)
    } finally {
      setSavingProduct(false)
    }
  }

  if (loading) {
    return (
      <section className="page-content">
        <div className="empty-state">
          <div className="empty-state-icon">
            <Package
              size={22}
              strokeWidth={2}
            />
          </div>

          <h5>
            Loading product...
          </h5>

          <p>
            Getting the product information.
          </p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="page-content">
        <div className="empty-state">
          <div className="empty-state-icon">
            !
          </div>

          <h5>
            Unable to load product
          </h5>

          <p>{error}</p>

          <button
            className="secondary-button"
            onClick={() =>
              navigate("/products")
            }
          >
            <ArrowLeft
              size={17}
              strokeWidth={2}
            />

            Back to Products
          </button>
        </div>
      </section>
    )
  }

  if (!product) {
    return null
  }

  return (
    <section className="page-content">
      <div className="page-heading">
        <div>
          <button
            className="back-button"
            onClick={() =>
              navigate("/products")
            }
          >
            <ArrowLeft
              size={17}
              strokeWidth={2}
            />

            Back to Products
          </button>

          <p className="eyebrow">
            Product
          </p>

          <div className="product-detail-title">
            <div className="product-detail-icon">
              <Package
                size={22}
                strokeWidth={2}
              />
            </div>

            <div>
              <h3>{product.name}</h3>

              <p className="page-description">
                {product.required
                  ? `Required · ${product.required_quantity} ${
                      product.required_quantity === 1
                        ? "unit"
                        : "units"
                    }`
                  : "Optional product"}
              </p>
            </div>
          </div>
        </div>

        <div className="product-detail-actions">
          <button
            className="secondary-button"
            onClick={openEditForm}
          >
            <Pencil
              size={16}
              strokeWidth={2}
            />

            Edit Product
          </button>

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
      </div>

      <div className="product-detail-summary">
        <article className="detail-summary-card">
          <span>Cost price</span>

          <strong>
            GHS {product.cost_price}
          </strong>

          <p>
            Seller cost per unit
          </p>
        </article>

        <article className="detail-summary-card">
          <span>Selling price</span>

          <strong>
            GHS {product.selling_price}
          </strong>

          <p>
            Customer price per unit
          </p>
        </article>

        <article className="detail-summary-card">
          <span>Required quantity</span>

          <strong>
            {product.required_quantity}
          </strong>

          <p>
            Standard student quantity
          </p>
        </article>

        <article className="detail-summary-card">
          <span>Available sizes</span>

          <strong>
            {
              variants.filter(
                (variant) =>
                  variant.is_active
              ).length
            }
          </strong>

          <p>
            Active variants
          </p>
        </article>
      </div>

      <div className="product-detail-grid">
        <article className="content-card">
          <div className="content-card-header">
            <div>
              <h4>Sizes</h4>

              <p>
                Manage the available sizes for
                this product.
              </p>
            </div>

            <button
              className="primary-button"
              onClick={openVariantForm}
            >
              <Plus
                size={17}
                strokeWidth={2.2}
              />

              Add Size
            </button>
          </div>

          {variantError &&
            !showVariantForm && (
              <div className="form-error">
                {variantError}
              </div>
            )}

          {variants.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Ruler
                  size={22}
                  strokeWidth={2}
                />
              </div>

              <h5>
                No sizes added yet
              </h5>

              <p>
                Add the sizes available for this
                product.
              </p>

              <button
                className="primary-button"
                onClick={openVariantForm}
              >
                <Plus
                  size={17}
                  strokeWidth={2.2}
                />

                Add First Size
              </button>
            </div>
          ) : (
            <div className="variant-management-list">
              {variants.map((variant) => (
                <div
                  className="variant-management-row"
                  key={variant.id}
                >
                  <div className="variant-size-icon">
                    <Ruler
                      size={18}
                      strokeWidth={2}
                    />
                  </div>

                  <div className="variant-management-info">
                    <strong>
                      {variant.size}
                    </strong>

                    <span>
                      {variant.is_active
                        ? "Available for sale"
                        : "Inactive"}
                    </span>
                  </div>

                  <span
                    className={
                      variant.is_active
                        ? "status-pill active"
                        : "status-pill inactive"
                    }
                  >
                    {variant.is_active
                      ? "Active"
                      : "Inactive"}
                  </span>

                  <button
                    className="variant-status-button"
                    onClick={() =>
                      handleVariantStatus(
                        variant
                      )
                    }
                    disabled={
                      changingVariant ===
                      variant.id
                    }
                  >
                    {variant.is_active ? (
                      <>
                        <Power
                          size={15}
                          strokeWidth={2}
                        />

                        Deactivate
                      </>
                    ) : (
                      <>
                        <Check
                          size={15}
                          strokeWidth={2}
                        />

                        Activate
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="content-card">
          <div className="content-card-header">
            <div>
              <h4>Product information</h4>

              <p>
                Current product configuration.
              </p>
            </div>
          </div>

          <div className="product-information">
            <div className="information-row">
              <span>Product name</span>

              <strong>
                {product.name}
              </strong>
            </div>

            <div className="information-row">
              <span>Required</span>

              <strong>
                {product.required
                  ? "Yes"
                  : "No"}
              </strong>
            </div>

            <div className="information-row">
              <span>Required quantity</span>

              <strong>
                {product.required_quantity}
              </strong>
            </div>

            <div className="information-row">
              <span>Cost price</span>

              <strong>
                GHS {product.cost_price}
              </strong>
            </div>

            <div className="information-row">
              <span>Selling price</span>

              <strong>
                GHS {product.selling_price}
              </strong>
            </div>
          </div>
        </article>
      </div>

      {showVariantForm && (
        <div
          className="modal-backdrop"
          onMouseDown={closeVariantForm}
        >
          <div
            className="product-modal variant-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <p className="eyebrow">
                  {product.name}
                </p>

                <h4>Add Size</h4>

                <p>
                  Add a size available for this
                  product.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={closeVariantForm}
                disabled={savingVariant}
                title="Close"
              >
                <X
                  size={19}
                  strokeWidth={2}
                />
              </button>
            </div>

            <form
              className="product-form"
              onSubmit={
                handleCreateVariant
              }
            >
              <div className="form-field">
                <label htmlFor="variant-size">
                  Size
                </label>

                <input
                  id="variant-size"
                  type="text"
                  value={variantSize}
                  onChange={(event) =>
                    setVariantSize(
                      event.target.value
                    )
                  }
                  placeholder="e.g. 32"
                  autoFocus
                />

                <small>
                  Enter the exact size as you
                  want it displayed.
                </small>
              </div>

              {variantError && (
                <div className="form-error">
                  {variantError}
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={
                    closeVariantForm
                  }
                  disabled={savingVariant}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={savingVariant}
                >
                  {savingVariant
                    ? "Adding..."
                    : "Add Size"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditForm && (
        <div
          className="modal-backdrop"
          onMouseDown={closeEditForm}
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
                  Product settings
                </p>

                <h4>Edit Product</h4>

                <p>
                  Update the product information.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={closeEditForm}
                disabled={savingProduct}
                title="Close"
              >
                <X
                  size={19}
                  strokeWidth={2}
                />
              </button>
            </div>

            <form
              className="product-form"
              onSubmit={
                handleUpdateProduct
              }
            >
              <div className="form-field">
                <label htmlFor="edit-product-name">
                  Product name
                </label>

                <input
                  id="edit-product-name"
                  name="name"
                  type="text"
                  value={
                    productFormData.name
                  }
                  onChange={
                    handleProductInputChange
                  }
                  autoFocus
                />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="edit-cost-price">
                    Cost price
                  </label>

                  <div className="price-input">
                    <span>GHS</span>

                    <input
                      id="edit-cost-price"
                      name="cost_price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        productFormData.cost_price
                      }
                      onChange={
                        handleProductInputChange
                      }
                    />
                  </div>

                  <small>
                    Amount owed to the seller per
                    unit.
                  </small>
                </div>

                <div className="form-field">
                  <label htmlFor="edit-selling-price">
                    Selling price
                  </label>

                  <div className="price-input">
                    <span>GHS</span>

                    <input
                      id="edit-selling-price"
                      name="selling_price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        productFormData.selling_price
                      }
                      onChange={
                        handleProductInputChange
                      }
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
                    htmlFor="edit-required-product"
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
                    id="edit-required-product"
                    type="checkbox"
                    checked={
                      productFormData.required
                    }
                    onChange={
                      handleProductRequiredChange
                    }
                  />

                  <span className="toggle-track">
                    <span className="toggle-thumb" />
                  </span>
                </label>
              </div>

              {productFormData.required && (
                <div className="form-field">
                  <label htmlFor="edit-required-quantity">
                    Required quantity
                  </label>

                  <input
                    id="edit-required-quantity"
                    name="required_quantity"
                    type="number"
                    min="1"
                    step="1"
                    value={
                      productFormData.required_quantity
                    }
                    onChange={
                      handleProductInputChange
                    }
                  />

                  <small>
                    Recommended number of units a
                    student should have.
                  </small>
                </div>
              )}

              {productFormError && (
                <div className="form-error">
                  {productFormError}
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeEditForm}
                  disabled={savingProduct}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={savingProduct}
                >
                  {savingProduct
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

export default ProductDetail