import apiClient from "./api_client"

export function getStockBalance(params = {}) {
  const searchParams = new URLSearchParams()

  if (params.product) {
    searchParams.set(
      "product",
      params.product
    )
  }

  if (params.variant) {
    searchParams.set(
      "variant",
      params.variant
    )
  }

  const queryString =
    searchParams.toString()

  return apiClient.get(
    queryString
      ? `/stock-balance/?${queryString}`
      : "/stock-balance/"
  )
}

export function getStockDetail(
  productId,
  variantId = null
) {
  const searchParams = new URLSearchParams()

  searchParams.set(
    "product",
    productId
  )

  if (variantId) {
    searchParams.set(
      "variant",
      variantId
    )
  }

  return apiClient.get(
    `/stock-detail/?${searchParams.toString()}`
  )
}

export function getStockReceipts() {
  return apiClient.get(
    "/stock-receipts/"
  )
}

export function getStockReceipt(
  receiptId
) {
  return apiClient.get(
    `/stock-receipts/${receiptId}/`
  )
}

export function createStockReceipt(
  data
) {
  return apiClient.post(
    "/stock-receipts/",
    data
  )
}

export function updateStockReceipt(
  receiptId,
  data
) {
  return apiClient.patch(
    `/stock-receipts/${receiptId}/`,
    data
  )
}
