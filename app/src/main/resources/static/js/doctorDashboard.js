/**
 * Doctor Dashboard Controller
 * Handles appointment management functionality including:
 * - Loading and displaying appointments
 * - Filtering by date and patient name
 */

import { getAllAppointments } from './services/appointmentRecordService.js';
import { createPatientRow } from './components/patientRows.js';

// DOM Elements
const tableBody = document.getElementById('patientTableBody');
const searchBar = document.getElementById('searchBar');
const todayButton = document.getElementById('todayButton');
const datePicker = document.getElementById('datePicker');

// Global Variables
let selectedDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
let token = localStorage.getItem('token');
let patientName = null;

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Set initial date picker value
    datePicker.value = selectedDate;
    
    // Load initial appointments
    loadAppointments();
    
    // Setup event listeners
    setupEventListeners();
});

/**
 * Sets up all event listeners
 */
function setupEventListeners() {
    // Search bar functionality
    if (searchBar) {
        searchBar.addEventListener('input', () => {
            patientName = searchBar.value.trim();
            if (patientName === '') {
                patientName = null;
            }
            loadAppointments();
        });
    }

    // Today button
    if (todayButton) {
        todayButton.addEventListener('click', () => {
            selectedDate = new Date().toISOString().split('T')[0];
            datePicker.value = selectedDate;
            loadAppointments();
        });
    }

    // Date picker
    if (datePicker) {
        datePicker.addEventListener('change', () => {
            selectedDate = datePicker.value;
            loadAppointments();
        });
    }
}

/**
 * Loads and displays appointments based on current filters
 */
async function loadAppointments() {
    try {
        // Clear existing content
        tableBody.innerHTML = '';

        // Fetch appointments
        const appointments = await getAllAppointments(selectedDate, patientName, token);
        
        if (!appointments || appointments.length === 0) {
            showNoAppointmentsMessage();
            return;
        }

        // Create and append rows for each appointment
        appointments.appointments.forEach(appointment => {
            const patient = {
                id: appointment.patient.id,
                name: appointment.patient.name,
                phone: appointment.patient.phone,
                email: appointment.patient.email,
                appointmentTime: appointment.appointmentTime,
                status: appointment.status
            };
            
            const row = createPatientRow(patient);
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error('Failed to load appointments:', error);
        showErrorMessage();
    }
}

/**
 * Displays a "no appointments" message in the table
 */
function showNoAppointmentsMessage() {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td colspan="6" class="text-center">
            No appointments found for ${patientName ? `patient "${patientName}"` : 'selected date'}.
        </td>
    `;
    tableBody.appendChild(row);
}

/**
 * Displays an error message in the table
 */
function showErrorMessage() {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td colspan="6" class="text-center error">
            Error loading appointments. Please try again later.
        </td>
    `;
    tableBody.appendChild(row);
}
/*
  Import getAllAppointments to fetch appointments from the backend
  Import createPatientRow to generate a table row for each patient appointment


  Get the table body where patient rows will be added
  Initialize selectedDate with today's date in 'YYYY-MM-DD' format
  Get the saved token from localStorage (used for authenticated API calls)
  Initialize patientName to null (used for filtering by name)


  Add an 'input' event listener to the search bar
  On each keystroke:
    - Trim and check the input value
    - If not empty, use it as the patientName for filtering
    - Else, reset patientName to "null" (as expected by backend)
    - Reload the appointments list with the updated filter


  Add a click listener to the "Today" button
  When clicked:
    - Set selectedDate to today's date
    - Update the date picker UI to match
    - Reload the appointments for today


  Add a change event listener to the date picker
  When the date changes:
    - Update selectedDate with the new value
    - Reload the appointments for that specific date


  Function: loadAppointments
  Purpose: Fetch and display appointments based on selected date and optional patient name

  Step 1: Call getAllAppointments with selectedDate, patientName, and token
  Step 2: Clear the table body content before rendering new rows

  Step 3: If no appointments are returned:
    - Display a message row: "No Appointments found for today."

  Step 4: If appointments exist:
    - Loop through each appointment and construct a 'patient' object with id, name, phone, and email
    - Call createPatientRow to generate a table row for the appointment
    - Append each row to the table body

  Step 5: Catch and handle any errors during fetch:
    - Show a message row: "Error loading appointments. Try again later."


  When the page is fully loaded (DOMContentLoaded):
    - Call renderContent() (assumes it sets up the UI layout)
    - Call loadAppointments() to display today's appointments by default
*/
