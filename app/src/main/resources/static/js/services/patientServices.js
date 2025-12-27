// patientServices
import { API_BASE_URL } from "../config/config.js";
const PATIENT_API = API_BASE_URL + '/patient'


//For creating a patient in db
export async function patientSignup(data) {
  try {
    const response = await fetch(`${PATIENT_API}`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify(data)
      }
    );
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message);
    }
    return { success: response.ok, message: result.message }
  }
  catch (error) {
    console.error("Error :: patientSignup :: ", error)
    return { success: false, message: error.message }
  }
}

//For logging in patient
export async function patientLogin(data) {
  console.log("patientLogin :: ", data)
  return await fetch(`${PATIENT_API}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
}

window.patientLoginHandler = async function (event) {
    if (event) event.preventDefault();

    try {
        // Step 1: Get values from input fields
        const identifier = document.getElementById('patientEmail').value;
        const password = document.getElementById('patientPassword').value;
       console.log("patient", identifier)

        // Step 2: Create patient object
        const patient = { identifier, password };
        console.log("password", password)


        // Step 3: Send POST request
        const response = await fetch(`${PATIENT_API}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(patient)
        });

        // Step 4: Handle success
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('userRole', 'loggedPatient');

            if (typeof selectRole === 'function') {
                selectRole('loggedPatient');
            }
        } else {
            // Step 5: Handle failure
            alert("Invalid credentials!");
        }
    } catch (error) {
        // Step 6: Graceful error handling
        console.error("Patient Login Error:", error);
        alert("A server error occurred.");
    }
};

// For getting patient data (name ,id , etc ). Used in booking appointments
export async function getPatientData(token) {
  try {
    const response = await fetch(`${PATIENT_API}/${token}`);
    const data = await response.json();
    if (response.ok) return data.patient;
    return null;
  } catch (error) {
    console.error("Error fetching patient details:", error);
    return null;
  }
}

// the Backend API for fetching the patient record(visible in Doctor Dashboard) and Appointments (visible in Patient Dashboard) are same based on user(patient/doctor).
export async function getPatientAppointments(id, token) {
  try {
    const response = await fetch(`${PATIENT_API}/${id}/${token}`);
    const data = await response.json();
    console.log(data.appointments)
    if (response.ok) {
      return data.appointments;
    }
    return null;
  }
  catch (error) {
    console.error("Error fetching patient details:", error);
    return null;
  }
}

export async function filterAppointments(condition, name, token) {
  try {
    const response = await fetch(`${PATIENT_API}/filter/${condition}/${name}/${token}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
       console.log(data)
      return data;

    } else {
      console.error("Failed to fetch doctors:", response.statusText);
      return { appointments: [] };

    }
  } catch (error) {
    console.error("Error:", error);
    alert("Something went wrong!");
    return { appointments: [] };
  }
}
