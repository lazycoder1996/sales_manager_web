import apiClient from "./api_client"

export function getSellerPayments(
  sellerId = null
) {
  const query = sellerId
    ? `?seller=${sellerId}`
    : ""

  return apiClient.get(
    `/seller-payments/${query}`
  )
}

export function getSellerPayment(paymentId) {
  return apiClient.get(
    `/seller-payments/${paymentId}/`
  )
}

export function createSellerPayment(data) {
  return apiClient.post(
    "/seller-payments/",
    data
  )
}