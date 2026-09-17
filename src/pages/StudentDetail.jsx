import { useEffect, useState } from "react"
import {
  ArrowLeft,
  Edit3,
  UserRound,
  UserX,
} from "lucide-react"
import {
  useNavigate,
  useParams,
} from "react-router-dom"

import {
  getStudent,
  deactivateStudent,
} from "../services/students_api"

import { formatDate } from "../utils/date"


function StudentDetail() {
  const navigate = useNavigate()
  const { studentId } = useParams()

  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [deactivating, setDeactivating] =
    useState(false)
  const [showDeactivateConfirm, setShowDeactivateConfirm] =
    useState(false)

  useEffect(() => {
    loadStudent()
  }, [studentId])


  async function loadStudent() {
    try {
      setLoading(true)
      setError("")

      const data = await getStudent(studentId)

      setStudent(data)
    } catch (error) {
      setError(
        error.message ||
        "Failed to load student."
      )
    } finally {
      setLoading(false)
    }
  }


  function getStudentName() {
    if (!student) {
      return ""
    }

    return [
      student.firstname,
      student.middlename,
      student.surname,
    ]
      .filter(Boolean)
      .join(" ")
  }


  async function handleDeactivate() {
    try {
      setDeactivating(true)
      setError("")

      await deactivateStudent(studentId)

      navigate("/students")
    } catch (error) {
      setError(
        error.message ||
        "Failed to deactivate student."
      )

      setDeactivating(false)
      setShowDeactivateConfirm(false)
    }
  }


  if (loading) {
    return (
      <section className="page-content">
        <div className="empty-state">
          <div className="empty-state-icon">
            <UserRound
              size={22}
              strokeWidth={2}
            />
          </div>

          <h5>
            Loading student...
          </h5>

          <p>
            Getting the student's details.
          </p>
        </div>
      </section>
    )
  }


  if (error || !student) {
    return (
      <section className="page-content">
        <div className="empty-state">

          <div className="empty-state-icon">
            !
          </div>

          <h5>
            Unable to load student
          </h5>

          <p>
            {error || "Student not found."}
          </p>

          <button
            className="secondary-button"
            onClick={() =>
              navigate("/students")
            }
          >
            <ArrowLeft size={16} />
            Back to Students
          </button>

        </div>
      </section>
    )
  }


  return (
    <section className="page-content">

      <div className="page-heading">

        <div>
          <p className="eyebrow">
            Student management
          </p>

          <h3>
            {getStudentName()}
          </h3>

          <p className="page-description">
            View and manage this student's
            registered information.
          </p>
        </div>


        <div className="page-heading-actions">

          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              navigate("/students")
            }
          >
            <ArrowLeft size={16} />
            Back
          </button>


          <button
            type="button"
            className="primary-button"
            onClick={() =>
              navigate(
                `/students/${student.id}/edit`
              )
            }
          >
            <Edit3 size={16} />
            Edit Student
          </button>

        </div>

      </div>


      {error && (
        <div className="form-error">
          {error}
        </div>
      )}


      <div className="student-detail-grid">

        <div className="student-detail-card">

          <div className="student-detail-card-header">

            <div className="student-detail-avatar">
              <UserRound
                size={21}
                strokeWidth={2}
              />
            </div>

            <div>
              <h4>
                Student information
              </h4>

              <p>
                Basic student details
              </p>
            </div>

          </div>


          <div className="student-detail-fields">

            <div className="student-detail-field">
              <span>Firstname</span>
              <strong>
                {student.firstname}
              </strong>
            </div>


            <div className="student-detail-field">
              <span>Middlename</span>
              <strong>
                {student.middlename || "—"}
              </strong>
            </div>


            <div className="student-detail-field">
              <span>Surname</span>
              <strong>
                {student.surname}
              </strong>
            </div>


            <div className="student-detail-field">
              <span>Admission number</span>
              <strong>
                {student.admission_number || "—"}
              </strong>
            </div>


            <div className="student-detail-field">
              <span>Date of birth</span>
              <strong>
                {formatDate(
                  student.date_of_birth
                )}
              </strong>
            </div>

          </div>

        </div>


        <div className="student-detail-card">

          <div className="student-detail-card-header">

            <div className="student-detail-avatar">
              <UserRound
                size={21}
                strokeWidth={2}
              />
            </div>

            <div>
              <h4>
                Residential information
              </h4>

              <p>
                House and residence
              </p>
            </div>

          </div>


          <div className="student-detail-fields">

            <div className="student-detail-field">
              <span>Residence</span>
              <strong>
                {student.residence}
              </strong>
            </div>


            <div className="student-detail-field">
              <span>House</span>
              <strong>
                {student.house_name}
              </strong>
            </div>


            <div className="student-detail-field">
              <span>House code</span>
              <strong>
                {student.house_code}
              </strong>
            </div>

          </div>

        </div>


        <div className="student-detail-card">

          <div className="student-detail-card-header">

            <div className="student-detail-avatar">
              <UserRound
                size={21}
                strokeWidth={2}
              />
            </div>

            <div>
              <h4>
                Parent details
              </h4>

              <p>
                Parent and guardian information
              </p>
            </div>

          </div>


          <div className="student-detail-fields">

            <div className="student-detail-field">
              <span>Father's name</span>
              <strong>
                {student.fathers_name || "—"}
              </strong>
            </div>


            <div className="student-detail-field">
              <span>Father's contact</span>
              <strong>
                {student.fathers_contact || "—"}
              </strong>
            </div>


            <div className="student-detail-field">
              <span>Mother's name</span>
              <strong>
                {student.mothers_name || "—"}
              </strong>
            </div>


            <div className="student-detail-field">
              <span>Mother's contact</span>
              <strong>
                {student.mothers_contact || "—"}
              </strong>
            </div>

          </div>

        </div>


        <div className="student-detail-card student-detail-danger-card">

          <div className="student-detail-card-header">

            <div className="student-detail-danger-avatar">
              <UserX
                size={21}
                strokeWidth={2}
              />
            </div>

            <div>
              <h4>
                Student status
              </h4>

              <p>
                Manage this student's registry status.
              </p>
            </div>

          </div>


          <div className="student-detail-status-content">

            <div>
              <span className="student-status-label">
                Current status
              </span>

              <strong className="student-status-active">
                Active
              </strong>
            </div>


            <button
              type="button"
              className="danger-button"
              onClick={() =>
                setShowDeactivateConfirm(true)
              }
            >
              <UserX size={16} />
              Deactivate Student
            </button>

          </div>

        </div>

      </div>


      {showDeactivateConfirm && (
        <div className="student-confirm-overlay">

          <div className="student-confirm-modal">

            <div className="student-confirm-icon">
              <UserX
                size={22}
                strokeWidth={2}
              />
            </div>

            <h4>
              Deactivate student?
            </h4>

            <p>
              This will remove{" "}
              <strong>
                {getStudentName()}
              </strong>{" "}
              from the active student registry.
              The student's record will not be
              permanently deleted.
            </p>

            <div className="student-confirm-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setShowDeactivateConfirm(false)
                }
                disabled={deactivating}
              >
                Cancel
              </button>

              <button
                type="button"
                className="danger-button"
                onClick={handleDeactivate}
                disabled={deactivating}
              >
                {deactivating
                  ? "Deactivating..."
                  : "Deactivate Student"}
              </button>

            </div>

          </div>

        </div>
      )}

    </section>
  )
}

export default StudentDetail