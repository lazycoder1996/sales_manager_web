import { useEffect, useMemo, useState } from "react"
import {
  ArrowRight,
  Boxes,
  Package,
  Plus,
  Receipt,
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
  getStockReceipts,
} from "../services/stock_api"

function StockReceipts() {
  const navigate = useNavigate()

  const [receipts, setReceipts] = useState([])
  const [sellers, setSellers] = useState([])
  const [products, setProducts] = useState([])
  const [variants, setVariants] = useState({})

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadReceipts()
  }, [])

  async function loadReceipts() {
    try {
      setLoading(true)
      setError("")

      const [
        receiptsData,
        sellersData,
        productsData,
      ] = await Promise.all([
        getStockReceipts(),
        getSellers(),
        getProducts(),
      ])

      setReceipts(receiptsData)
      setSellers(sellersData)
      setProducts(productsData)

      const productIds = new Set()

      receiptsData.forEach((receipt) => {
        receipt.lines?.forEach((line) => {
          if (
            line.product_variant &&
            line.product
          ) {
            productIds.add(line.product)
          }
        })
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
        ({ productId, variants }) => {
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

  function getTotalUnits(receipt) {
    return (receipt.lines || []).reduce(
      (total, line) =>
        total + Number(line.quantity || 0),
      0
    )
  }

  function getLineCount(receipt) {
    return (receipt.lines || []).length
  }

  const totalReceipts = receipts.length

  const totalUnits = receipts.reduce(
    (total, receipt) =>
      total + getTotalUnits(receipt),
    0
  )

  return (
    <section className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            Inventory management
          </p>

          <h3>Stock Receipts</h3>

          <p className="page-description">
            Track stock received from sellers and
            review each receiving transaction.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() =>
            navigate("/stock")
          }
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
            <span>Receipts</span>

            <span className="card-icon">
              <Receipt
                size={18}
                strokeWidth={2}
              />
            </span>
          </div>

          <strong>
            {totalReceipts}
          </strong>

          <p>
            Stock receiving transactions
          </p>
        </article>

        <article className="summary-card">
          <div className="summary-card-header">
            <span>Units received</span>

            <span className="card-icon">
              <Boxes
                size={18}
                strokeWidth={2}
              />
            </span>
          </div>

          <strong>
            {totalUnits}
          </strong>

          <p>
            Total units across receipts
          </p>
        </article>
      </div>

      <div className="stock-list-card">
        {loading && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Receipt
                size={22}
                strokeWidth={2}
              />
            </div>

            <h5>
              Loading stock receipts...
            </h5>

            <p>
              Getting receiving history from the
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
              Unable to load stock receipts
            </h5>

            <p>{error}</p>

            <button
              className="secondary-button"
              onClick={loadReceipts}
            >
              Try again
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          receipts.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Receipt
                  size={22}
                  strokeWidth={2}
                />
              </div>

              <h5>
                No stock receipts yet
              </h5>

              <p>
                Receive your first stock items to
                start building your receiving history.
              </p>

              <button
                className="primary-button"
                onClick={() =>
                  navigate("/stock")
                }
              >
                <Plus
                  size={17}
                  strokeWidth={2.2}
                />

                Receive First Stock
              </button>
            </div>
          )}

        {!loading &&
          !error &&
          receipts.length > 0 && (
            <div className="stock-list">
              <div className="stock-list-header stock-receipts-list-header">
                <span>Seller</span>
                <span>Source</span>
                <span>Received</span>
                <span>Items</span>
                <span>Units</span>
                <span></span>
              </div>

              {receipts.map((receipt) => {
                const lineCount =
                  getLineCount(receipt)

                const units =
                  getTotalUnits(receipt)

                return (
                  <button
                    className="stock-row stock-receipt-row"
                    key={receipt.id}
                    onClick={() =>
                      navigate(
                        `/stock-receipts/${receipt.id}`
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

                      <div>
                        <strong>
                          {getSellerName(
                            receipt.seller
                          )}
                        </strong>

                        {receipt.notes && (
                          <small className="stock-receipt-note">
                            {receipt.notes}
                          </small>
                        )}
                      </div>
                    </div>

                    <span className="stock-size">
                      {getSourceLabel(
                        receipt.source
                      )}
                    </span>

                    <span className="stock-receipt-date">
                      {formatDate(
                        receipt.received_at
                      )}

                      <small>
                        {formatTime(
                          receipt.received_at
                        )}
                      </small>
                    </span>

                    <span>
                      {lineCount}
                    </span>

                    <strong className="stock-available">
                      {units}
                    </strong>

                    <span className="stock-receipt-arrow">
                      <ArrowRight
                        size={17}
                        strokeWidth={2}
                      />
                    </span>
                  </button>
                )
              })}
            </div>
          )}
      </div>
    </section>
  )
}

export default StockReceipts