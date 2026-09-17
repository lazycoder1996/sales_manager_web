import { useEffect, useState } from "react"
import {
  Plus,
  Search,
  UserRound,
  Hash,
  Home,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import {
  getStudents,
} from "../services/students_api"


function Students() {
  const navigate = useNavigate()

  const [students, setStudents] = useState([])
  const [pageInfo, setPageInfo] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState("")


  useEffect(() => {
    const timeout = setTimeout(() => {
      loadStudents()
    }, 400)

    return () => clearTimeout(timeout)
  }, [searchTerm])


  async function loadStudents() {
    try {
      setLoading(true)
      setError("")

      const data = await getStudents({
        first: 50,
        search: searchTerm,
      })

      setStudents(
        data.edges.map(
          (edge) => edge.node
        )
      )

      setPageInfo(data.page_info)
    } catch (error) {
      setError(
        error.message ||
        "Failed to load students."
      )
    } finally {
      setLoading(false)
    }
  }


  async function loadMore() {
    if (
      loadingMore ||
      !pageInfo?.has_next_page
    ) {
      return
    }

    try {
      setLoadingMore(true)
      setError("")

      const data = await getStudents({
        first: 50,
        after: pageInfo.end_cursor,
        search: searchTerm,
      })

      const newStudents =
        data.edges.map(
          (edge) => edge.node
        )

      setStudents((current) => [
        ...current,
        ...newStudents,
      ])

      setPageInfo(data.page_info)
    } catch (error) {
      setError(
        error.message ||
        "Failed to load more students."
      )
    } finally {
      setLoadingMore(false)
    }
  }


  function getStudentName(student) {
    return [
      student.firstname,
      student.middlename,
      student.surname,
    ]
      .filter(Boolean)
      .join(" ") || "Unnamed student"
  }


  return (
    <section className="page-content">

      <div className="page-heading">
        <div>
          <p className="eyebrow">
            Student management
          </p>

          <h3>Students</h3>

          <p className="page-description">
            Manage your registered students
            and their details.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() =>
            navigate("/students/new")
          }
        >
          <Plus
            size={17}
            strokeWidth={2.2}
          />

          Register Student
        </button>
      </div>


      <div className="students-toolbar">

        <div className="students-search">
          <Search
            size={18}
            strokeWidth={2}
          />

          <input
            type="text"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
            placeholder="Search students..."
          />
        </div>

        {!loading && !error && (
          <span className="students-count">
            {students.length}{" "}
            {students.length === 1
              ? "student"
              : "students"}
          </span>
        )}

      </div>


      <div className="students-list-card">

        {loading && (
          <div className="empty-state">

            <div className="empty-state-icon">
              <UserRound
                size={22}
                strokeWidth={2}
              />
            </div>

            <h5>
              Loading students...
            </h5>

            <p>
              Getting the latest students
              from the server.
            </p>

          </div>
        )}


        {!loading && error && (
          <div className="empty-state">

            <div className="empty-state-icon">
              !
            </div>

            <h5>
              Unable to load students
            </h5>

            <p>{error}</p>

            <button
              className="secondary-button"
              onClick={loadStudents}
            >
              Try again
            </button>

          </div>
        )}


        {!loading &&
          !error &&
          students.length === 0 && (
            <div className="empty-state">

              <div className="empty-state-icon">
                <UserRound
                  size={22}
                  strokeWidth={2}
                />
              </div>

              <h5>
                {searchTerm
                  ? "No students found"
                  : "No students yet"}
              </h5>

              <p>
                {searchTerm
                  ? "Try another student name or admission number."
                  : "Register your first student to get started."}
              </p>

              {!searchTerm && (
                <button
                  className="primary-button"
                  onClick={() =>
                    navigate(
                      "/students/new"
                    )
                  }
                >
                  <Plus
                    size={17}
                    strokeWidth={2.2}
                  />

                  Register First Student
                </button>
              )}

            </div>
          )}


        {!loading &&
          !error &&
          students.length > 0 && (
            <div className="students-grid">

              {students.map((student) => (
                <button
                  className="student-card"
                  key={student.id}
                  onClick={() =>
                    navigate(
                      `/students/${student.id}`
                    )
                  }
                >

                  <div className="student-card-header">

                    <div className="student-icon">
                      <UserRound
                        size={18}
                        strokeWidth={2}
                      />
                    </div>

                    <strong>
                      {getStudentName(
                        student
                      )}
                    </strong>

                  </div>


                  <div className="student-card-details">

                    <div className="student-detail">
                      <Hash
                        size={15}
                        strokeWidth={2}
                      />

                      <div>
                        <span>
                          Admission
                        </span>

                        <strong>
                          {student.admission_number ||
                            "—"}
                        </strong>
                      </div>
                    </div>


                    <div className="student-detail">
                      <Home
                        size={15}
                        strokeWidth={2}
                      />

                      <div>
                        <span>
                          House
                        </span>

                        <strong>
                          {student.house_name ||
                            "—"}
                        </strong>
                      </div>
                    </div>

                  </div>

                </button>
              ))}

            </div>
          )}


        {!loading &&
          !error &&
          students.length > 0 &&
          pageInfo?.has_next_page && (
            <div className="students-load-more">

              <button
                className="secondary-button"
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore
                  ? "Loading..."
                  : "Load More"}
              </button>

            </div>
          )}

      </div>

    </section>
  )
}

export default Students