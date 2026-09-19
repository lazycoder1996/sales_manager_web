import {
  useEffect,
  useState,
} from "react"
import { Package, X } from "lucide-react"

import {
  getProductVariants,
} from "../services/sales_api"

import {
  updateSaleLine,
} from "../services/sales_api"

function EditVariant({
  sale,
  line,
  onClose,
  onSuccess,
}) {
  const [variants, setVariants] =
    useState([])

  const [selectedVariant, setSelectedVariant] =
    useState("")

  const [loadingVariants, setLoadingVariants] =
    useState(true)

  const [updatingVariant, setUpdatingVariant] =
    useState(false)

  const [error, setError] =
    useState("")

  useEffect(() => {
    loadVariants()
  }, [line])

  async function loadVariants() {
    if (!line) {
      return
    }

    try {
      setLoadingVariants(true)
      setError("")

      const response =
        await getProductVariants(
          line.product
        )

      const availableVariants =
        Array.isArray(response)
          ? response.filter(
            (variant) =>
              variant.is_active !== false
          )
          : []

      setVariants(availableVariants)

      setSelectedVariant(
        line.product_variant
          ? String(line.product_variant)
          : ""
      )
    } catch (error) {
      setError(error.message)
    } finally {
      setLoadingVariants(false)
    }
  }

  async function handleSubmit() {
    if (!line) {
      return
    }

    if (
      Number(line.delivered_quantity || 0) >
      0
    ) {
      setError(
        "Mark the delivered quantity as undelivered before changing the variant."
      )
      return
    }

    try {
      setUpdatingVariant(true)
      setError("")

      const updatedSaleLine =
        await updateSaleLine(
          sale.id,
          line.id,
          {
            product_variant:
              selectedVariant
                ? selectedVariant
                : null,
          }
        )

      onSuccess(updatedSaleLine)
    } catch (error) {
      setError(error.message)
    } finally {
      setUpdatingVariant(false)
    }
  }

  return (
    <div className="delivery-overlay">
      <div className="delivery-modal additional-purchase-modal">
        <div className="delivery-modal-header">
          <div>
            <p className="eyebrow">
              Product Variant
            </p>

            <h4>
              Edit Variant
            </h4>

            <p>
              Change the variant for{" "}
              {line?.product_name}.
            </p>
          </div>

          <button
            type="button"
            className="delivery-modal-close"
            onClick={onClose}
            disabled={updatingVariant}
            title="Close"
          >
            <X
              size={18}
              strokeWidth={2}
            />
          </button>
        </div>

        {loadingVariants ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Package
                size={22}
                strokeWidth={2}
              />
            </div>

            <h5>
              Loading variants...
            </h5>

            <p>
              Getting the available product
              variants.
            </p>
          </div>
        ) : variants.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Package
                size={22}
                strokeWidth={2}
              />
            </div>

            <h5>
              No active variants
            </h5>

            <p>
              There are no active variants
              available for this product.
            </p>
          </div>
        ) : (
          <div className="additional-purchase-fields">
            <div className="form-field">
              <label htmlFor="edit-product-variant">
                Size
              </label>

              <select
                id="edit-product-variant"
                value={selectedVariant}
                onChange={(event) =>
                  setSelectedVariant(
                    event.target.value
                  )
                }
                disabled={updatingVariant}
              >
                <option value="">
                  No variant
                </option>

                {variants.map(
                  (variant) => (
                    <option
                      key={variant.id}
                      value={variant.id}
                    >
                      Size {variant.size}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
        )}

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <div className="delivery-modal-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onClose}
            disabled={updatingVariant}
          >
            Cancel
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={handleSubmit}
            disabled={
              updatingVariant ||
              loadingVariants
            }
          >
            {updatingVariant
              ? "Saving..."
              : "Save Variant"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditVariant