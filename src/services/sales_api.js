import apiClient from "./api_client"

export function getSales({
  first = 50,
  after = "",
  search = "",
  date = "",
  dateFrom = "",
  dateTo = "",
} = {}) {
  const params = new URLSearchParams()

  params.set("first", first)

  if (after) {
    params.set("after", after)
  }

  if (search) {
    params.set("search", search)
  }

  if (date) {
    params.set("date", date)
  }

  if (dateFrom) {
    params.set("date_from", dateFrom)
  }

  if (dateTo) {
    params.set("date_to", dateTo)
  }

  return apiClient.get(
    `/sales/?${params.toString()}`
  )
}

export function searchSales(
  searchTerm,
  options = {}
) {
  return getSales({
    ...options,
    search: searchTerm,
  })
}

export function getSale(saleId) {
  return apiClient.get(`/sales/${saleId}/`)
}

export function createSale(data) {
  return apiClient.post("/sales/", data)
}

export function createSaleLine(
  saleId,
  data
) {
  return apiClient.post(
    `/sales/${saleId}/lines/`,
    data
  )
}

export function updateSaleLine(
  saleId,
  lineId,
  data
) {
  return apiClient.patch(
    `/sales/${saleId}/lines/${lineId}/`,
    data
  )
}

export function changeSaleLineProduct(
  saleId,
  lineId,
  data
) {
  return apiClient.post(
    `/sales/${saleId}/lines/${lineId}/change-product/`,
    data
  )
}

export function returnSaleLine(
  saleId,
  lineId,
  data = { confirm: true }
) {
  return apiClient.post(
    `/sales/${saleId}/lines/${lineId}/return/`,
    data
  )
}

export function completeSale(data) {
  return apiClient.post(
    "/sales/complete/",
    data
  )
}

export function deliverSale(
  saleId,
  data
) {
  return apiClient.post(
    `/sales/${saleId}/deliver/`,
    data
  )
}

export function undeliverSale(
  saleId,
  data
) {
  return apiClient.post(
    `/sales/${saleId}/undeliver/`,
    data
  )
}

export function getProductVariants(
  productId
) {
  return apiClient.get(
    `/products/${productId}/variants/`
  )
}

export function createAdditionalPurchase(
  saleId,
  data
) {
  return apiClient.post(
    `/sales/${saleId}/purchases/`,
    data
  )
}