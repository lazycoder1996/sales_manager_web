import apiClient from "./api_client"

export function getSales({
  first = 50,
  after = "",
} = {}) {
  const params = new URLSearchParams()

  params.set("first", first)

  if (after) {
    params.set("after", after)
  }

  return apiClient.get(
    `/sales/?${params.toString()}`
  )
}

export function searchSales(searchTerm) {
  const params = new URLSearchParams()
  params.set("search", searchTerm)

  return apiClient.get(
    `/sales/?${params.toString()}`
  )
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