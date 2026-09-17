import apiClient from "./api_client"

export function getStudents({
  first = 50,
  after = "",
  search = "",
} = {}) {
  const params = new URLSearchParams()

  params.set("first", first)

  if (after) {
    params.set("after", after)
  }

  if (search) {
    params.set("search", search)
  }

  return apiClient.get(
    `/students/?${params.toString()}`
  )
}

export function getStudent(studentId) {
  return apiClient.get(
    `/students/${studentId}/`
  )
}

export function createStudent(data) {
  return apiClient.post(
    "/students/",
    data
  )
}

export function updateStudent(
  studentId,
  data
) {
  return apiClient.patch(
    `/students/${studentId}/`,
    data
  )
}

export function deactivateStudent(studentId) {
  return apiClient.delete(
    `/students/${studentId}/`
  )
}