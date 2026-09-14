import {
  useEffect,
  useMemo,
  useState,
} from "react"
import { Package, Plus, X } from "lucide-react"

import {
  getProducts,
} from "../services/products_api"

import {
  createAdditionalPurchase,
} from "../services/sales_api"

function AdditionalPurchaseModal({
  sale,
  onClose,
  onSuccess,
}) {
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] =
    useState(true)

  const [lines, setLines] = useState([
    {
      productId: "",
      variantId: "",
      quantity: 1,
    },
  ])

  const [cashAmount, setCashAmount] =
    useState("")

  const [momoAmount, setMomoAmount] =
    useState("")

  const [submitting, setSubmitting] =
    useState(false)

  const [error, setError] = useState("")

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    try {
      setLoadingProducts(true)
      setError("")

      const data = await getProducts()

      setProducts(
        data.filter(
          (product) => product.is_active
        )
      )
    } catch (error) {
      setError(error.message)
    } finally {
      setLoadingProducts(false)
    }
  }

  function getProduct(productId) {
    return products.find(
      (product) =>
        String(product.id) === String(productId)
    )
  }

  function getActiveVariants(product) {
    return (
      product?.variants?.filter(
        (variant) => variant.is_active
      ) ?? []
    )
  }

  function getLinePrice(line) {
    const product = getProduct(
      line.productId
    )

    if (!product) {
      return 0
    }

    return Number(
      product.selling_price || 0
    )
  }

  function getLineTotal(line) {
    return (
      getLinePrice(line) *
      Number(line.quantity || 0)
    )
  }

  const total = useMemo(() => {
    return lines.reduce(
      (sum, line) =>
        sum + getLineTotal(line),
      0
    )
  }, [lines, products])

  const cash = Number(
    cashAmount || 0
  )

  const momo = Number(
    momoAmount || 0
  )

  const paymentTotal = cash + momo

  const paymentDifference =
    total - paymentTotal

  const isPaymentComplete =
    total > 0 &&
    Math.abs(paymentDifference) < 0.001

  function updateLine(
    index,
    field,
    value
  ) {
    setLines((current) =>
      current.map((line, lineIndex) => {
        if (lineIndex !== index) {
          return line
        }

        return {
          ...line,
          [field]: value,
        }
      })
    )
  }

  function handleProductChange(
    index,
    productId
  ) {
    setLines((current) =>
      current.map((line, lineIndex) => {
        if (lineIndex !== index) {
          return line
        }

        return {
          ...line,
          productId,
          variantId: "",
        }
      })
    )
  }

  function addLine() {
    setLines((current) => [
      ...current,
      {
        productId: "",
        variantId: "",
        quantity: 1,
      },
    ])
  }

  function removeLine(index) {
    setLines((current) =>
      current.filter(
        (_, lineIndex) =>
          lineIndex !== index
      )
    )
  }

  function validate() {
    if (!sale) {
      return "Sale details are unavailable."
    }

    if (lines.length === 0) {
      return "Add at least one item."
    }

    for (const line of lines) {
      if (!line.productId) {
        return "Select a product for every item."
      }

      const product = getProduct(
        line.productId
      )

      if (!product) {
        return "One of the selected products could not be found."
      }

      const variants =
        getActiveVariants(product)

      if (
        variants.length > 0 &&
        !line.variantId
      ) {
        return `Select a size for ${product.name}.`
      }

      if (
        variants.length === 0 &&
        line.variantId
      ) {
        return `The selected product does not have a size.`
      }

      const quantity = Number(
        line.quantity
      )

      if (
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return `Quantity for ${product.name} must be at least 1.`
      }
    }

    if (total <= 0) {
      return "The purchase total must be greater than zero."
    }

    if (!isPaymentComplete) {
      return `Payment must equal the purchase total of GHS ${total.toFixed(2)}.`
    }

    return ""
  }

  async function handleSubmit() {
    setError("")

    const validationError =
      validate()

    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setSubmitting(true)

      const data = await createAdditionalPurchase(
        sale.id,
        {
          lines: lines.map((line) => ({
            product: line.productId,
            product_variant:
              line.variantId || null,
            quantity: Number(
              line.quantity
            ),
          })),
          cash_amount: cash.toFixed(2),
          momo_amount: momo.toFixed(2),
          paid_at:
            new Date().toISOString(),
        }
      )

      onSuccess(data)
    } catch (error) {
      setError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="delivery-overlay">
      <div className="delivery-modal additional-purchase-modal">
        <div className="delivery-modal-header">
          <div>
            <p className="eyebrow">
              Additional Purchase
            </p>

            <h4>
              New Purchase
            </h4>

            <p>
              Add another purchase to this
              student's existing transaction.
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

        <div className="additional-purchase-student">
          <div className="additional-purchase-student-icon">
            <Package
              size={17}
              strokeWidth={2}
            />
          </div>

          <div>
            <strong>
              {sale.student_name}
            </strong>

            <span>
              {sale.student_number}
            </span>
          </div>
        </div>

        {loadingProducts ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Package
                size={22}
                strokeWidth={2}
              />
            </div>

            <h5>
              Loading products...
            </h5>

            <p>
              Getting available products.
            </p>
          </div>
        ) : (
          <>
            <div className="additional-purchase-lines">
              {lines.map(
                (line, index) => {
                  const product =
                    getProduct(
                      line.productId
                    )

                  const variants =
                    getActiveVariants(
                      product
                    )

                  return (
                    <div
                      className="additional-purchase-line"
                      key={index}
                    >
                      <div className="additional-purchase-line-header">
                        <strong>
                          Item {index + 1}
                        </strong>

                        {lines.length > 1 && (
                          <button
                            type="button"
                            className="delivery-remove-button"
                            onClick={() =>
                              removeLine(
                                index
                              )
                            }
                            disabled={
                              submitting
                            }
                          >
                            <X
                              size={15}
                              strokeWidth={2}
                            />
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="additional-purchase-fields">
                        <div className="form-field">
                          <label
                            htmlFor={`purchase-product-${index}`}
                          >
                            Product
                          </label>

                          <select
                            id={`purchase-product-${index}`}
                            value={
                              line.productId
                            }
                            onChange={(
                              event
                            ) =>
                              handleProductChange(
                                index,
                                event.target
                                  .value
                              )
                            }
                            disabled={
                              submitting
                            }
                          >
                            <option value="">
                              Select product
                            </option>

                            {products.map(
                              (product) => (
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

                        {variants.length >
                          0 && (
                          <div className="form-field">
                            <label
                              htmlFor={`purchase-variant-${index}`}
                            >
                              Size
                            </label>

                            <select
                              id={`purchase-variant-${index}`}
                              value={
                                line.variantId
                              }
                              onChange={(
                                event
                              ) =>
                                updateLine(
                                  index,
                                  "variantId",
                                  event.target
                                    .value
                                )
                              }
                              disabled={
                                submitting
                              }
                            >
                              <option value="">
                                Select size
                              </option>

                              {variants.map(
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
                                    Size{" "}
                                    {
                                      variant.size
                                    }
                                  </option>
                                )
                              )}
                            </select>
                          </div>
                        )}

                        <div className="form-field">
                          <label
                            htmlFor={`purchase-quantity-${index}`}
                          >
                            Quantity
                          </label>

                          <input
                            id={`purchase-quantity-${index}`}
                            type="number"
                            min="1"
                            step="1"
                            value={
                              line.quantity
                            }
                            onChange={(
                              event
                            ) =>
                              updateLine(
                                index,
                                "quantity",
                                event.target
                                  .value
                              )
                            }
                            disabled={
                              submitting
                            }
                          />
                        </div>

                        <div className="additional-purchase-line-total">
                          <span>
                            Line total
                          </span>

                          <strong>
                            GHS{" "}
                            {getLineTotal(
                              line
                            ).toFixed(2)}
                          </strong>
                        </div>
                      </div>
                    </div>
                  )
                }
              )}
            </div>

            <button
              type="button"
              className="secondary-button additional-purchase-add-button"
              onClick={addLine}
              disabled={submitting}
            >
              <Plus
                size={16}
                strokeWidth={2}
              />
              Add another item
            </button>

            <div className="additional-purchase-summary">
              <span>
                Purchase total
              </span>

              <strong>
                GHS {total.toFixed(2)}
              </strong>
            </div>

            <div className="additional-purchase-payment">
              <div className="form-field">
                <label htmlFor="purchase-cash">
                  Cash
                </label>

                <input
                  id="purchase-cash"
                  type="number"
                  min="0"
                  step="0.01"
                  value={cashAmount}
                  onChange={(event) =>
                    setCashAmount(
                      event.target.value
                    )
                  }
                  placeholder="0.00"
                  disabled={submitting}
                />
              </div>

              <div className="form-field">
                <label htmlFor="purchase-momo">
                  MoMo
                </label>

                <input
                  id="purchase-momo"
                  type="number"
                  min="0"
                  step="0.01"
                  value={momoAmount}
                  onChange={(event) =>
                    setMomoAmount(
                      event.target.value
                    )
                  }
                  placeholder="0.00"
                  disabled={submitting}
                />
              </div>
            </div>

            <div
              className={`payment-check ${
                isPaymentComplete
                  ? "complete"
                  : paymentTotal > total
                    ? "overpaid"
                    : ""
              }`}
            >
              <span>
                {isPaymentComplete
                  ? "Amount received"
                  : paymentTotal > total
                    ? "Overpayment"
                    : "Remaining"}
              </span>

              <strong>
                GHS{" "}
                {isPaymentComplete
                  ? paymentTotal.toFixed(
                      2
                    )
                  : Math.abs(
                      paymentDifference
                    ).toFixed(2)}
              </strong>
            </div>
          </>
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
            onClick={handleSubmit}
            disabled={
              submitting ||
              loadingProducts ||
              !isPaymentComplete
            }
          >
            {submitting
              ? "Recording purchase..."
              : "Confirm Purchase"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdditionalPurchaseModal