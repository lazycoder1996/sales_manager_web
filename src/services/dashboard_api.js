import apiClient from "./api_client"

export function getDashboard() {
  return apiClient.get("/dashboard/")
}