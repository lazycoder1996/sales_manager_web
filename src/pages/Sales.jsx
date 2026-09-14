import {
  useEffect,
  useState,
} from "react"
import {
  useNavigate,
} from "react-router-dom"
import {
  ArrowRight,
  Search,
  ShoppingCart,
  UserRound,
} from "lucide-react"

import {
  getSales,
  searchSales,
} from "../services/sales_api"

function Sales() {
  const navigate = useNavigate()
  const [sales, setSales] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadSales()
  }, [])

  async function loadSales() {
    try {
      setLoading(true)
      setError("")

      const data = await getSales()

      setSales(data)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSearch(event) {
    const value = event.target.value

    setSearchTerm(value)

    if (!value.trim()) {
      loadSales()
      return
    }

    try {
      setLoading(true)
      setError("")

      const data = await searchSales(value.trim())

      if (Array.isArray(data)) {
        setSales(data)
      } else {
        setSales([data])
      }
    } catch (error) {
      setSales([])
      setError(error.message)
    } finally {
      setLoading(false)
    }
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

  return (
    <section className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Transactions</p>

          <h3>Sales</h3>

          <p className="page-description">
            Find a student or record a new purchase.
          </p>
        </div>

        <button className="primary-button"
          onClick={() => navigate("/sales/new")}
        >
          + New Sale
        </button>
      </div>

      <div className="sales-search-card">
        <div className="sales-search">
          <Search
            size={18}
            strokeWidth={2}
          />

          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search by student number or name..."
          />
        </div>
      </div>

      <div className="sales-list-card">
        <div className="sales-list-header">
          <div>
            <h4>Student purchases</h4>

            <p>
              Select a student to view their purchase history.
            </p>
          </div>

          {!loading && (
            <span className="sales-count">
              {sales.length}{" "}
              {sales.length === 1
                ? "student"
                : "students"}
            </span>
          )}
        </div>

        {loading && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <ShoppingCart
                size={22}
                strokeWidth={2}
              />
            </div>

            <h5>Loading sales...</h5>

            <p>
              Getting the latest sales from the server.
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="empty-state">
            <div className="empty-state-icon">
              !
            </div>

            <h5>Unable to load sales</h5>

            <p>{error}</p>

            <button
              className="secondary-button"
              onClick={loadSales}
            >
              Try again
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          sales.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Search
                  size={22}
                  strokeWidth={2}
                />
              </div>

              <h5>
                {searchTerm
                  ? "No students found"
                  : "No sales recorded yet"}
              </h5>

              <p>
                {searchTerm
                  ? "Try another student number or name."
                  : "Once you record a sale, it will appear here."}
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          sales.length > 0 && (
            <div className="sales-list">
              {sales.map((sale) => (
                <div
                  className="sale-row"
                  key={sale.id}
                  onClick={() => navigate(`/sales/${sale.id}`)}
                >
                  <div className="sale-student">
                    <div className="student-avatar">
                      <UserRound
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

                  <div className="sale-items">
                    <span>Items</span>

                    <strong>
                      {sale.lines?.length ?? 0}
                    </strong>
                  </div>

                  <div className="sale-total">
                    <span>Total</span>

                    <strong>
                      GHS {sale.total}
                    </strong>
                  </div>

                  <div className="sale-status">
                    <span
                      className={`status-pill ${sale.payment_status}`}
                    >
                      {sale.payment_status === "paid"
                        ? "Paid"
                        : sale.payment_status ===
                            "partially_paid"
                          ? "Partially paid"
                          : "Unpaid"}
                    </span>

                    <span
                      className={`delivery-pill ${sale.delivery_status}`}
                    >
                      {getDeliveryLabel(
                        sale.delivery_status
                      )}
                    </span>
                  </div>

                  <button
                    className="sale-action"
                    title="View student purchases"
                    onClick={() =>
                      navigate(`/sales/${sale.id}`)
                    }
                  >
                    <ArrowRight
                      size={17}
                      strokeWidth={2}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}
      </div>
    </section>
  )
}

export default Sales