import { useEffect, useState } from "react"
import { ArrowLeft } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"

import {
  getStudent,
  updateStudent,
} from "../services/students_api"
import { getHouses } from "../services/houses_api"


function EditStudent() {
  const navigate = useNavigate()
  const { studentId } = useParams()

  const [houses, setHouses] = useState([])
  const [housesLoading, setHousesLoading] = useState(true)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    admission_number: "",
    firstname: "",
    middlename: "",
    surname: "",
    fathers_name: "",
    fathers_contact: "",
    mothers_name: "",
    mothers_contact: "",
    residence: "",
    date_of_birth: "",
    house: "",
  })

  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)


  useEffect(() => {
    loadData()
  }, [studentId])


  async function loadData() {
    try {
      setLoading(true)
      setError("")

      const [
        student,
        houses,
      ] = await Promise.all([
        getStudent(studentId),
        getHouses(),
      ])

      setFormData({
        admission_number:
          student.admission_number || "",

        firstname:
          student.firstname || "",

        middlename:
          student.middlename || "",

        surname:
          student.surname || "",

        fathers_name:
          student.fathers_name || "",

        fathers_contact:
          student.fathers_contact || "",

        mothers_name:
          student.mothers_name || "",

        mothers_contact:
          student.mothers_contact || "",

        residence:
          student.residence || "",

        date_of_birth:
          student.date_of_birth || "",

        house:
          student.house || "",
      })

      setHouses(houses)
    } catch (error) {
      setError(
        error.message ||
        "Failed to load student."
      )
    } finally {
      setLoading(false)
      setHousesLoading(false)
    }
  }


  function handleChange(event) {
    const {
      name,
      value,
    } = event.target

    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }


  async function handleSubmit(event) {
    event.preventDefault()

    setError("")

    try {
      setSaving(true)

      const data = {
        admission_number:
          formData.admission_number.trim()
            ? formData.admission_number.trim()
            : null,

        firstname:
          formData.firstname.trim(),

        middlename:
          formData.middlename.trim()
            ? formData.middlename.trim()
            : null,

        surname:
          formData.surname.trim(),

        fathers_name:
          formData.fathers_name.trim()
            ? formData.fathers_name.trim()
            : null,

        fathers_contact:
          formData.fathers_contact.trim()
            ? formData.fathers_contact.trim()
            : null,

        mothers_name:
          formData.mothers_name.trim()
            ? formData.mothers_name.trim()
            : null,

        mothers_contact:
          formData.mothers_contact.trim()
            ? formData.mothers_contact.trim()
            : null,

        residence:
          formData.residence.trim(),

        date_of_birth:
          formData.date_of_birth,

        house:
          formData.house,
      }

      await updateStudent(
        studentId,
        data
      )

      navigate(
        `/students/${studentId}`
      )
    } catch (error) {
      setError(
        error.message ||
        "Failed to update student."
      )
    } finally {
      setSaving(false)
    }
  }


  if (loading) {
    return (
      <section className="page-content">

        <div className="empty-state">
          <h5>
            Loading student...
          </h5>

          <p>
            Getting the student's information.
          </p>
        </div>

      </section>
    )
  }


  if (error && !formData.firstname) {
    return (
      <section className="page-content">

        <div className="empty-state">

          <h5>
            Unable to load student
          </h5>

          <p>
            {error}
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
            Edit Student
          </h3>

          <p className="page-description">
            Update this student's registered
            information.
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={() =>
            navigate(
              `/students/${studentId}`
            )
          }
        >
          <ArrowLeft size={16} />

          Back to Student
        </button>

      </div>


      {error && (
        <div className="form-error">
          {error}
        </div>
      )}


      <form
        className="student-form-card"
        onSubmit={handleSubmit}
      >

        <div className="student-form">

          <div className="student-form-section">

            <div className="student-form-section-header">
              <h4>
                Student details
              </h4>

              <p>
                Basic information about the student.
              </p>
            </div>


            <div className="student-form-grid">

              <div className="form-field">
                <label htmlFor="admission_number">
                  Admission number
                </label>

                <input
                  id="admission_number"
                  name="admission_number"
                  value={formData.admission_number}
                  onChange={handleChange}
                />
              </div>


              <div className="form-field">
                <label htmlFor="firstname">
                  Firstname
                  <span>*</span>
                </label>

                <input
                  id="firstname"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  required
                />
              </div>


              <div className="form-field">
                <label htmlFor="middlename">
                  Middlename
                </label>

                <input
                  id="middlename"
                  name="middlename"
                  value={formData.middlename}
                  onChange={handleChange}
                />
              </div>


              <div className="form-field">
                <label htmlFor="surname">
                  Surname
                  <span>*</span>
                </label>

                <input
                  id="surname"
                  name="surname"
                  value={formData.surname}
                  onChange={handleChange}
                  required
                />
              </div>


              <div className="form-field">
                <label htmlFor="date_of_birth">
                  Date of birth
                  <span>*</span>
                </label>

                <input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

          </div>


          <div className="student-form-section">

            <div className="student-form-section-header">
              <h4>
                Residential details
              </h4>

              <p>
                Where the student lives and their
                assigned house.
              </p>
            </div>


            <div className="student-form-grid">

              <div className="form-field">
                <label htmlFor="residence">
                  Residence
                  <span>*</span>
                </label>

                <input
                  id="residence"
                  name="residence"
                  value={formData.residence}
                  onChange={handleChange}
                  required
                />
              </div>


              <div className="form-field">
                <label htmlFor="house">
                  House
                  <span>*</span>
                </label>

                <select
                  id="house"
                  name="house"
                  value={formData.house}
                  onChange={handleChange}
                  required
                  disabled={housesLoading}
                >
                  <option value="">
                    {housesLoading
                      ? "Loading houses..."
                      : "Select house"}
                  </option>

                  {houses.map((house) => (
                    <option
                      key={house.id}
                      value={house.id}
                    >
                      {house.name} ({house.code})
                    </option>
                  ))}
                </select>
              </div>

            </div>

          </div>


          <div className="student-form-section">

            <div className="student-form-section-header">
              <h4>
                Parent details
              </h4>

              <p>
                Optional parent and guardian
                contact information.
              </p>
            </div>


            <div className="student-form-grid">

              <div className="form-field">
                <label htmlFor="fathers_name">
                  Father's name
                </label>

                <input
                  id="fathers_name"
                  name="fathers_name"
                  value={formData.fathers_name}
                  onChange={handleChange}
                />
              </div>


              <div className="form-field">
                <label htmlFor="fathers_contact">
                  Father's contact
                </label>

                <input
                  id="fathers_contact"
                  name="fathers_contact"
                  value={formData.fathers_contact}
                  onChange={handleChange}
                />
              </div>


              <div className="form-field">
                <label htmlFor="mothers_name">
                  Mother's name
                </label>

                <input
                  id="mothers_name"
                  name="mothers_name"
                  value={formData.mothers_name}
                  onChange={handleChange}
                />
              </div>


              <div className="form-field">
                <label htmlFor="mothers_contact">
                  Mother's contact
                </label>

                <input
                  id="mothers_contact"
                  name="mothers_contact"
                  value={formData.mothers_contact}
                  onChange={handleChange}
                />
              </div>

            </div>

          </div>


          <div className="student-form-actions">

            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                navigate(
                  `/students/${studentId}`
                )
              }
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={
                saving ||
                housesLoading
              }
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>

        </div>

      </form>

    </section>
  )
}

export default EditStudent