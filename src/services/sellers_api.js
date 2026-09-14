import apiClient from "./api_client"

export function getSellers() {
  return apiClient.get("/sellers/")
}

export function getSeller(sellerId) {
  return apiClient.get(
    `/sellers/${sellerId}/`
  )
}

export function createSeller(data) {
  return apiClient.post(
    "/sellers/",
    data
  )
}

export function updateSeller(
  sellerId,
  data
) {
  return apiClient.patch(
    `/sellers/${sellerId}/`,
    data
  )
}