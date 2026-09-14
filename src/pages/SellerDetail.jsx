import { useEffect, useState } from "react"
import {
  ArrowLeft,
  Pencil,
  Store,
  Wallet,
  X,
} from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"

import {
  getSeller,
  updateSeller,
} from "../services/sellers_api"

import{
    createSellerPayment,
    getSellerPayments,
} from "../services/seller_payments_api"

function SellerDetail() {
const [payments, setPayments] = useState([])
const [paymentsLoading, setPaymentsLoading] =
  useState(true)
const [paymentsError, setPaymentsError] =
  useState("")

const [showPaymentForm, setShowPaymentForm] =
  useState(false)

const [paymentSaving, setPaymentSaving] =
  useState(false)

const [paymentError, setPaymentError] =
  useState("")

const [paymentData, setPaymentData] = useState({
  amount: "",
  paid_at: new Date().toISOString().slice(0, 16),
  notes: "",
})
  const { sellerId } = useParams()
  const navigate = useNavigate()

  const [seller, setSeller] = useState(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [showEditForm, setShowEditForm] =
    useState(false)

  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    notes: "",
  })

  useEffect(() => {
    loadSeller()
    loadPayments()
  }, [sellerId])

    async function loadPayments() {
    try {
        setPaymentsLoading(true)
        setPaymentsError("")

        const data = await getSellerPayments(
        sellerId
        )

        setPayments(data)
    } catch (error) {
        setPaymentsError(error.message)
    } finally {
        setPaymentsLoading(false)
    }
    }

  async function loadSeller() {
    try {
      setLoading(true)
      setError("")

      const data = await getSeller(sellerId)

      setSeller(data)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  function openEditForm() {
    setFormError("")

    setFormData({
      name: seller.name || "",
      phone: seller.phone || "",
      notes: seller.notes || "",
    })

    setShowEditForm(true)
  }

  function closeEditForm() {
    if (saving) {
      return
    }

    setShowEditForm(false)
    setFormError("")
  }

  function handleInputChange(event) {
    const { name, value } = event.target

    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function openPaymentForm() {
  setPaymentError("")

  setPaymentData({
    amount: "",
    paid_at: new Date()
      .toISOString()
      .slice(0, 16),
    notes: "",
  })

  setShowPaymentForm(true)
}

function closePaymentForm() {
  if (paymentSaving) {
    return
  }

  setShowPaymentForm(false)
  setPaymentError("")
}

function handlePaymentInputChange(event) {
  const { name, value } = event.target

  setPaymentData((current) => ({
    ...current,
    [name]: value,
  }))
}

async function handlePaymentSubmit(event) {
  event.preventDefault()

  setPaymentError("")

  const amount = Number(paymentData.amount)
  const outstanding = Number(
    seller.outstanding || 0
  )

  if (!amount || amount <= 0) {
    setPaymentError(
      "Payment amount must be greater than zero."
    )
    return
  }

  if (amount > outstanding) {
    setPaymentError(
      `Payment cannot exceed the outstanding balance of GHS ${outstanding.toFixed(2)}.`
    )
    return
  }

  try {
    setPaymentSaving(true)

    await createSellerPayment({
      seller: seller.id,
      amount: amount.toFixed(2),
      paid_at: new Date(
        paymentData.paid_at
      ).toISOString(),
      notes: paymentData.notes.trim(),
    })

    const updatedSeller =
      await getSeller(sellerId)

    setSeller(updatedSeller)
    await loadPayments()
    setShowPaymentForm(false)
  } catch (error) {
    setPaymentError(error.message)
  } finally {
    setPaymentSaving(false)
  }
}

  async function handleSubmit(event) {
    event.preventDefault()

    setFormError("")

    if (!formData.name.trim()) {
      setFormError(
        "Seller name is required."
      )
      return
    }

    try {
      setSaving(true)

      const updatedSeller =
        await updateSeller(
          sellerId,
          {
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            notes: formData.notes.trim(),
          }
        )

      setSeller(updatedSeller)
      setShowEditForm(false)
    } catch (error) {
      setFormError(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <section className="page-content">
        <div className="empty-state">
          <div className="empty-state-icon">
            <Store
              size={22}
              strokeWidth={2}
            />
          </div>

          <h5>
            Loading seller...
          </h5>

          <p>
            Getting the seller information.
          </p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="page-content">
        <div className="empty-state">
          <div className="empty-state-icon">
            !
          </div>

          <h5>
            Unable to load seller
          </h5>

          <p>{error}</p>

          <button
            className="secondary-button"
            onClick={() =>
              navigate("/sellers")
            }
          >
            <ArrowLeft
              size={17}
              strokeWidth={2}
            />

            Back to Sellers
          </button>
        </div>
      </section>
    )
  }

  if (!seller) {
    return null
  }

  return (
    <section className="page-content">
      <div className="page-heading">
        <div>
          <button
            className="back-button"
            onClick={() =>
              navigate("/sellers")
            }
          >
            <ArrowLeft
              size={17}
              strokeWidth={2}
            />

            Back to Sellers
          </button>

          <p className="eyebrow">
            Seller
          </p>

          <div className="seller-detail-title">
            <div className="seller-detail-icon">
              <Store
                size={22}
                strokeWidth={2}
              />
            </div>

            <div>
              <h3>{seller.name}</h3>

              <p className="page-description">
                {seller.phone ||
                  "No phone number"}
              </p>
            </div>
          </div>
        </div>

        <div className="seller-detail-actions">
        {seller.is_active &&
            Number(seller.outstanding || 0) > 0 && (
            <button
                className="primary-button"
                onClick={openPaymentForm}
            >
                <Wallet
                size={16}
                strokeWidth={2}
                />

                Make Payment
            </button>
            )}

        <button
            className="secondary-button"
            onClick={openEditForm}
        >
            <Pencil
            size={16}
            strokeWidth={2}
            />

            Edit Seller
        </button>

        <span
            className={
            seller.is_active
                ? "status-pill active"
                : "status-pill inactive"
            }
        >
            {seller.is_active
            ? "Active"
            : "Inactive"}
        </span>
        </div>
      </div>

      <div className="seller-detail-summary">
        <article className="detail-summary-card">
          <span>Seller</span>

          <strong>
            {seller.name}
          </strong>

          <p>
            Supplier
          </p>
        </article>

        <article className="detail-summary-card">
          <span>Phone</span>

          <strong>
            {seller.phone || "—"}
          </strong>

          <p>
            Contact number
          </p>
        </article>

        <article className="detail-summary-card">
          <span>Stock supplied</span>

          <strong>
            {seller.stock_supplied || 0}
          </strong>

          <p>
            Units received
          </p>
        </article>

        <article className="detail-summary-card">
          <span>Balance</span>

            <strong>
            GHS{" "}
            {Number(
                seller.outstanding || 0
            ).toFixed(2)}
            </strong>

          <p>
            Current amount owed
          </p>
        </article>
      </div>

      <div className="seller-detail-grid">
        <article className="content-card">
          <div className="content-card-header">
            <div>
              <h4>Seller information</h4>

              <p>
                Current contact information.
              </p>
            </div>
          </div>

          <div className="seller-information">
            <div className="information-row">
              <span>Seller name</span>

              <strong>
                {seller.name}
              </strong>
            </div>

            <div className="information-row">
              <span>Phone number</span>

              <strong>
                {seller.phone || "Not provided"}
              </strong>
            </div>

            <div className="information-row">
              <span>Status</span>

              <strong>
                {seller.is_active
                  ? "Active"
                  : "Inactive"}
              </strong>
            </div>
          </div>
        </article>

        <article className="content-card">
          <div className="content-card-header">
            <div>
              <h4>Notes</h4>

              <p>
                Additional information about this
                seller.
              </p>
            </div>
          </div>

          <div className="seller-notes">
            {seller.notes ? (
              <p>{seller.notes}</p>
            ) : (
              <div className="seller-notes-empty">
                <p>
                  No notes have been added for this
                  seller.
                </p>
              </div>
            )}
          </div>
        </article>
      </div>

      <article className="content-card seller-payments-card">
  <div className="content-card-header">
    <div>
      <h4>Payment History</h4>

      <p>
        Payments made to this seller.
      </p>
    </div>

    <span className="status-badge">
      {payments.length}{" "}
      {payments.length === 1
        ? "payment"
        : "payments"}
    </span>
  </div>

  {paymentsLoading ? (
    <div className="seller-payment-empty">
      <p>
        Loading payment history...
      </p>
    </div>
  ) : paymentsError ? (
    <div className="seller-payment-empty">
      <p>{paymentsError}</p>

      <button
        className="secondary-button"
        onClick={loadPayments}
      >
        Try again
      </button>
    </div>
  ) : payments.length === 0 ? (
    <div className="seller-payment-empty">
      <div className="empty-state-icon">
        <Wallet
          size={20}
          strokeWidth={2}
        />
      </div>

      <h5>
        No payments yet
      </h5>

      <p>
        Payments made to this seller will
        appear here.
      </p>
    </div>
  ) : (
    <div className="seller-payment-list">
      {payments.map((payment) => (
        <div
          className="seller-payment-row"
          key={payment.id}
        >
          <div>
            <strong>
              GHS{" "}
              {Number(
                payment.amount || 0
              ).toFixed(2)}
            </strong>

            <span>
              {new Date(
                payment.paid_at
              ).toLocaleString()}
            </span>
          </div>

          <span>
            {payment.notes || "No notes"}
          </span>
        </div>
      ))}
    </div>
  )}
</article>

      {showEditForm && (
        <div
          className="modal-backdrop"
          onMouseDown={closeEditForm}
        >
          <div
            className="product-modal seller-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <p className="eyebrow">
                  Seller settings
                </p>

                <h4>Edit Seller</h4>

                <p>
                  Update the seller information.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={closeEditForm}
                disabled={saving}
                title="Close"
              >
                <X
                  size={19}
                  strokeWidth={2}
                />
              </button>
            </div>

            <form
              className="product-form"
              onSubmit={handleSubmit}
            >
              <div className="form-field">
                <label htmlFor="edit-seller-name">
                  Seller name
                </label>

                <input
                  id="edit-seller-name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  autoFocus
                />
              </div>

              <div className="form-field">
                <label htmlFor="edit-seller-phone">
                  Phone number
                </label>

                <input
                  id="edit-seller-phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                />

                <small>
                  Optional contact number.
                </small>
              </div>

              <div className="form-field">
                <label htmlFor="edit-seller-notes">
                  Notes
                </label>

                <textarea
                  id="edit-seller-notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="4"
                />
              </div>

              {formError && (
                <div className="form-error">
                  {formError}
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeEditForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showPaymentForm && (
  <div
    className="modal-backdrop"
    onMouseDown={closePaymentForm}
  >
    <div
      className="product-modal seller-modal"
      onMouseDown={(event) =>
        event.stopPropagation()
      }
    >
      <div className="modal-header">
        <div>
          <p className="eyebrow">
            Seller payment
          </p>

          <h4>Make Payment</h4>

          <p>
            Record a payment to {seller.name}.
          </p>
        </div>

        <button
          className="modal-close"
          onClick={closePaymentForm}
          disabled={paymentSaving}
          title="Close"
        >
          <X
            size={19}
            strokeWidth={2}
          />
        </button>
      </div>

      <form
        className="product-form"
        onSubmit={handlePaymentSubmit}
      >
        <div className="form-field">
          <label>
            Outstanding balance
          </label>

          <div className="payment-balance">
            GHS{" "}
            {Number(
              seller.outstanding || 0
            ).toFixed(2)}
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="seller-payment-amount">
            Amount
          </label>

          <input
            id="seller-payment-amount"
            name="amount"
            type="number"
            min="0.01"
            max={seller.outstanding}
            step="0.01"
            value={paymentData.amount}
            onChange={
              handlePaymentInputChange
            }
            placeholder="0.00"
            autoFocus
          />
        </div>

        <div className="form-field">
          <label htmlFor="seller-payment-paid-at">
            Paid at
          </label>

          <input
            id="seller-payment-paid-at"
            name="paid_at"
            type="datetime-local"
            value={paymentData.paid_at}
            onChange={
              handlePaymentInputChange
            }
          />
        </div>

        <div className="form-field">
          <label htmlFor="seller-payment-notes">
            Notes
          </label>

          <textarea
            id="seller-payment-notes"
            name="notes"
            value={paymentData.notes}
            onChange={
              handlePaymentInputChange
            }
            rows="3"
            placeholder="Optional payment note"
          />
        </div>

        {paymentError && (
          <div className="form-error">
            {paymentError}
          </div>
        )}

        <div className="modal-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={closePaymentForm}
            disabled={paymentSaving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="primary-button"
            disabled={paymentSaving}
          >
            {paymentSaving
              ? "Recording..."
              : "Record Payment"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </section>
  )
}

export default SellerDetail