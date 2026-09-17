import apiClient from "./api_client"

export function getHouses() {
  return apiClient.get("/houses/")
}