/**
 * Doctor Card Component
 * Creates a dynamic card displaying doctor information with role-specific actions
 *
 * Dependencies:
 * - deleteDoctor() from '/js/services/doctorServices.js'
 * - getPatientData() from '/js/services/patientServices.js'
 * - showBookingOverlay() from '/js/loggedPatient.js' (NO)
 */

import { deleteDoctor } from '/js/services/doctorServices.js';
import { getPatientData } from '/js/services/patientServices.js';
// import { showBookingOverlay } from '/js/loggedPatient.js';
import { bookAppointment } from '/js/services/appointmentRecordService.js';

/**
 * Creates and returns a doctor card element with role-specific functionality
 * @param {Object} doctor - Doctor object containing:
 *   @property {string} id - Doctor's unique ID
 *   @property {string} name - Doctor's full name
 *   @property {string} specialty - Medical specialty
 *   @property {string} email - Contact email
 *   @property {string[]} availableTimes - Array of available time slots
 * @returns {HTMLElement} Fully constructed doctor card element
 */
export function createDoctorCard(doctor) {
    // Validate doctor object
    if (!doctor || typeof doctor !== 'object') {
        console.error('Invalid doctor data provided');
        return document.createElement('div'); // Return empty div as fallback
    }

    // Create card container
    const card = document.createElement('div');
    card.className = 'doctor-card';
    card.dataset.doctorId = doctor.id;

    // Get current user role
    const role = localStorage.getItem('userRole') || 'guest';

    // Create information section
    const infoSection = createInfoSection(doctor);

    // Create actions section based on role
    const actionsSection = createActionsSection(doctor, role);

    // Assemble card
    card.append(infoSection, actionsSection);
    return card;
}

/**
 * Creates the information section of the doctor card
 * @param {Object} doctor - Doctor data
 * @returns {HTMLElement} Information section element
 */
function createInfoSection(doctor) {
    const infoDiv = document.createElement('div');
    infoDiv.className = 'doctor-info';

    const elements = [
        createElement('h3', 'doctor-name', doctor.name),
        createElement('p', 'doctor-specialty', `Specialty: ${doctor.specialty}`),
        createElement('p', 'doctor-email', `Email: ${doctor.email}`),
        createElement('p', 'doctor-availability',
            `Available: ${formatAvailability(doctor.availableTimes)}`)
    ];

    infoDiv.append(...elements);
    return infoDiv;
}

/**
 * Creates the actions section based on user role
 * @param {Object} doctor - Doctor data
 * @param {string} role - User role
 * @returns {HTMLElement} Actions section element
 */
function createActionsSection(doctor, role) {
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'card-actions';

    switch (role) {
        case 'admin':
            actionsDiv.appendChild(createDeleteButton(doctor));
            break;
        case 'loggedPatient':
            actionsDiv.appendChild(createBookButton(doctor, true));
            break;
        case 'patient':
            actionsDiv.appendChild(createBookButton(doctor, false));
            break;
        default:
            // No actions for guests
            break;
    }

    return actionsDiv;
}

/**
 * Creates a standardized DOM element
 * @param {string} tag - Element tag name
 * @param {string} className - CSS class name
 * @param {string} text - Text content
 * @returns {HTMLElement} Created element
 */
function createElement(tag, className, text) {
    const el = document.createElement(tag);
    el.className = className;
    el.textContent = text;
    return el;
}

/**
 * Formats availability times for display
 * @param {string[]} times - Array of time slots
 * @returns {string} Formatted availability string
 */
function formatAvailability(times) {
    return Array.isArray(times) ? times.join(', ') : 'Not available';
}

/**
 * Creates a delete button (admin only)
 * @param {Object} doctor - Doctor data
 * @returns {HTMLButtonElement} Configured delete button
 */
function createDeleteButton(doctor) {
    const button = document.createElement('button');
    button.className = 'btn btn-danger';
    button.textContent = 'Delete';

    button.addEventListener('click', async () => {
        if (!confirm(`Permanently delete Dr. ${doctor.name}?`)) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Authentication required');

            await deleteDoctor(doctor.id, token);
            button.closest('.doctor-card').remove();
        } catch (error) {
            console.error('Delete failed:', error.message);
            alert(`Delete failed: ${error.message}`);
        }
    });

    return button;
}

/**
 * Creates a book appointment button
 * @param {Object} doctor - Doctor data
 * @param {boolean} isLoggedIn - Whether user is authenticated
 * @returns {HTMLButtonElement} Configured book button
 */
function createBookButton(doctor, isLoggedIn) {
    const button = document.createElement('button');
    button.className = 'btn btn-primary';
    button.textContent = 'Book Now';

    button.addEventListener('click', async (event) => {  // Add event parameter
        if (!isLoggedIn) {
            alert('Please login to book an appointment');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Session expired');

            const patientData = await getPatientData(token);
            showBookingOverlay(event, doctor, patientData);  // Pass event first
        } catch (error) {
            console.error('Booking error:', error.message);
            alert(`Booking failed: ${error.message}`);
        }
    });

    return button;
}

function showBookingOverlay(e, doctor, patient) {
  const button = e.target;
  const rect = button.getBoundingClientRect();
  console.log(patient.name)
  console.log(patient)
  const ripple = document.createElement("div");
  ripple.classList.add("ripple-overlay");
  ripple.style.left = `${e.clientX}px`;
  ripple.style.top = `${e.clientY}px`;
  document.body.appendChild(ripple);

  setTimeout(() => ripple.classList.add("active"), 50);

  const modalApp = document.createElement("div");
  modalApp.classList.add("modalApp");

  modalApp.innerHTML = `
    <span class="close" id="closeModal">&times;</span>
    <h2>Book Appointment</h2>
    <input class="input-field" type="text" value="${patient.name}" disabled />
    <input class="input-field" type="text" value="${doctor.name}" disabled />
    <input class="input-field" type="text" value="${doctor.specialty}" disabled/>
    <input class="input-field" type="email" value="${doctor.email}" disabled/>
    <input class="input-field" type="date" id="appointment-date" />
    <select class="input-field" id="appointment-time">
      <option value="">Select time</option>
      ${doctor.availableTimes.map(t => `<option value="${t}">${t}</option>`).join('')}
    </select>
    <button class="confirm-booking">Confirm Booking</button>
  `;

  document.body.appendChild(modalApp);

  document.getElementById('closeModal').onclick = () => {
    modalApp.remove();
    ripple.remove();
  };

  setTimeout(() => modalApp.classList.add("active"), 600);

  modalApp.querySelector(".confirm-booking").addEventListener("click", async () => {
    const date = modalApp.querySelector("#appointment-date").value;
    const time = modalApp.querySelector("#appointment-time").value;
    const token = localStorage.getItem("token");
    const startTime = time.split('-')[0];
    const appointment = {
      doctor: { id: doctor.id },
      patient: { id: patient.id },
      appointmentTime: `${date}T${startTime}:00`,
      status: 0
    };


    const { success, message } = await bookAppointment(appointment, token);

    if (success) {
      alert("Appointment Booked successfully");
      ripple.remove();
      modalApp.remove();
    } else {
      alert("❌ Failed to book an appointment :: " + message);
    }
  });
}

export function renderDoctorCards(doctors) {
  const contentDiv = document.getElementById("content");
  contentDiv.innerHTML = "";

  doctors.forEach(doctor => {
    const card = createDoctorCard(doctor);
    contentDiv.appendChild(card);
  });

}

/*
Import the overlay function for booking appointments from loggedPatient.js

  Import the deleteDoctor API function to remove doctors (admin role) from docotrServices.js

  Import function to fetch patient details (used during booking) from patientServices.js

  Function to create and return a DOM element for a single doctor card
    Create the main container for the doctor card
    Retrieve the current user role from localStorage
    Create a div to hold doctor information
    Create and set the doctor’s name
    Create and set the doctor's specialization
    Create and set the doctor's email
    Create and list available appointment times
    Append all info elements to the doctor info container
    Create a container for card action buttons
    === ADMIN ROLE ACTIONS ===
      Create a delete button
      Add click handler for delete button
     Get the admin token from localStorage
        Call API to delete the doctor
        Show result and remove card if successful
      Add delete button to actions container

    === PATIENT (NOT LOGGED-IN) ROLE ACTIONS ===
      Create a book now button
      Alert patient to log in before booking
      Add button to actions container

    === LOGGED-IN PATIENT ROLE ACTIONS ===
      Create a book now button
      Handle booking logic for logged-in patient
        Redirect if token not available
        Fetch patient data with token
        Show booking overlay UI with doctor and patient info
      Add button to actions container

  Append doctor info and action buttons to the car
  Return the complete doctor card element
*/