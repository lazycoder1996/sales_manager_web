import apiClient from "./api_client"

export function getDashboard() {
  return apiClient.get("/dashboard/")
}

export function getTodaysSales() {
  return apiClient.get(
    "/dashboard/todays-sales/"
  )
}