import {
  useEffect,
  useState,
} from "react"
import {
  ArrowLeft,
  Banknote,
  Check,
  Package,
  Plus,
  Search,
  Smartphone,
  Trash2,
  UserRound,
  X,
} from "lucide-react"
import {
  useNavigate,
} from "react-router-dom"

import {
  getProducts,
} from "../services/products_api"

import {
  completeSale,
} from "../services/sales_api"

import {
  getStudents,
} from "../services/students_api"


function NewSale() {
  const navigate = useNavigate()

  const [products, setProducts] = useState([])

  const [studentSearch, setStudentSearch] =
    useState("")

  const [studentResults, setStudentResults] =
    useState([])

  const [studentSearchLoading, setStudentSearchLoading] =
    useState(false)

  const [studentSearchError, setStudentSearchError] =
    useState("")

  const [selectedStudent, setSelectedStudent] =
    useState(null)

  const [cashAmount, setCashAmount] =
    useState("")

  const [momoAmount, setMomoAmount] =
    useState("")

  const [lines, setLines] = useState([
    createEmptyLine(),
  ])

  const [loadingProducts, setLoadingProducts] =
    useState(true)

  const [productsError, setProductsError] =
    useState("")

  const [saving, setSaving] = useState(false)

  const [formError, setFormError] =
    useState("")


  useEffect(() => {
    loadProducts()
  }, [])


  useEffect(() => {
    if (!studentSearch.trim()) {
      setStudentResults([])
      setStudentSearchError("")
      return
    }

    const timer = setTimeout(() => {
      searchStudents(studentSearch)
    }, 400)

    return () => clearTimeout(timer)
  }, [studentSearch])


  async function loadProducts() {
    try {
      setLoadingProducts(true)
      setProductsError("")

      const data = await getProducts()

      setProducts(
        data.filter(
          (product) => product.is_active
        )
      )
    } catch (error) {
      setProductsError(
        error.message ||
        "Failed to load products."
      )
    } finally {
      setLoadingProducts(false)
    }
  }


  async function searchStudents(searchTerm) {
    try {
      setStudentSearchLoading(true)
      setStudentSearchError("")

      const data = await getStudents({
        first: 20,
        search: searchTerm,
      })

      const students =
        data.edges?.map(
          (edge) => edge.node
        ) || []

      setStudentResults(students)
    } catch (error) {
      setStudentSearchError(
        error.message ||
        "Failed to search students."
      )
    } finally {
      setStudentSearchLoading(false)
    }
  }


  function createEmptyLine() {
    return {
      id: crypto.randomUUID(),
      productId: "",
      variantId: "",
      quantity: 1,
    }
  }


  function handleStudentSearch(event) {
    const value = event.target.value

    setStudentSearch(value)

    if (selectedStudent) {
      setSelectedStudent(null)
    }
  }


  function selectStudent(student) {
    setSelectedStudent(student)
    setStudentSearch("")
    setStudentResults([])
    setStudentSearchError("")
    setFormError("")
  }


  function clearStudent() {
    setSelectedStudent(null)
    setStudentSearch("")
    setStudentResults([])
  }


  function getStudentName(student) {
    return [
      student.firstname,
      student.middlename,
      student.surname,
    ]
      .filter(Boolean)
      .join(" ")
  }


  function handleLineChange(
    lineId,
    field,
    value
  ) {
    setLines((current) =>
      current.map((line) => {
        if (line.id !== lineId) {
          return line
        }

        if (field === "productId") {
          return {
            ...line,
            productId: value,
            variantId: "",
          }
        }

        return {
          ...line,
          [field]: value,
        }
      })
    )
  }


  function addLine() {
    setLines((current) => [
      ...current,
      createEmptyLine(),
    ])
  }


  function removeLine(lineId) {
    if (lines.length === 1) {
      return
    }

    setLines((current) =>
      current.filter(
        (line) => line.id !== lineId
      )
    )
  }


  function getProduct(productId) {
    return products.find(
      (product) =>
        String(product.id) ===
        String(productId)
    )
  }


  function getActiveVariants(product) {
    if (!product?.variants) {
      return []
    }

    return product.variants.filter(
      (variant) => variant.is_active
    )
  }


  function getLineProduct(line) {
    return getProduct(line.productId)
  }


  function getLineVariant(
    line,
    product
  ) {
    if (!product || !line.variantId) {
      return null
    }

    return getActiveVariants(product).find(
      (variant) =>
        String(variant.id) ===
        String(line.variantId)
    )
  }


  function getLineTotal(line) {
    const product = getLineProduct(line)

    if (!product) {
      return 0
    }

    return (
      Number(product.selling_price || 0) *
      Number(line.quantity || 0)
    )
  }


  const total = lines.reduce(
    (sum, line) =>
      sum + getLineTotal(line),
    0
  )


  const cash = Number(cashAmount || 0)
  const momo = Number(momoAmount || 0)

  const paymentTotal =
    cash + momo

  const paymentDifference =
    paymentTotal - total

  const isPaymentComplete =
    Math.abs(paymentDifference) < 0.01


  function validateForm() {
    if (!selectedStudent) {
      return "Select a student."
    }

    if (lines.length === 0) {
      return "Add at least one product."
    }

    for (
      let index = 0;
      index < lines.length;
      index += 1
    ) {
      const line = lines[index]

      const product =
        getLineProduct(line)

      if (!product) {
        return `Select a product for item ${
          index + 1
        }.`
      }

      const variants =
        getActiveVariants(product)

      if (
        variants.length > 0 &&
        !line.variantId
      ) {
        return `Select a size for item ${
          index + 1
        }.`
      }

      const quantity =
        Number(line.quantity)

      if (
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return `Quantity for item ${
          index + 1
        } must be at least 1.`
      }
    }

    if (cash < 0 || momo < 0) {
      return (
        "Payment amounts cannot be negative."
      )
    }

    if (!isPaymentComplete) {
      return (
        "Cash and MoMo payments must equal " +
        `GHS ${total.toFixed(2)}.`
      )
    }

    return ""
  }


  async function handleSubmit(event) {
    event.preventDefault()

    setFormError("")

    const validationError =
      validateForm()

    if (validationError) {
      setFormError(validationError)
      return
    }

    try {
      setSaving(true)

      const sale = await completeSale({
        student:
          selectedStudent.id,

        sold_at:
          new Date().toISOString(),

        notes: "",

        lines: lines.map((line) => ({
          product: line.productId,

          product_variant:
            line.variantId || null,

          quantity:
            Number(line.quantity),
        })),

        cash_amount:
          cash.toFixed(2),

        momo_amount:
          momo.toFixed(2),

        paid_at:
          new Date().toISOString(),
      })

      navigate(
        `/sales/${sale.id}`
      )
    } catch (error) {
      setFormError(
        error.message ||
        "Failed to record sale."
      )
    } finally {
      setSaving(false)
    }
  }


  if (loadingProducts) {
    return (
      <section className="page-content">
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
            Getting available products for
            this sale.
          </p>
        </div>
      </section>
    )
  }


  if (productsError) {
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
            Unable to load products
          </h5>

          <p>
            {productsError}
          </p>

          <button
            className="secondary-button"
            onClick={loadProducts}
          >
            Try again
          </button>
        </div>
      </section>
    )
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
            Transactions
          </p>

          <h3>
            New Sale
          </h3>

          <p className="page-description">
            Record a purchase for a student.
          </p>
        </div>
      </div>


      <form
        className="new-sale-form"
        onSubmit={handleSubmit}
      >

        <article className="content-card">

          <div className="content-card-header">
            <div>
              <h4>
                Student information
              </h4>

              <p>
                Search and select the student
                making this purchase.
              </p>
            </div>
          </div>


          {!selectedStudent && (
            <div className="student-sale-search">

              <div className="form-field">

                <label htmlFor="student-search">
                  Student
                </label>

                <div className="student-sale-search-input">

                  <Search
                    size={17}
                    strokeWidth={2}
                  />

                  <input
                    id="student-search"
                    type="text"
                    value={studentSearch}
                    onChange={
                      handleStudentSearch
                    }
                    placeholder={
                      "Search by admission number or name"
                    }
                    autoFocus
                  />

                  {studentSearchLoading && (
                    <span>
                      Searching...
                    </span>
                  )}

                </div>

              </div>


              {studentSearchError && (
                <div className="form-error">
                  {studentSearchError}
                </div>
              )}


              {studentSearch.trim() &&
                !studentSearchLoading &&
                studentResults.length === 0 &&
                !studentSearchError && (
                  <div className="student-sale-search-empty">
                    No active students found.
                  </div>
                )}


              {studentResults.length > 0 && (
                <div className="student-sale-results">

                  {studentResults.map(
                    (student) => (
                      <button
                        type="button"
                        className="student-sale-result"
                        key={student.id}
                        onClick={() =>
                          selectStudent(
                            student
                          )
                        }
                      >

                        <div className="student-sale-result-icon">
                          <UserRound
                            size={18}
                            strokeWidth={2}
                          />
                        </div>

                        <div className="student-sale-result-info">

                          <strong>
                            {getStudentName(
                              student
                            )}
                          </strong>

                          <span>
                            {student.admission_number ||
                              "No admission number"}
                          </span>

                        </div>

                      </button>
                    )
                  )}

                </div>
              )}

            </div>
          )}


          {selectedStudent && (
            <div className="selected-sale-student">

              <div className="selected-sale-student-icon">
                <UserRound
                  size={20}
                  strokeWidth={2}
                />
              </div>


              <div className="selected-sale-student-info">

                <span>
                  Selected student
                </span>

                <strong>
                  {getStudentName(
                    selectedStudent
                  )}
                </strong>

                <small>
                  {selectedStudent.admission_number ||
                    "No admission number"}
                </small>

              </div>


              <button
                type="button"
                className="selected-sale-student-remove"
                onClick={clearStudent}
                disabled={saving}
                title="Change student"
              >
                <X
                  size={17}
                  strokeWidth={2}
                />
              </button>

            </div>
          )}

        </article>


        <article className="content-card">

          <div className="content-card-header">

            <div>
              <h4>
                Purchase items
              </h4>

              <p>
                Add the products and quantities
                being purchased.
              </p>
            </div>

            <span className="status-badge">
              {lines.length}{" "}
              {lines.length === 1
                ? "item"
                : "items"}
            </span>

          </div>


          <div className="new-sale-lines">

            {lines.map(
              (line, index) => {

                const product =
                  getLineProduct(line)

                const variants =
                  getActiveVariants(
                    product
                  )

                const variant =
                  getLineVariant(
                    line,
                    product
                  )

                return (
                  <div
                    className="new-sale-line"
                    key={line.id}
                  >

                    <div className="new-sale-line-number">
                      {index + 1}
                    </div>


                    <div className="form-field">

                      <label
                        htmlFor={`product-${line.id}`}
                      >
                        Product
                      </label>

                      <select
                        id={`product-${line.id}`}
                        value={
                          line.productId
                        }
                        onChange={(
                          event
                        ) =>
                          handleLineChange(
                            line.id,
                            "productId",
                            event.target
                              .value
                          )
                        }
                      >
                        <option value="">
                          Select product
                        </option>

                        {products.map(
                          (item) => (
                            <option
                              key={
                                item.id
                              }
                              value={
                                item.id
                              }
                            >
                              {item.name}
                            </option>
                          )
                        )}

                      </select>

                    </div>


                    <div className="form-field">

                      <label
                        htmlFor={`variant-${line.id}`}
                      >
                        Size
                      </label>

                      <select
                        id={`variant-${line.id}`}
                        value={
                          line.variantId
                        }
                        disabled={
                          !product ||
                          variants.length ===
                            0
                        }
                        onChange={(
                          event
                        ) =>
                          handleLineChange(
                            line.id,
                            "variantId",
                            event.target
                              .value
                          )
                        }
                      >

                        <option value="">
                          {product &&
                          variants.length ===
                            0
                            ? "No size"
                            : "Select size"}
                        </option>

                        {variants.map(
                          (item) => (
                            <option
                              key={
                                item.id
                              }
                              value={
                                item.id
                              }
                            >
                              {item.size}
                            </option>
                          )
                        )}

                      </select>

                    </div>


                    <div className="form-field new-sale-quantity">

                      <label
                        htmlFor={`quantity-${line.id}`}
                      >
                        Quantity
                      </label>

                      <input
                        id={`quantity-${line.id}`}
                        type="number"
                        min="1"
                        step="1"
                        value={
                          line.quantity
                        }
                        onChange={(
                          event
                        ) =>
                          handleLineChange(
                            line.id,
                            "quantity",
                            event.target
                              .value
                          )
                        }
                      />

                    </div>


                    <div className="new-sale-line-price">

                      <span>
                        Unit price
                      </span>

                      <strong>
                        {product
                          ? `GHS ${Number(
                              product.selling_price ||
                                0
                            ).toFixed(2)}`
                          : "—"}
                      </strong>

                      {variant && (
                        <small>
                          Size{" "}
                          {variant.size}
                        </small>
                      )}

                    </div>


                    <div className="new-sale-line-total">

                      <span>
                        Line total
                      </span>

                      <strong>
                        {product
                          ? `GHS ${getLineTotal(
                              line
                            ).toFixed(2)}`
                          : "—"}
                      </strong>

                    </div>


                    <button
                      type="button"
                      className="stock-line-remove"
                      onClick={() =>
                        removeLine(
                          line.id
                        )
                      }
                      disabled={
                        lines.length === 1
                      }
                      title="Remove item"
                    >
                      <Trash2
                        size={16}
                        strokeWidth={2}
                      />
                    </button>

                  </div>
                )
              }
            )}

          </div>


          <div className="new-sale-add-line">

            <button
              type="button"
              className="secondary-button"
              onClick={addLine}
            >
              <Plus
                size={16}
                strokeWidth={2.2}
              />

              Add another item
            </button>

          </div>

        </article>


        <article className="content-card">

          <div className="content-card-header">

            <div>
              <h4>
                Payment
              </h4>

              <p>
                Confirm the full amount received
                before recording the sale.
              </p>
            </div>

            <span className="status-badge">
              Full payment required
            </span>

          </div>


          <div className="payment-summary">

            <div>
              <span>
                Amount to pay
              </span>

              <strong>
                GHS {total.toFixed(2)}
              </strong>
            </div>

          </div>


          <div className="payment-method-grid">

            <div className="form-field payment-field">

              <label htmlFor="cash-amount">

                <Banknote
                  size={15}
                  strokeWidth={2}
                />

                Cash

              </label>


              <div className="payment-input">

                <span>
                  GHS
                </span>

                <input
                  id="cash-amount"
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
                />

              </div>

            </div>


            <div className="form-field payment-field">

              <label htmlFor="momo-amount">

                <Smartphone
                  size={15}
                  strokeWidth={2}
                />

                MoMo

              </label>


              <div className="payment-input">

                <span>
                  GHS
                </span>

                <input
                  id="momo-amount"
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
                />

              </div>

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
                ? paymentTotal.toFixed(2)
                : Math.abs(
                    paymentDifference
                  ).toFixed(2)}
            </strong>

          </div>

        </article>


        <div className="new-sale-summary">

          <div>
            <span>
              Sale total
            </span>

            <strong>
              GHS {total.toFixed(2)}
            </strong>
          </div>

        </div>


        {formError && (
          <div className="form-error">
            {formError}
          </div>
        )}


        <div className="new-sale-actions">

          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              navigate("/sales")
            }
            disabled={saving}
          >
            Cancel
          </button>


          <button
            type="submit"
            className="primary-button"
            disabled={
              saving ||
              !selectedStudent ||
              !isPaymentComplete
            }
          >
            {saving
              ? "Recording sale..."
              : "Confirm Payment & Record Sale"}
          </button>

        </div>

      </form>

    </section>
  )
}

export default NewSale