import { useEffect, useMemo, useState } from "react"
import {
  ArrowLeft,
  Boxes,
  Package,
  Receipt,
} from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"

import {
  getProducts,
  getProductVariants,
} from "../services/products_api"

import {
  getSellers,
} from "../services/sellers_api"

import {
  getStockReceipt,
} from "../services/stock_api"

function StockReceiptDetail() {
  const navigate = useNavigate()
  const { receiptId } = useParams()

  const [receipt, setReceipt] = useState(null)
  const [sellers, setSellers] = useState([])
  const [products, setProducts] = useState([])
  const [variants, setVariants] = useState({})

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadReceipt()
  }, [receiptId])

  async function loadReceipt() {
    try {
      setLoading(true)
      setError("")

      const [
        receiptData,
        sellersData,
        productsData,
      ] = await Promise.all([
        getStockReceipt(receiptId),
        getSellers(),
        getProducts(),
      ])

      setReceipt(receiptData)
      setSellers(sellersData)
      setProducts(productsData)

      const productIds = new Set()

      receiptData.lines?.forEach((line) => {
        if (
          line.product &&
          line.product_variant
        ) {
          productIds.add(line.product)
        }
      })

      const variantResults = await Promise.all(
        Array.from(productIds).map(
          async (productId) => {
            const data =
              await getProductVariants(
                productId
              )

            return {
              productId,
              variants: data,
            }
          }
        )
      )

      const variantMap = {}

      variantResults.forEach(
        ({ variants }) => {
          variants.forEach((variant) => {
            variantMap[variant.id] = variant
          })
        }
      )

      setVariants(variantMap)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const sellerMap = useMemo(() => {
    return Object.fromEntries(
      sellers.map((seller) => [
        seller.id,
        seller,
      ])
    )
  }, [sellers])

  const productMap = useMemo(() => {
    return Object.fromEntries(
      products.map((product) => [
        product.id,
        product,
      ])
    )
  }, [products])

  function getSellerName(sellerId) {
    return (
      sellerMap[sellerId]?.name ||
      "Unknown seller"
    )
  }

  function getProductName(productId) {
    return (
      productMap[productId]?.name ||
      "Unknown product"
    )
  }

  function getVariantName(variantId) {
    return (
      variants[variantId]?.size ||
      "—"
    )
  }

  function getSourceLabel(source) {
    if (source === "owner_supplied") {
      return "Owner supplied"
    }

    if (source === "purchased_on_behalf") {
      return "Purchased on behalf"
    }

    return source || "—"
  }

  function formatDate(dateValue) {
    if (!dateValue) {
      return "—"
    }

    const date = new Date(dateValue)

    if (Number.isNaN(date.getTime())) {
      return "—"
    }

    return date.toLocaleDateString(
      undefined,
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    )
  }

  function formatTime(dateValue) {
    if (!dateValue) {
      return ""
    }

    const date = new Date(dateValue)

    if (Number.isNaN(date.getTime())) {
      return ""
    }

    return date.toLocaleTimeString(
      undefined,
      {
        hour: "numeric",
        minute: "2-digit",
      }
    )
  }

  function getTotalUnits() {
    return (receipt?.lines || []).reduce(
      (total, line) =>
        total + Number(line.quantity || 0),
      0
    )
  }

  function getTotalCost() {
    return (receipt?.lines || []).reduce(
      (total, line) =>
        total +
        Number(line.quantity || 0) *
          Number(line.unit_cost || 0),
      0
    )
  }

  function formatCurrency(value) {
    return Number(value || 0).toLocaleString(
      undefined,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )
  }

  if (loading) {
    return (
      <section className="page-content">
        <div className="empty-state">
          <div className="empty-state-icon">
            <Receipt
              size={22}
              strokeWidth={2}
            />
          </div>

          <h5>
            Loading stock receipt...
          </h5>

          <p>
            Getting the receipt details from the
            server.
          </p>
        </div>
      </section>
    )
  }

  if (error || !receipt) {
    return (
      <section className="page-content">
        <button
          className="back-button"
          onClick={() =>
            navigate("/stock-receipts")
          }
        >
          <ArrowLeft
            size={16}
            strokeWidth={2}
          />

          Stock Receipts
        </button>

        <div className="empty-state">
          <div className="empty-state-icon">
            !
          </div>

          <h5>
            Unable to load stock receipt
          </h5>

          <p>
            {error ||
              "The stock receipt could not be found."}
          </p>

          <button
            className="secondary-button"
            onClick={loadReceipt}
          >
            Try again
          </button>
        </div>
      </section>
    )
  }

  const lines = receipt.lines || []
  const totalUnits = getTotalUnits()
  const totalCost = getTotalCost()

  return (
    <section className="page-content">
      <button
        className="back-button"
        onClick={() =>
          navigate("/stock-receipts")
        }
      >
        <ArrowLeft
          size={16}
          strokeWidth={2}
        />

        Stock Receipts
      </button>

      <div className="page-heading">
        <div>
          <p className="eyebrow">
            Inventory management
          </p>

          <h3>Stock Receipt</h3>

          <p className="page-description">
            Details of stock received into the
            business.
          </p>
        </div>
      </div>

      <div className="stock-receipt-detail-card">
        <div className="stock-receipt-detail-header">
          <div className="stock-receipt-detail-icon">
            <Receipt
              size={22}
              strokeWidth={2}
            />
          </div>

          <div>
            <h4>
              {getSellerName(
                receipt.seller
              )}
            </h4>

            <p>
              {formatDate(
                receipt.received_at
              )}

              {" · "}

              {formatTime(
                receipt.received_at
              )}
            </p>
          </div>
        </div>

        <div className="stock-receipt-meta">
          <div>
            <span>Seller</span>

            <strong>
              {getSellerName(
                receipt.seller
              )}
            </strong>
          </div>

          <div>
            <span>Source</span>

            <strong>
              {getSourceLabel(
                receipt.source
              )}
            </strong>
          </div>

          <div>
            <span>Received</span>

            <strong>
              {formatDate(
                receipt.received_at
              )}
            </strong>
          </div>

          <div>
            <span>Time</span>

            <strong>
              {formatTime(
                receipt.received_at
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

      <div className="stock-list-card">
        <div className="stock-receipt-items-header">
          <div>
            <h4>Received items</h4>

            <p>
              Products included in this stock
              receipt.
            </p>
          </div>

          <div className="stock-receipt-items-summary">
            <span>
              {lines.length}{" "}
              {lines.length === 1
                ? "line"
                : "lines"}
            </span>

            <strong>
              {totalUnits} units
            </strong>
          </div>
        </div>

        {lines.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Package
                size={22}
                strokeWidth={2}
              />
            </div>

            <h5>
              No items received yet
            </h5>

            <p>
              This receipt does not contain any
              stock items.
            </p>
          </div>
        ) : (
          <div className="stock-list">
            <div className="stock-list-header stock-receipt-lines-header">
              <span>Product</span>
              <span>Size</span>
              <span>Quantity</span>
              <span>Unit cost</span>
              <span>Total</span>
            </div>

            {lines.map((line) => {
              const quantity =
                Number(line.quantity || 0)

              const unitCost =
                Number(line.unit_cost || 0)

              const lineTotal =
                quantity * unitCost

              return (
                <div
                  className="stock-receipt-line-row"
                  key={line.id}
                >
                  <div className="stock-product">
                    <div className="stock-product-icon">
                      <Package
                        size={18}
                        strokeWidth={2}
                      />
                    </div>

                    <strong>
                      {getProductName(
                        line.product
                      )}
                    </strong>
                  </div>

                  <span>
                    {getVariantName(
                      line.product_variant
                    )}
                  </span>

                  <strong>
                    {quantity}
                  </strong>

                  <span>
                    GHS{" "}
                    {formatCurrency(
                      unitCost
                    )}
                  </span>

                  <strong>
                    GHS{" "}
                    {formatCurrency(
                      lineTotal
                    )}
                  </strong>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {lines.length > 0 && (
        <div className="stock-receipt-summary">
          <div>
            <span>Total units</span>

            <strong>
              {totalUnits}
            </strong>
          </div>

          <div>
            <span>Stock cost basis</span>

            <strong>
              GHS{" "}
              {formatCurrency(
                totalCost
              )}
            </strong>
          </div>
        </div>
      )}
    </section>
  )
}

export default StockReceiptDetail