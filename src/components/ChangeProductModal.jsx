import {
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  Package,
  Plus,
  X,
} from "lucide-react"

import {
  getProducts,
} from "../services/products_api"

import {
  changeSaleLineProduct,
} from "../services/sales_api"

function ChangeProductModal({
  sale,
  line,
  onClose,
  onSuccess,
}) {
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] =
    useState(true)

  const [returnQuantity, setReturnQuantity] =
    useState("")

  const [replacementItems, setReplacementItems] =
    useState([
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
  }, [line])

  async function loadProducts() {
    if (!line) {
      return
    }

    try {
      setLoadingProducts(true)
      setError("")

      const data = await getProducts()

      const activeProducts = data.filter(
        (product) => product.is_active
      )

      setProducts(activeProducts)

      setReturnQuantity(
        String(line.quantity)
      )

      setReplacementItems([
        {
          productId: "",
          variantId: "",
          quantity: 1,
        },
      ])

      setCashAmount("")
      setMomoAmount("")
    } catch (error) {
      setError(error.message)
    } finally {
      setLoadingProducts(false)
    }
  }

  function getProduct(productId) {
    return products.find(
      (product) =>
        String(product.id) ===
        String(productId)
    )
  }

  function getActiveVariants(product) {
    return (
      product?.variants?.filter(
        (variant) => variant.is_active
      ) ?? []
    )
  }

  const currentProduct = getProduct(
    line?.product
  )

  const currentUnitPrice = Number(
    line?.unit_price || 0
  )

  const currentQuantity = Number(
    line?.quantity || 0
  )

  const deliveredQuantity = Number(
    line?.delivered_quantity || 0
  )

  const pendingQuantity = Math.max(
    currentQuantity -
      deliveredQuantity,
    0
  )

  const returnQuantityValue = Number(
    returnQuantity || 0
  )

  const returnedTotal =
    currentUnitPrice *
    returnQuantityValue

  const replacementTotal = useMemo(() => {
    return replacementItems.reduce(
      (total, item) => {
        const product = getProduct(
          item.productId
        )

        if (!product) {
          return total
        }

        const unitPrice = Number(
          product.selling_price || 0
        )

        const quantity = Number(
          item.quantity || 0
        )

        return (
          total +
          unitPrice * quantity
        )
      },
      0
    )
  }, [replacementItems, products])

  const difference =
    replacementTotal -
    returnedTotal

  const requiresTopUp =
    difference > 0.005

  const requiresRefund =
    difference < -0.005

  const isNoAdjustment =
    !requiresTopUp &&
    !requiresRefund

  const cashValue = Number(
    cashAmount || 0
  )

  const momoValue = Number(
    momoAmount || 0
  )

  const topUpEntered =
    cashValue + momoValue

  const topUpMatches =
    Math.abs(
      topUpEntered - difference
    ) < 0.005

  function getReplacementLineTotal(
    item
  ) {
    const product = getProduct(
      item.productId
    )

    if (!product) {
      return 0
    }

    return (
      Number(
        product.selling_price || 0
      ) *
      Number(item.quantity || 0)
    )
  }

  function updateReplacementItem(
    index,
    field,
    value
  ) {
    setReplacementItems(
      (current) =>
        current.map(
          (item, itemIndex) => {
            if (
              itemIndex !== index
            ) {
              return item
            }

            return {
              ...item,
              [field]: value,
            }
          }
        )
    )

    setError("")
  }

  function handleProductChange(
    index,
    productId
  ) {
    setReplacementItems(
      (current) =>
        current.map(
          (item, itemIndex) => {
            if (
              itemIndex !== index
            ) {
              return item
            }

            return {
              ...item,
              productId,
              variantId: "",
            }
          }
        )
    )

    setCashAmount("")
    setMomoAmount("")
    setError("")
  }

  function addReplacementItem() {
    setReplacementItems(
      (current) => [
        ...current,
        {
          productId: "",
          variantId: "",
          quantity: 1,
        },
      ]
    )

    setError("")
  }

  function removeReplacementItem(
    index
  ) {
    setReplacementItems(
      (current) =>
        current.filter(
          (_, itemIndex) =>
            itemIndex !== index
        )
    )

    setCashAmount("")
    setMomoAmount("")
    setError("")
  }

  function getItemIdentity(item) {
    return `${item.productId || ""}:${
      item.variantId || "none"
    }`
  }

  function validateDuplicateItems() {
    const identities = new Set()

    for (
      const item of replacementItems
    ) {
      if (!item.productId) {
        continue
      }

      const identity =
        getItemIdentity(item)

      if (
        identities.has(identity)
      ) {
        const product = getProduct(
          item.productId
        )

        return (
          `You have selected ${
            product?.name ||
            "the same product"
          } with the same variant more than once. ` +
          "Increase the quantity on one row instead."
        )
      }

      identities.add(identity)
    }

    return ""
  }

  function validate() {
    if (!sale) {
      return (
        "Sale details are unavailable."
      )
    }

    if (!line) {
      return (
        "Sale line is unavailable."
      )
    }

    if (!returnQuantity.trim()) {
      return (
        "Enter the quantity being returned."
      )
    }

    if (
      !Number.isInteger(
        returnQuantityValue
      )
    ) {
      return (
        "Return quantity must be a whole number."
      )
    }

    if (
      returnQuantityValue < 1
    ) {
      return (
        "Return quantity must be at least 1."
      )
    }

    if (
      returnQuantityValue >
      currentQuantity
    ) {
      return `You can return at most ${currentQuantity} unit(s).`
    }

    if (
      replacementItems.length === 0
    ) {
      return (
        "Add at least one replacement item."
      )
    }

    for (
      const item of replacementItems
    ) {
      if (!item.productId) {
        return (
          "Select a replacement product for every item."
        )
      }

      const product = getProduct(
        item.productId
      )

      if (!product) {
        return (
          "One of the selected replacement products could not be found."
        )
      }

      const variants =
        getActiveVariants(product)

      if (
        variants.length > 0 &&
        !item.variantId
      ) {
        return `Select a size for ${product.name}.`
      }

      if (
        variants.length === 0 &&
        item.variantId
      ) {
        return `The selected product ${product.name} does not have a size.`
      }

      const quantity = Number(
        item.quantity
      )

      if (
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return `Quantity for ${product.name} must be at least 1.`
      }
    }

    const duplicateError =
      validateDuplicateItems()

    if (duplicateError) {
      return duplicateError
    }

    if (
      replacementTotal <= 0
    ) {
      return (
        "The replacement total must be greater than zero."
      )
    }

    if (requiresTopUp) {
      if (
        cashValue < 0 ||
        momoValue < 0
      ) {
        return (
          "Payment amounts cannot be negative."
        )
      }

      if (!topUpMatches) {
        return (
          `Cash and MoMo amounts must total GHS ${difference.toFixed(2)}.`
        )
      }
    }

    if (
      !requiresTopUp &&
      (cashValue !== 0 ||
        momoValue !== 0)
    ) {
      return (
        "Cash and MoMo amounts should be zero when no top-up is required."
      )
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

      const updatedSaleLines =
        await changeSaleLineProduct(
          sale.id,
          line.id,
          {
            return_quantity:
              returnQuantityValue,

            items:
              replacementItems.map(
                (item) => ({
                  product:
                    item.productId,

                  product_variant:
                    item.variantId ||
                    null,

                  quantity:
                    Number(
                      item.quantity
                    ),
                })
              ),

            cash_amount:
              requiresTopUp
                ? cashAmount || "0"
                : "0",

            momo_amount:
              requiresTopUp
                ? momoAmount || "0"
                : "0",
          }
        )

      onSuccess(
        updatedSaleLines
      )
    } catch (error) {
      setError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!line) {
    return null
  }

  return (
    <div className="delivery-overlay">
      <div className="delivery-modal additional-purchase-modal">
        <div className="delivery-modal-header">
          <div>
            <p className="eyebrow">
              Exchange Item
            </p>

            <h4>
              Exchange Product
            </h4>

            <p>
              Return part or all of this item
              and replace it with one or more
              products.
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
              {sale?.student_name}
            </strong>

            <span>
              {sale?.student_number}
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
              <div className="additional-purchase-line">
                <div className="additional-purchase-line-header">
                  <strong>
                    Current Item
                  </strong>
                </div>

                <div className="change-product-current">
                  <div>
                    <span>
                      Product
                    </span>

                    <strong>
                      {currentProduct?.name ||
                        line.product_name}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Size
                    </span>

                    <strong>
                      {line.product_variant_size
                        ? `Size ${line.product_variant_size}`
                        : "No variant"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Purchased
                    </span>

                    <strong>
                      {currentQuantity}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Delivered
                    </span>

                    <strong>
                      {deliveredQuantity}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Pending
                    </span>

                    <strong>
                      {pendingQuantity}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Unit price
                    </span>

                    <strong>
                      GHS{" "}
                      {currentUnitPrice.toFixed(
                        2
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Line total
                    </span>

                    <strong>
                      GHS{" "}
                      {(
                        currentUnitPrice *
                        currentQuantity
                      ).toFixed(2)}
                    </strong>
                  </div>
                </div>

                <div className="additional-purchase-fields">
                  <div className="form-field">
                    <label htmlFor="change-product-return-quantity">
                      Quantity to return
                    </label>

                    <input
                      id="change-product-return-quantity"
                      type="number"
                      min="1"
                      max={currentQuantity}
                      step="1"
                      inputMode="numeric"
                      value={returnQuantity}
                      onChange={(event) =>
                        setReturnQuantity(
                          event.target.value
                        )
                      }
                      disabled={submitting}
                    />
                  </div>

                  <div className="additional-purchase-line-total">
                    <span>
                      Value returned
                    </span>

                    <strong>
                      GHS{" "}
                      {returnedTotal.toFixed(
                        2
                      )}
                    </strong>
                  </div>
                </div>
              </div>

              {replacementItems.map(
                (
                  item,
                  index
                ) => {
                  const product =
                    getProduct(
                      item.productId
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
                          Replacement Item{" "}
                          {index + 1}
                        </strong>

                        {replacementItems.length >
                          1 && (
                          <button
                            type="button"
                            className="delivery-remove-button"
                            onClick={() =>
                              removeReplacementItem(
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
                            htmlFor={`change-product-product-${index}`}
                          >
                            Product
                          </label>

                          <select
                            id={`change-product-product-${index}`}
                            value={
                              item.productId
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
                              (
                                product
                              ) => (
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
                              htmlFor={`change-product-variant-${index}`}
                            >
                              Size
                            </label>

                            <select
                              id={`change-product-variant-${index}`}
                              value={
                                item.variantId
                              }
                              onChange={(
                                event
                              ) =>
                                updateReplacementItem(
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
                            htmlFor={`change-product-quantity-${index}`}
                          >
                            Quantity
                          </label>

                          <input
                            id={`change-product-quantity-${index}`}
                            type="number"
                            min="1"
                            step="1"
                            inputMode="numeric"
                            value={
                              item.quantity
                            }
                            onChange={(
                              event
                            ) =>
                              updateReplacementItem(
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
                            {getReplacementLineTotal(
                              item
                            ).toFixed(
                              2
                            )}
                          </strong>
                        </div>
                      </div>

                      <div className="change-product-replacement-note">
                        <span>
                          Delivery
                        </span>

                        <strong>
                          New units will be
                          pending delivery.
                        </strong>
                      </div>
                    </div>
                  )
                }
              )}
            </div>

            <button
              type="button"
              className="secondary-button additional-purchase-add-button"
              onClick={
                addReplacementItem
              }
              disabled={submitting}
            >
              <Plus
                size={16}
                strokeWidth={2}
              />
              Add another replacement
            </button>

            <div className="additional-purchase-summary">
              <span>
                Replacement total
              </span>

              <strong>
                GHS{" "}
                {replacementTotal.toFixed(
                  2
                )}
              </strong>
            </div>

            <div className="change-product-adjustment">
              <span>
                Price difference
              </span>

              <strong>
                {isNoAdjustment
                  ? "No adjustment"
                  : requiresTopUp
                    ? `+ GHS ${difference.toFixed(2)}`
                    : `- GHS ${Math.abs(difference).toFixed(2)}`}
              </strong>
            </div>

            {requiresTopUp && (
              <div className="additional-purchase-payment">
                <div className="form-field">
                  <label htmlFor="change-product-cash-amount">
                    Cash amount
                  </label>

                  <input
                    id="change-product-cash-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={cashAmount}
                    onChange={(event) =>
                      setCashAmount(
                        event.target.value
                      )
                    }
                    disabled={
                      submitting
                    }
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="change-product-momo-amount">
                    MoMo amount
                  </label>

                  <input
                    id="change-product-momo-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={momoAmount}
                    onChange={(event) =>
                      setMomoAmount(
                        event.target.value
                      )
                    }
                    disabled={
                      submitting
                    }
                  />
                </div>

                <div
                  className={`payment-check ${
                    topUpMatches
                      ? "complete"
                      : ""
                  }`}
                >
                  <span>
                    Top-up
                  </span>

                  <strong>
                    GHS{" "}
                    {topUpEntered.toFixed(
                      2
                    )}
                    {" / "}
                    {difference.toFixed(
                      2
                    )}
                  </strong>
                </div>

                {topUpEntered > 0 &&
                  !topUpMatches && (
                    <div className="form-error">
                      Cash and MoMo must total
                      GHS{" "}
                      {difference.toFixed(
                        2
                      )}
                      .
                    </div>
                  )}
              </div>
            )}

            {requiresRefund && (
              <div className="payment-check">
                <span>
                  Cash refund
                </span>

                <strong>
                  GHS{" "}
                  {Math.abs(
                    difference
                  ).toFixed(2)}
                </strong>
              </div>
            )}

            {isNoAdjustment && (
              <div className="payment-check complete">
                <span>
                  Price adjustment
                </span>

                <strong>
                  No adjustment
                </strong>
              </div>
            )}
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
              loadingProducts
            }
          >
            {submitting
              ? "Exchanging..."
              : "Exchange Product"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChangeProductModal