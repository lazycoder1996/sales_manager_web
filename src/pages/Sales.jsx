import {
  useEffect,
  useRef,
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
} from "../services/sales_api"

function Sales() {
  const navigate = useNavigate()
  const searchTimeoutRef = useRef(null)

  const [sales, setSales] = useState([])
  const [totalCount, setTotalCount] = useState(0);
  const [pageInfo, setPageInfo] = useState(null)

  const [searchTerm, setSearchTerm] = useState("")

  const [dateMode, setDateMode] =
    useState("current")

  const [selectedDate, setSelectedDate] =
    useState("")

  const [dateFrom, setDateFrom] =
    useState("")

  const [dateTo, setDateTo] =
    useState("")

  const [loading, setLoading] =
    useState(true)

  const [loadingMore, setLoadingMore] =
    useState(false)

  const [error, setError] =
    useState("")

  useEffect(() => {
    loadSales()

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(
          searchTimeoutRef.current
        )
      }
    }
  }, [])

  function getDateFilters() {
    if (dateMode === "date") {
      return {
        date: selectedDate,
      }
    }

    if (dateMode === "range") {
      return {
        dateFrom,
        dateTo,
      }
    }

    return {}
  }

  async function loadSales({
    after = "",
    append = false,
  } = {}) {
    try {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }

      setError("")

      const data = await getSales({
        first: 50,
        after,
        search: searchTerm.trim(),
        ...getDateFilters(),
      })

      const newSales = data.edges.map(
        (edge) => edge.node
      )

      if (append) {
        setSales((current) => [
          ...current,
          ...newSales,
        ])
      } else {
        setSales(newSales)
      }

      setPageInfo(data.page_info)
      setTotalCount(data.total_count)
    } catch (error) {
      if (!append) {
        setSales([])
      }

      setError(error.message)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  async function loadMore() {
    if (
      loadingMore ||
      !pageInfo?.has_next_page ||
      !pageInfo?.end_cursor
    ) {
      return
    }

    await loadSales({
      after: pageInfo.end_cursor,
      append: true,
    })
  }

  function handleSearchChange(event) {
    const value = event.target.value

    setSearchTerm(value)

    if (searchTimeoutRef.current) {
      clearTimeout(
        searchTimeoutRef.current
      )
    }

    searchTimeoutRef.current = setTimeout(() => {
      loadSales()
    }, 400)
  }

  function handleDateModeChange(event) {
    const value = event.target.value

    setDateMode(value)

    if (value === "current") {
      setSelectedDate("")
      setDateFrom("")
      setDateTo("")

      loadSales({
        after: "",
      })
    }
  }

  function handleDateChange(event) {
    setSelectedDate(event.target.value)
  }

  function handleDateFromChange(event) {
    setDateFrom(event.target.value)
  }

  function handleDateToChange(event) {
    setDateTo(event.target.value)
  }

  function applyDateFilter() {
    if (dateMode === "date" && !selectedDate) {
      return
    }

    if (
      dateMode === "range" &&
      (!dateFrom || !dateTo)
    ) {
      return
    }

    if (
      dateMode === "range" &&
      dateFrom > dateTo
    ) {
      setError(
        "The start date cannot be after the end date."
      )
      return
    }

    loadSales({
      after: "",
    })
  }

  function clearDateFilter() {
    setDateMode("current")
    setSelectedDate("")
    setDateFrom("")
    setDateTo("")
    setError("")

    loadSales({
      after: "",
    })
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

  const hasDateFilter =
    dateMode !== "current"

  const hasAppliedDateFilter =
    dateMode === "date"
      ? Boolean(selectedDate)
      : dateMode === "range"
        ? Boolean(dateFrom && dateTo)
        : false

  return (
    <section className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            Transactions
          </p>

          <h3>Sales</h3>

          <p className="page-description">
            Find a student or record a new purchase.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() =>
            navigate("/sales/new")
          }
        >
          + New Sale
        </button>
      </div>

      <div className="sales-search-card">
        <div className="sales-filter-row">
          <div className="sales-filter-select">
            <label htmlFor="sales-date-mode">
              View
            </label>

            <select
              id="sales-date-mode"
              value={dateMode}
              onChange={handleDateModeChange}
            >
              <option value="current">
                Current view
              </option>

              <option value="date">
                Specific date
              </option>

              <option value="range">
                Date range
              </option>
            </select>
          </div>

          {dateMode === "date" && (
            <div className="sales-filter-field">
              <label htmlFor="sales-date">
                Date
              </label>

              <input
                id="sales-date"
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
              />
            </div>
          )}

          {dateMode === "range" && (
            <>
              <div className="sales-filter-field">
                <label htmlFor="sales-date-from">
                  From
                </label>

                <input
                  id="sales-date-from"
                  type="date"
                  value={dateFrom}
                  onChange={handleDateFromChange}
                />
              </div>

              <div className="sales-filter-field">
                <label htmlFor="sales-date-to">
                  To
                </label>

                <input
                  id="sales-date-to"
                  type="date"
                  value={dateTo}
                  onChange={handleDateToChange}
                />
              </div>
            </>
          )}

          {hasDateFilter && (
            <div className="sales-filter-actions page-heading-actions">
              <button
                type="button"
                className="primary-button"
                onClick={applyDateFilter}
              >
                Apply
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={clearDateFilter}
              >
                Clear
              </button>
            </div>
          )}
        </div>

        <div className="sales-search">
          <Search
            size={18}
            strokeWidth={2}
          />

          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
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
              {totalCount}{" "}
              {totalCount === 1
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
              onClick={() => loadSales()}
            >
              Try again
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          totalCount === 0 && (
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
                  : hasAppliedDateFilter
                    ? "No sales found"
                    : "No sales recorded yet"}
              </h5>

              <p>
                {searchTerm
                  ? "Try another student number or name."
                  : hasAppliedDateFilter
                    ? "There are no sales matching the selected date."
                    : "Once you record a sale, it will appear here."}
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          totalCount > 0 && (
            <>
              <div className="sales-list">
                {sales.map((sale) => (
                  <div
                    className="sale-row"
                    key={sale.id}
                    onClick={() =>
                      navigate(
                        `/sales/${sale.id}`
                      )
                    }
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
                        {sale.payment_status ===
                        "paid"
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
                        navigate(
                          `/sales/${sale.id}`
                        )
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

              {pageInfo?.has_next_page && (
                <div className="sales-load-more">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={loadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore
                      ? "Loading..."
                      : "Load more"}
                  </button>
                </div>
              )}
            </>
          )}
      </div>
    </section>
  )
}

export default Sales