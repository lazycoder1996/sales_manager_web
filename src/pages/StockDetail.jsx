import { useEffect, useState } from "react"
import {
  ArrowLeft,
  Boxes,
  Package,
} from "lucide-react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"

import { getStockDetail } from "../services/stock_api"

function StockDetail() {
  const navigate = useNavigate()
  const { productId } = useParams()
  const [searchParams] = useSearchParams()

  const variantId = searchParams.get("variant")

  const [stockDetail, setStockDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadStockDetail()
  }, [productId, variantId])

  async function loadStockDetail() {
    try {
      setLoading(true)
      setError("")

      const data = await getStockDetail(
        productId,
        variantId
      )

      setStockDetail(data)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  function formatDate(dateString) {
    if (!dateString) {
      return "—"
    }

    return new Date(
      dateString
    ).toLocaleString()
  }

  function formatMoney(value) {
    return `GHS ${Number(value || 0).toFixed(2)}`
  }

  if (loading) {
    return (
      <section className="page-content">
        <div className="empty-state">
          <div className="empty-state-icon">
            <Boxes
              size={22}
              strokeWidth={2}
            />
          </div>

          <h5>
            Loading stock details...
          </h5>

          <p>
            Getting inventory history from the server.
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
            className="secondary-button"
            onClick={() => navigate("/stock")}
          >
            <ArrowLeft
              size={16}
              strokeWidth={2}
            />
            Back to Stock
          </button>
        </div>

        <div className="empty-state">
          <div className="empty-state-icon">
            !
          </div>

          <h5>
            Unable to load stock details
          </h5>

          <p>{error}</p>

          <button
            className="secondary-button"
            onClick={loadStockDetail}
          >
            Try again
          </button>
        </div>
      </section>
    )
  }

  if (!stockDetail) {
    return null
  }

  const stock = stockDetail.stock || {}

  return (
    <section className="page-content">
      <div className="page-heading">
        <div>
          <button
            className="back-button"
            onClick={() => navigate("/stock")}
          >
            <ArrowLeft
              size={17}
              strokeWidth={2}
            />
            Back to Stock
          </button>

          <p className="eyebrow">
            Inventory management
          </p>

          <h3>
            {stockDetail.product}
          </h3>

          <p className="page-description">
            {stockDetail.variant
              ? `Size ${stockDetail.variant}`
              : "Product stock details"}
          </p>
        </div>
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
            {stock.available || 0}
          </strong>

          <p>
            Units currently available
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
            {stock.received || 0}
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
            {stock.delivered || 0}
          </strong>

          <p>
            Units delivered to students
          </p>
        </article>
      </div>

      <article className="content-card">
        <div className="content-card-header">
          <div>
            <h4>
              Receipt history
            </h4>

            <p>
              Stock received for this product
              and size.
            </p>
          </div>

          <span className="status-badge">
            {stockDetail.receipts?.length || 0}{" "}
            receipts
          </span>
        </div>

        {!stockDetail.receipts ||
        stockDetail.receipts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Package
                size={22}
                strokeWidth={2}
              />
            </div>

            <h5>
              No receipt history
            </h5>

            <p>
              No stock receipts were found for
              this product.
            </p>
          </div>
        ) : (
          <div className="stock-receipt-list">
            {stockDetail.receipts.map(
              (receipt) => (
                <div
                  className="stock-receipt-card"
                  key={receipt.id}
                >
                  <div className="stock-receipt-header">
                    <div>
                      <strong>
                        {receipt.seller}
                      </strong>

                      <span>
                        {formatDate(
                          receipt.received_at
                        )}
                      </span>
                    </div>

                    <span
                      className={
                        receipt.receipt_payment_status ===
                        "paid"
                          ? "status-pill active"
                          : "status-pill inactive"
                      }
                    >
                      {receipt.receipt_payment_status
                        ?.replaceAll(
                          "_",
                          " "
                        )}
                    </span>
                  </div>

                  <div className="stock-receipt-grid">
                    <div>
                      <span>Quantity</span>
                      <strong>
                        {receipt.quantity}
                      </strong>
                    </div>

                    <div>
                      <span>Unit cost</span>
                      <strong>
                        {formatMoney(
                          receipt.unit_cost
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Receipt total</span>
                      <strong>
                        {formatMoney(
                          receipt.receipt_total
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Paid</span>
                      <strong>
                        {formatMoney(
                          receipt.receipt_paid
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Outstanding</span>
                      <strong>
                        {formatMoney(
                          receipt.receipt_outstanding
                        )}
                      </strong>
                    </div>
                  </div>

                  {receipt.notes && (
                    <div className="stock-receipt-notes">
                      <span>Notes</span>
                      <p>
                        {receipt.notes}
                      </p>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        )}
      </article>
    </section>
  )
}

export default StockDetail