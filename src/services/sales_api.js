import apiClient from "./api_client"

export function getSales() {
  return apiClient.get("/sales/")
}

export function searchSales(searchTerm) {
  const params = new URLSearchParams()
  params.set("student_number", searchTerm)

  return apiClient
    .get(`/sales/?${params.toString()}`)
    .catch((error) => {
      if (error.message !== "Sale not found.") {
        throw error
      }

      params.set("student_number", "")
      params.set("student_name", searchTerm)

      return apiClient.get(
        `/sales/?${params.toString()}`
      )
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