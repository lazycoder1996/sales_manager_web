const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api"

async function request(endpoint, options = {}) {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    }
  )

  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || "Something went wrong."
    )
  }

  return data.data
}

const apiClient = {
  get(endpoint) {
    return request(endpoint)
  },

  post(endpoint, body) {
    return request(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    })
  },

  patch(endpoint, body) {
    return request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
    })
  },

  delete(endpoint) {
    return request(endpoint, {
      method: "DELETE",
    })
  },
}

export default apiClient