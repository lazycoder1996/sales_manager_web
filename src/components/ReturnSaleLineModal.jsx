import { useState } from "react"
import { Package, X } from "lucide-react"

import {
  returnSaleLine,
} from "../services/sales_api"

function ReturnSaleLineModal({
  sale,
  line,
  onClose,
  onSuccess,
}) {
  const [returnQuantity, setReturnQuantity] =
    useState("")

  const [submitting, setSubmitting] =
    useState(false)

  const [error, setError] = useState("")

  if (!line) {
    return null
  }

  const quantity = Number(
    line.quantity || 0
  )

  const deliveredQuantity = Number(
    line.delivered_quantity || 0
  )

  const pendingQuantity = Math.max(
    quantity - deliveredQuantity,
    0
  )

  const unitPrice = Number(
    line.unit_price || 0
  )

  const returnQuantityValue = Number(
    returnQuantity || 0
  )

  const refundAmount =
    returnQuantityValue * unitPrice

  const isFullReturn =
    returnQuantityValue === quantity

  function validate() {
    if (!returnQuantity.trim()) {
      return "Enter the quantity to return."
    }

    if (
      !Number.isInteger(
        returnQuantityValue
      )
    ) {
      return (
        "Return quantity must be a whole number."
      )
    }

    if (
      returnQuantityValue < 1
    ) {
      return (
        "Return quantity must be at least 1."
      )
    }

    if (
      returnQuantityValue > quantity
    ) {
      return `You can return at most ${quantity} unit(s).`
    }

    return ""
  }

  async function handleReturn() {
    setError("")

    const validationError =
      validate()

    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setSubmitting(true)

      await returnSaleLine(
        sale.id,
        line.id,
        {
          quantity:
            returnQuantityValue,
        }
      )

      onSuccess(line.id)
    } catch (error) {
      setError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="delivery-overlay">
      <div className="delivery-modal">
        <div className="delivery-modal-header">
          <div>
            <p className="eyebrow">
              Return Item
            </p>

            <h4>
              Return Product
            </h4>

            <p>
              Return part or all of this item
              and receive the corresponding
              cash refund.
            </p>
          </div>

          <button
            type="button"
            className="delivery-modal-close"
            onClick={onClose}
            disabled={submitting}
            title="Close"
          >
            <X
              size={18}
              strokeWidth={2}
            />
          </button>
        </div>

        <div className="delivery-lines">
          <div className="delivery-line">
            <div className="delivery-line-info">
              <div className="delivery-line-icon">
                <Package
                  size={17}
                  strokeWidth={2}
                />
              </div>

              <div>
                <strong>
                  {line.product_name}
                </strong>

                {line.product_variant_size && (
                  <span>
                    Size{" "}
                    {line.product_variant_size}
                  </span>
                )}

                <small>
                  {quantity}{" "}
                  {quantity === 1
                    ? "unit"
                    : "units"}{" "}
                  purchased
                </small>
              </div>
            </div>

            <div className="delivery-line-actions">
              <div className="delivery-quantity">
                <label>
                  Unit price
                </label>

                <strong>
                  GHS{" "}
                  {unitPrice.toFixed(2)}
                </strong>
              </div>
            </div>
          </div>
        </div>

        <div className="return-sale-line-details">
          <div>
            <span>
              Purchased
            </span>

            <strong>
              {quantity}
            </strong>
          </div>

          <div>
            <span>
              Delivered
            </span>

            <strong>
              {deliveredQuantity}
            </strong>
          </div>

          <div>
            <span>
              Pending
            </span>

            <strong>
              {pendingQuantity}
            </strong>
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="return-sale-line-quantity">
            Quantity to return
          </label>

          <input
            id="return-sale-line-quantity"
            type="number"
            min="1"
            max={quantity}
            step="1"
            inputMode="numeric"
            value={returnQuantity}
            onChange={(event) => {
              setReturnQuantity(
                event.target.value
              )
              setError("")
            }}
            disabled={submitting}
            placeholder={`1-${quantity}`}
          />
        </div>

        <div className="return-sale-line-warning">
          <span>
            Cash refund
          </span>

          <strong>
            GHS{" "}
            {refundAmount.toFixed(2)}
          </strong>
        </div>

        {returnQuantityValue > 0 &&
          returnQuantityValue <=
            quantity && (
            <div className="return-sale-line-summary">
              <span>
                After return
              </span>

              <strong>
                {quantity -
                  returnQuantityValue}{" "}
                {quantity -
                  returnQuantityValue ===
                1
                  ? "unit"
                  : "units"}{" "}
                remaining
              </strong>
            </div>
          )}

        {returnQuantityValue > 0 &&
          returnQuantityValue <=
            deliveredQuantity && (
            <div className="change-product-replacement-note">
              <span>
                Delivery
              </span>

              <strong>
                {returnQuantityValue} delivered{" "}
                {returnQuantityValue === 1
                  ? "unit"
                  : "units"}{" "}
                will be returned.
              </strong>
            </div>
          )}

        {returnQuantityValue >
          deliveredQuantity &&
          returnQuantityValue <=
            quantity && (
            <div className="change-product-replacement-note">
              <span>
                Delivery
              </span>

              <strong>
                Delivered units will be returned
                first, then pending units.
              </strong>
            </div>
          )}

        {isFullReturn &&
          returnQuantityValue > 0 && (
            <div className="change-product-replacement-note">
              <span>
                Sale line
              </span>

              <strong>
                This item will be completely
                removed from the sale.
              </strong>
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
            disabled={submitting}
          >
            Cancel
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={handleReturn}
            disabled={submitting}
          >
            {submitting
              ? "Processing return..."
              : isFullReturn
                ? "Confirm Full Return"
                : "Confirm Return"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReturnSaleLineModal