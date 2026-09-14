import {
  useEffect,
  useState,
} from "react"
import {
  ArrowLeft,
  Package,
  UserRound,
  X,
} from "lucide-react"
import {
  useNavigate,
  useParams,
} from "react-router-dom"

import {
  deliverSale,
  getSale,
} from "../services/sales_api"

function SaleDetail() {
  const navigate = useNavigate()
  const { saleId } = useParams()

  const [sale, setSale] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [showDelivery, setShowDelivery] =
    useState(false)

  const [deliveryQuantities, setDeliveryQuantities] =
    useState({})

  const [deliveryLines, setDeliveryLines] =
    useState([])

  const [delivering, setDelivering] =
    useState(false)

  const [deliveryError, setDeliveryError] =
    useState("")

  useEffect(() => {
    loadSale()
  }, [saleId])

  async function loadSale() {
    try {
      setLoading(true)
      setError("")

      const data = await getSale(saleId)

      setSale(data)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  function getPaymentLabel(status) {
    if (status === "paid") {
      return "Paid"
    }

    if (status === "partially_paid") {
      return "Partially paid"
    }

    return "Unpaid"
  }

  function getDeliveryLabel(status) {
    if (status === "delivered") {
      return "Delivered"
    }

    if (status === "partially_delivered") {
      return "Partially delivered"
    }

    return "Awaiting delivery"
  }

  function getRemainingQuantity(line) {
    return (
      Number(line.quantity || 0) -
      Number(line.delivered_quantity || 0)
    )
  }

  function hasUndeliveredItems() {
    return (
      sale?.lines?.some(
        (line) =>
          getRemainingQuantity(line) > 0
      ) ?? false
    )
  }

  function openDelivery() {
    if (!sale) {
      return
    }

    const undeliveredLines =
      sale.lines.filter(
        (line) =>
          getRemainingQuantity(line) > 0
      )

    const quantities = {}

    undeliveredLines.forEach((line) => {
      quantities[line.id] =
        getRemainingQuantity(line)
    })

    setDeliveryLines(undeliveredLines)
    setDeliveryQuantities(quantities)
    setDeliveryError("")
    setShowDelivery(true)
  }

  function closeDelivery() {
    if (delivering) {
      return
    }

    setShowDelivery(false)
    setDeliveryError("")
  }

  function removeDeliveryLine(lineId) {
    setDeliveryLines((current) =>
      current.filter(
        (line) => line.id !== lineId
      )
    )

    setDeliveryQuantities((current) => {
      const updated = {
        ...current,
      }

      delete updated[lineId]

      return updated
    })
  }

  function handleDeliveryQuantityChange(
    lineId,
    value
  ) {
    setDeliveryQuantities(
      (current) => ({
        ...current,
        [lineId]: value,
      })
    )
  }

  function getSelectedDeliveryLines() {
    return deliveryLines
      .map((line) => {
        const quantity = Number(
          deliveryQuantities[line.id] || 0
        )

        if (
          !Number.isInteger(quantity) ||
          quantity < 1
        ) {
          return null
        }

        return {
          line_id: line.id,
          quantity,
        }
      })
      .filter(Boolean)
  }

  function validateDelivery() {
    if (!sale) {
      return "Sale details are unavailable."
    }

    if (sale.payment_status !== "paid") {
      return (
        "The sale must be fully paid before items can be delivered."
      )
    }

    const selectedLines =
      getSelectedDeliveryLines()

    if (selectedLines.length === 0) {
      return "Select at least one item to deliver."
    }

    for (const selectedLine of selectedLines) {
      const saleLine = sale.lines.find(
        (line) =>
          line.id === selectedLine.line_id
      )

      if (!saleLine) {
        return "One of the selected items could not be found."
      }

      const remaining =
        getRemainingQuantity(saleLine)

      if (
        selectedLine.quantity > remaining
      ) {
        return `Only ${remaining} unit(s) remain for ${saleLine.product_name}.`
      }
    }

    return ""
  }

  async function handleDelivery() {
    setDeliveryError("")

    const validationError =
      validateDelivery()

    if (validationError) {
      setDeliveryError(validationError)
      return
    }

    try {
      setDelivering(true)

      const selectedLines =
        getSelectedDeliveryLines()

      const updatedSale =
        await deliverSale(
          sale.id,
          {
            lines: selectedLines,
          }
        )

      setSale(updatedSale)
      setShowDelivery(false)
      setDeliveryQuantities({})
      setDeliveryLines([])
    } catch (error) {
      setDeliveryError(error.message)
    } finally {
      setDelivering(false)
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

          <h5>Loading sale...</h5>

          <p>
            Getting the purchase details.
          </p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="page-content">
        <div className="page-heading">
          <button
            className="back-button"
            onClick={() =>
              navigate("/sales")
            }
          >
            <ArrowLeft
              size={17}
              strokeWidth={2}
            />
            Back to Sales
          </button>
        </div>

        <div className="empty-state">
          <div className="empty-state-icon">
            !
          </div>

          <h5>
            Unable to load sale
          </h5>

          <p>{error}</p>

          <button
            className="secondary-button"
            onClick={loadSale}
          >
            Try again
          </button>
        </div>
      </section>
    )
  }

  if (!sale) {
    return null
  }

  return (
    <section className="page-content">
      <div className="page-heading">
        <div>
          <button
            className="back-button"
            onClick={() =>
              navigate("/sales")
            }
          >
            <ArrowLeft
              size={17}
              strokeWidth={2}
            />
            Back to Sales
          </button>

          <p className="eyebrow">
            Transaction
          </p>

          <h3>{sale.student_name}</h3>

          <p className="page-description">
            {sale.student_number}
          </p>
        </div>

        {hasUndeliveredItems() &&
          sale.payment_status === "paid" && (
            <button
              className="primary-button"
              onClick={openDelivery}
            >
              <Package
                size={16}
                strokeWidth={2}
              />
              Deliver Items
            </button>
          )}
      </div>

      <div className="sale-detail-overview">
        <article className="content-card">
          <div className="sale-detail-student">
            <div className="student-avatar sale-detail-avatar">
              <UserRound
                size={21}
                strokeWidth={2}
              />
            </div>

            <div className="sale-detail-student-info">
              <span>Student</span>

              <strong>
                {sale.student_name}
              </strong>

              <small>
                {sale.student_number}
              </small>
            </div>
          </div>
        </article>

        <article className="content-card">
          <div className="sale-detail-status">
            <div>
              <span>Payment</span>

              <strong
                className={`status-pill ${sale.payment_status}`}
              >
                {getPaymentLabel(
                  sale.payment_status
                )}
              </strong>
            </div>

            <div>
              <span>Delivery</span>

              <strong
                className={`delivery-pill ${sale.delivery_status}`}
              >
                {getDeliveryLabel(
                  sale.delivery_status
                )}
              </strong>
            </div>
          </div>
        </article>
      </div>

      <article className="content-card">
        <div className="content-card-header">
          <div>
            <h4>Purchased Items</h4>

            <p>
              Products included in this purchase.
            </p>
          </div>

          <span className="status-badge">
            {sale.lines?.length ?? 0}{" "}
            {(sale.lines?.length ?? 0) === 1
              ? "item"
              : "items"}
          </span>
        </div>

        {sale.lines?.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Package
                size={22}
                strokeWidth={2}
              />
            </div>

            <h5>No purchased items</h5>

            <p>
              This sale does not have any items.
            </p>
          </div>
        ) : (
          <div className="purchased-items-grid">
            {sale.lines.map((line) => {
              const lineTotal =
                Number(line.unit_price || 0) *
                Number(line.quantity || 0)

              const remaining =
                getRemainingQuantity(line)

              return (
                <div
                  className="purchased-item"
                  key={line.id}
                >
                  <div className="purchased-item-top">
                    <div className="purchased-item-icon">
                      <Package
                        size={18}
                        strokeWidth={2}
                      />
                    </div>

                    <div className="purchased-item-name">
                      <strong>
                        {line.product_name}
                      </strong>

                      {line.product_variant_size && (
                        <span>
                          Size{" "}
                          {line.product_variant_size}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="purchased-item-stats">
                    <div>
                      <span>Quantity</span>

                      <strong>
                        {line.quantity}
                      </strong>
                    </div>

                    <div>
                      <span>Unit price</span>

                      <strong>
                        GHS{" "}
                        {Number(
                          line.unit_price || 0
                        ).toFixed(2)}
                      </strong>
                    </div>

                    <div>
                      <span>Total</span>

                      <strong>
                        GHS{" "}
                        {lineTotal.toFixed(2)}
                      </strong>
                    </div>
                  </div>

                  <div className="purchased-item-delivery">
                    <span>
                      Delivered
                    </span>

                    <strong>
                      {line.delivered_quantity} /{" "}
                      {line.quantity}
                    </strong>
                  </div>

                  {remaining > 0 && (
                    <div className="purchased-item-remaining">
                      <span>
                        Remaining
                      </span>

                      <strong>
                        {remaining}
                      </strong>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </article>

      <article className="content-card">
        <div className="content-card-header">
          <div>
            <h4>Sale Summary</h4>

            <p>
              Payment and transaction totals.
            </p>
          </div>
        </div>

        <div className="sale-summary-grid">
          <div>
            <span>Sale total</span>

            <strong>
              GHS{" "}
              {Number(
                sale.total || 0
              ).toFixed(2)}
            </strong>
          </div>

          <div>
            <span>Paid</span>

            <strong>
              GHS{" "}
              {Number(
                sale.paid_amount || 0
              ).toFixed(2)}
            </strong>
          </div>

          <div>
            <span>Outstanding</span>

            <strong>
              GHS{" "}
              {Number(
                sale.outstanding_amount || 0
              ).toFixed(2)}
            </strong>
          </div>
        </div>
      </article>

      {showDelivery && (
        <div className="delivery-overlay">
          <div className="delivery-modal">
            <div className="delivery-modal-header">
              <div>
                <p className="eyebrow">
                  Delivery
                </p>

                <h4>
                  Deliver Items
                </h4>

                <p>
                  Select the quantities being handed
                  over to the student.
                </p>
              </div>

              <button
                type="button"
                className="delivery-modal-close"
                onClick={closeDelivery}
                disabled={delivering}
                title="Close"
              >
                <X
                  size={18}
                  strokeWidth={2}
                />
              </button>
            </div>

            {deliveryLines.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Package
                    size={22}
                    strokeWidth={2}
                  />
                </div>

                <h5>
                  No items selected
                </h5>

                <p>
                  Add an item to the delivery before
                  confirming.
                </p>
              </div>
            ) : (
              <div className="delivery-lines">
                {deliveryLines.map(
                  (line) => {
                    const remaining =
                      getRemainingQuantity(
                        line
                      )

                    const selectedQuantity =
                      deliveryQuantities[
                        line.id
                      ] ?? remaining

                    return (
                      <div
                        className="delivery-line"
                        key={line.id}
                      >
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
                                {
                                  line.product_variant_size
                                }
                              </span>
                            )}

                            <small>
                              {remaining}{" "}
                              {remaining === 1
                                ? "unit"
                                : "units"}{" "}
                              remaining
                            </small>
                          </div>
                        </div>

                        <div className="delivery-line-actions">
                          <div className="delivery-quantity">
                            <label
                              htmlFor={`delivery-${line.id}`}
                            >
                              Deliver
                            </label>

                            <input
                              id={`delivery-${line.id}`}
                              type="number"
                              min="0"
                              max={remaining}
                              step="1"
                              value={
                                selectedQuantity
                              }
                              onChange={(
                                event
                              ) =>
                                handleDeliveryQuantityChange(
                                  line.id,
                                  event.target
                                    .value
                                )
                              }
                            />
                          </div>

                          <button
                            type="button"
                            className="delivery-remove-button"
                            onClick={() =>
                              removeDeliveryLine(
                                line.id
                              )
                            }
                            disabled={
                              delivering
                            }
                          >
                            <X
                              size={15}
                              strokeWidth={2}
                            />
                            Remove
                          </button>
                        </div>
                      </div>
                    )
                  }
                )}
              </div>
            )}

            {deliveryError && (
              <div className="form-error">
                {deliveryError}
              </div>
            )}

            <div className="delivery-modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={closeDelivery}
                disabled={delivering}
              >
                Cancel
              </button>

              <button
                type="button"
                className="primary-button"
                onClick={handleDelivery}
                disabled={
                  delivering ||
                  deliveryLines.length === 0
                }
              >
                {delivering
                  ? "Recording delivery..."
                  : "Confirm Delivery"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default SaleDetail