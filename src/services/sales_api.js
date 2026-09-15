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

export function createAdditionalPurchase(
  saleId,
  data
) {
  return apiClient.post(
    `/sales/${saleId}/purchases/`,
    data
  )
}