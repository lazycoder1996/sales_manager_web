import { useEffect, useState } from "react"
import {
  ArrowRight,
  Boxes,
  Package,
  Plus,
  ShoppingCart,
  Store,
  TrendingUp,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import {
  getDashboard,
  getTodaysSales,
} from "../services/dashboard_api"


function Dashboard() {

    
  const navigate = useNavigate()

  const [dashboard, setDashboard] =
    useState(null)

    const [todaysSales, setTodaysSales] =
  useState(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")

  useEffect(() => {
    loadDashboard()
  }, [])

    async function loadDashboard() {
    try {
        setLoading(true)
        setError("")

        const [dashboardData, todaysSalesData] =
        await Promise.all([
            getDashboard(),
            getTodaysSales(),
        ])

        setDashboard(dashboardData)
        setTodaysSales(todaysSalesData)
    } catch (error) {
        setError(error.message)
    } finally {
        setLoading(false)
    }
    }

  function formatMoney(value) {
    return `GHS ${Number(value || 0).toFixed(2)}`
  }

  function getStockLabel(item) {
    if (item.variant) {
      return `${item.product} · ${item.variant}`
    }

    return item.product
  }

  function getProductRevenue(products) {
    const grouped = {}

    products.forEach((item) => {
      if (!grouped[item.product_id]) {
        grouped[item.product_id] = {
          product_id: item.product_id,
          product: item.product,
          quantity: 0,
          revenue: 0,
        }
      }

      grouped[item.product_id].quantity +=
        Number(item.quantity || 0)

      grouped[item.product_id].revenue +=
        Number(item.revenue || 0)
    })

    return Object.values(grouped).sort(
      (a, b) => b.revenue - a.revenue
    )
  }

  if (loading) {
    return (
      <section className="page-content">
        <div className="page-heading">
          <div>
            <p className="eyebrow">
              Business overview
            </p>

            <h3>Dashboard</h3>

            <p className="page-description">
              Monitor sales, stock, payments, and
              earnings.
            </p>
          </div>
        </div>

        <div className="empty-state">
          <div className="empty-state-icon">
            <TrendingUp
              size={22}
              strokeWidth={2}
            />
          </div>

          <h5>
            Loading dashboard...
          </h5>

          <p>
            Getting the latest business figures.
          </p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="page-content">
        <div className="page-heading">
          <div>
            <p className="eyebrow">
              Business overview
            </p>

            <h3>Dashboard</h3>

            <p className="page-description">
              Monitor sales, stock, payments, and
              earnings.
            </p>
          </div>
        </div>

        <div className="empty-state">
          <div className="empty-state-icon">
            !
          </div>

          <h5>
            Unable to load dashboard
          </h5>

          <p>{error}</p>

          <button
            className="secondary-button"
            onClick={loadDashboard}
          >
            Try again
          </button>
        </div>
      </section>
    )
  }

  if (!dashboard) {
    return null
  }

  const sales = dashboard.sales || {}
  const today = todaysSales || {}
  const payments = dashboard.payments || {}
  const delivery = dashboard.delivery || {}
  const stock = dashboard.stock || []
  const sellers = dashboard.sellers || {}
  const earnings = dashboard.earnings || {}

  const totalAvailable = stock.reduce(
    (total, item) =>
      total + Number(item.available || 0),
    0
  )

  const productRevenue = getProductRevenue(
    earnings.products || []
  )

  return (
    <section className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            Business overview
          </p>

          <h3>Dashboard</h3>

          <p className="page-description">
            Monitor sales, stock, payments, and
            earnings.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() =>
            navigate("/sales/new")
          }
        >
          <Plus
            size={17}
            strokeWidth={2.2}
          />

          New Sale
        </button>
      </div>

      <div className="summary-grid">
<article className="summary-card">
  <div className="summary-card-header">
    <span>Today's sales</span>

    <span className="card-icon">
      <ShoppingCart
        size={18}
        strokeWidth={2}
      />
    </span>
  </div>

  <strong>
    {formatMoney(today.total_value)}
  </strong>

  <p>
    {today.count || 0}{" "}
    {today.count === 1
      ? "sale"
      : "sales"}{" "}
    today
  </p>

  <div className="summary-payment-breakdown">
    <div>
      <span>Cash</span>
      <strong>
        {formatMoney(today.cash)}
      </strong>
    </div>

    <div>
      <span>MoMo</span>
      <strong>
        {formatMoney(today.momo)}
      </strong>
    </div>
  </div>
</article>
        <article className="summary-card">
          <div className="summary-card-header">
            <span>Total sales</span>

            <span className="card-icon">
              <ShoppingCart
                size={18}
                strokeWidth={2}
              />
            </span>
          </div>

          <strong>
            {formatMoney(
              sales.total_value
            )}
          </strong>

          <p>
            {sales.count || 0} recorded{" "}
            {sales.count === 1
              ? "sale"
              : "sales"}
          </p>
        </article>

        <article className="summary-card">
          <div className="summary-card-header">
            <span>Earnings</span>

            <span className="card-icon">
              <TrendingUp
                size={18}
                strokeWidth={2}
              />
            </span>
          </div>

          <strong>
            {formatMoney(
              earnings.earnings
            )}
          </strong>

          <p>
            Revenue minus cost
          </p>
        </article>

        <article className="summary-card">
          <div className="summary-card-header">
            <span>Available stock</span>

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
            Units currently available
          </p>
        </article>

        <article className="summary-card">
          <div className="summary-card-header">
            <span>Owed to sellers</span>

            <span className="card-icon">
              <Store
                size={18}
                strokeWidth={2}
              />
            </span>
          </div>

          <strong>
            {formatMoney(
              sellers.outstanding
            )}
          </strong>

          <p>
            Outstanding seller balances
          </p>
        </article>
      </div>

      <div className="dashboard-grid">
        <article className="content-card">
          <div className="content-card-header">
            <div>
              <h4>
                Sales overview
              </h4>

              <p>
                Current sales and payment position.
              </p>
            </div>

            <span className="status-badge">
              {sales.count || 0}{" "}
              {sales.count === 1
                ? "sale"
                : "sales"}
            </span>
          </div>

          <div className="dashboard-stat-list">
            <div>
              <div className="dashboard-stat-icon">
                <ShoppingCart
                  size={17}
                  strokeWidth={2}
                />
              </div>

              <div>
                <span>
                  Sales value
                </span>

                <strong>
                  {formatMoney(
                    sales.total_value
                  )}
                </strong>
              </div>
            </div>

            <div>
                <div className="dashboard-stat-icon">
                    <span>₵</span>
                </div>

                <div>
                    <span>
                    Cash
                    </span>

                    <strong>
                    {formatMoney(sales.cash)}
                    </strong>
                </div>
                </div>

                <div>
                <div className="dashboard-stat-icon">
                    <span>₵</span>
                </div>

                <div>
                    <span>
                    MoMo
                    </span>

                    <strong>
                    {formatMoney(sales.momo)}
                    </strong>
                </div>
                </div>

            <div>
              <div className="dashboard-stat-icon">
                <Package
                  size={17}
                  strokeWidth={2}
                />
              </div>

              <div>
                <span>
                  Paid by customers
                </span>

                <strong>
                  {formatMoney(
                    payments.total_paid
                  )}
                </strong>
              </div>
            </div>

            <div>
              <div className="dashboard-stat-icon">
                <ArrowRight
                  size={17}
                  strokeWidth={2}
                />
              </div>

              <div>
                <span>
                  Awaiting delivery
                </span>

                <strong>
                  {delivery.awaiting_delivery || 0}
                </strong>
              </div>
            </div>

            <div>
              <div className="dashboard-stat-icon">
                <Package
                  size={17}
                  strokeWidth={2}
                />
              </div>

              <div>
                <span>
                  Partially delivered
                </span>

                <strong>
                  {delivery.partially_delivered || 0}
                </strong>
              </div>
            </div>
          </div>

          <button
            className="dashboard-link"
            onClick={() =>
              navigate("/sales")
            }
          >
            View sales

            <ArrowRight
              size={15}
              strokeWidth={2}
            />
          </button>
        </article>

        <article className="content-card">
          <div className="content-card-header">
            <div>
              <h4>
                Stock status
              </h4>

              <p>
                Current inventory by product and size.
              </p>
            </div>

            <span className="status-badge">
              {totalAvailable} units
            </span>
          </div>

          {stock.length === 0 ? (
            <div className="empty-state dashboard-empty">
              <div className="empty-state-icon">
                <Boxes
                  size={22}
                  strokeWidth={2}
                />
              </div>

              <h5>
                No stock available
              </h5>

              <p>
                Receive stock to start tracking
                inventory.
              </p>
            </div>
          ) : (
            <div className="dashboard-stock-list">
              {stock
                .slice(0, 5)
                .map((item) => (
                  <button
                    className="dashboard-stock-row"
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
                    <div>
                      <strong>
                        {getStockLabel(item)}
                      </strong>

                      <span>
                        {item.delivered || 0} delivered
                      </span>
                    </div>

                    <strong>
                      {item.available || 0}
                    </strong>
                  </button>
                ))}
            </div>
          )}

          <button
            className="dashboard-link"
            onClick={() =>
              navigate("/stock")
            }
          >
            View stock

            <ArrowRight
              size={15}
              strokeWidth={2}
            />
          </button>
        </article>

        <article className="content-card">
          <div className="content-card-header">
            <div>
              <h4>
                Seller balances
              </h4>

              <p>
                Amount currently owed to sellers.
              </p>
            </div>

            <span className="status-badge">
              {sellers.sellers?.length || 0}{" "}
              sellers
            </span>
          </div>

          {sellers.sellers?.length === 0 ? (
            <div className="empty-state dashboard-empty">
              <div className="empty-state-icon">
                <Store
                  size={22}
                  strokeWidth={2}
                />
              </div>

              <h5>
                No seller balances
              </h5>

              <p>
                Seller balances will appear here.
              </p>
            </div>
          ) : (
            <div className="dashboard-seller-list">
              {sellers.sellers
                .filter(
                  (seller) =>
                    Number(
                      seller.outstanding
                    ) > 0
                )
                .slice(0, 5)
                .map((seller) => (
                  <button
                    className="dashboard-seller-row"
                    key={seller.seller_id}
                    onClick={() =>
                      navigate(
                        `/sellers/${seller.seller_id}`
                      )
                    }
                  >
                    <div>
                      <strong>
                        {seller.seller}
                      </strong>

                      <span>
                        Outstanding
                      </span>
                    </div>

                    <strong>
                      {formatMoney(
                        seller.outstanding
                      )}
                    </strong>
                  </button>
                ))}
            </div>
          )}

          <button
            className="dashboard-link"
            onClick={() =>
              navigate("/sellers")
            }
          >
            View sellers

            <ArrowRight
              size={15}
              strokeWidth={2}
            />
          </button>
        </article>

        <article className="content-card">
          <div className="content-card-header">
            <div>
              <h4>
                Earnings
              </h4>

              <p>
                Revenue and cost across sold items.
              </p>
            </div>

            <span className="status-badge">
              {formatMoney(
                earnings.earnings
              )}
            </span>
          </div>

          <div className="dashboard-earnings-summary">
            <div>
              <span>Revenue</span>

              <strong>
                {formatMoney(
                  earnings.revenue
                )}
              </strong>
            </div>

            <div>
              <span>Cost</span>

              <strong>
                {formatMoney(
                  earnings.cost
                )}
              </strong>
            </div>

            <div>
              <span>Earnings</span>

              <strong>
                {formatMoney(
                  earnings.earnings
                )}
              </strong>
            </div>
          </div>

          <div className="dashboard-top-products">
            <span>
              Top earning items
            </span>

            {earnings.products
              ?.slice()
              .sort(
                (a, b) =>
                  Number(b.earnings || 0) -
                  Number(a.earnings || 0)
              )
              .slice(0, 3)
              .map((item) => (
                <div
                  key={`${item.product_id}-${item.variant_id || "none"}`}
                >
                  <div>
                    <strong>
                      {getStockLabel(item)}
                    </strong>

                    <span>
                      {item.quantity}{" "}
                      {item.quantity === 1
                        ? "unit"
                        : "units"}
                    </span>
                  </div>

                  <strong>
                    {formatMoney(
                      item.earnings
                    )}
                  </strong>
                </div>
              ))}
          </div>
        </article>

        <article className="content-card dashboard-revenue-card">
          <div className="content-card-header">
            <div>
              <h4>
                Revenue by product
              </h4>

              <p>
                Revenue generated by each product
                across all sizes.
              </p>
            </div>

            <span className="status-badge">
              {productRevenue.length}{" "}
              {productRevenue.length === 1
                ? "product"
                : "products"}
            </span>
          </div>

          {productRevenue.length === 0 ? (
            <div className="empty-state dashboard-empty">
              <div className="empty-state-icon">
                <TrendingUp
                  size={22}
                  strokeWidth={2}
                />
              </div>

              <h5>
                No product revenue yet
              </h5>

              <p>
                Product revenue will appear here
                after sales are recorded.
              </p>
            </div>
          ) : (
            <div className="dashboard-revenue-list">
              {productRevenue.map(
                (item, index) => (
                  <div
                    className="dashboard-revenue-row"
                    key={item.product_id}
                  >
                    <span className="dashboard-revenue-rank">
                      {index + 1}
                    </span>

                    <div className="dashboard-revenue-product">
                      <strong>
                        {item.product}
                      </strong>

                      <span>
                        {item.quantity}{" "}
                        {item.quantity === 1
                          ? "unit"
                          : "units"}{" "}
                        sold
                      </span>
                    </div>

                    <strong className="dashboard-revenue-amount">
                      {formatMoney(
                        item.revenue
                      )}
                    </strong>
                  </div>
                )
              )}
            </div>
          )}
        </article>
      </div>
    </section>
  )
}

export default Dashboard