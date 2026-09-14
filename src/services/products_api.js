import apiClient from "./api_client"

export function getProducts() {
  return apiClient.get("/products/")
}

export function getProduct(productId) {
  return apiClient.get(
    `/products/${productId}/`
  )
}

export function createProduct(data) {
  return apiClient.post(
    "/products/",
    data
  )
}

export function updateProduct(
  productId,
  data
) {
  return apiClient.patch(
    `/products/${productId}/`,
    data
  )
}

export function getProductVariants(productId) {
  return apiClient.get(
    `/products/${productId}/variants/`
  )
}

export function createProductVariant(
  productId,
  data
) {
  return apiClient.post(
    `/products/${productId}/variants/`,
    data
  )
}

export function activateProductVariant(
  productId,
  variantId
) {
  return apiClient.post(
    `/products/${productId}/variants/${variantId}/activate/`
  )
}

export function deactivateProductVariant(
  productId,
  variantId
) {
  return apiClient.post(
    `/products/${productId}/variants/${variantId}/deactivate/`
  )
}