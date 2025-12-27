/**
 * Admin Dashboard Controller
 * Handles doctor management functionality including:
 * - Loading and displaying doctors
 * - Filtering and searching doctors
 * - Adding new doctors
 */

import { openModal, closeModal } from '../js/components/modals.js';
import { getDoctors, filterDoctors, saveDoctor } from '../js/services/doctorServices.js';
import { createDoctorCard } from '../js/components/doctorCard.js';
import { showError } from '../js/services/index.js';

// DOM Elements
const contentDiv = document.getElementById('content');
const searchBar = document.getElementById('searchBar');
const timeFilter = document.getElementById('timeFilter');
const specialtyFilter = document.getElementById('specialtyFilter');
const addDoctorBtn = document.getElementById('addDocBtn');

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadDoctorCards();
    setupEventListeners();
});

/**
 * Sets up all event listeners
 */
function setupEventListeners() {
    // Add Doctor button
    if (addDoctorBtn) {
        addDoctorBtn.addEventListener('click', () => openModal('addDoctor'));
    }

    // Search and filter inputs
    if (searchBar) {
        searchBar.addEventListener('input', filterDoctorsOnChange);
    }
    if (timeFilter) {
        timeFilter.addEventListener('change', filterDoctorsOnChange);
    }
    if (specialtyFilter) {
        specialtyFilter.addEventListener('change', filterDoctorsOnChange);
    }
}

/**
 * Loads and displays all doctors
 */
async function loadDoctorCards() {
    try {
        const doctors = await getDoctors();
        renderDoctorCards(doctors);
    } catch (error) {
        console.error('Failed to load doctors:', error);
        contentDiv.innerHTML = '<p class="error">Failed to load doctors. Please try again.</p>';
    }
}

/**
 * Filters doctors based on search/filter inputs
 */
async function filterDoctorsOnChange() {
    try {
        const name = searchBar.value.trim() || null;
        const time = timeFilter.value || null;
        const specialty = specialtyFilter.value || null;
        console.log('Filtering with:', { name, time, specialty });

        const filteredDoctors = await filterDoctors(name, time, specialty);
        console.log('Data received from Spring:', filteredDoctors);
        console.log()
        renderDoctorCards(filteredDoctors);
    } catch (error) {
        console.error('Filter error:', error);
        alert('Failed to filter doctors. Please try again.');
    }
}

/**
 * Renders doctor cards to the content area
 * @param {Array} doctors - Array of doctor objects
 */
function renderDoctorCards(doctors) {
    contentDiv.innerHTML = '';

    if (!doctors || doctors.length === 0) {
        contentDiv.innerHTML = '<p class="no-results">No doctors found.</p>';
        return;
    }

    doctors.forEach(doctor => {
        const card = createDoctorCard(doctor);
        contentDiv.appendChild(card);
    });
}

/**
 * Handles adding a new doctor (called from modal form)
 */
window.adminAddDoctor = async function() {
    try {
        // Get form values
        const name = document.getElementById('doctorName').value.trim();
        const email = document.getElementById('doctorEmail').value.trim();
        const phone = document.getElementById('doctorPhone').value.trim();
        const password = document.getElementById('doctorPassword').value;
        const specialty = document.getElementById('doctorSpecialty').value;
        
        // Get availability times (checkboxes)
        const timeCheckboxes = document.querySelectorAll('input[name="availability"]:checked');
        const availableTimes = Array.from(timeCheckboxes).map(cb => cb.value);

        // Validate inputs
        if (!name || !email || !phone || !password || !specialty || availableTimes.length === 0) {
            throw new Error('Please fill all fields and select at least one availability time');
        }

        // Get auth token
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication required. Please login again.');
        }

        // Create doctor object
        const doctor = {
            name,
            email,
            phone,
            password,
            specialty,
            availableTimes
        };

        // Save doctor
        const result = await saveDoctor(doctor, token);
        
        if (result.success) {
            alert('Doctor added successfully!');
            closeModal('addDoctor');
            loadDoctorCards(); // Refresh the list
        } else {
            throw new Error(result.message || 'Failed to add doctor');
        }
    } catch (error) {
        console.error('Add doctor error:', error);
        showError('addDoctorError', error.message || 'Failed to add doctor. Please try again.');
        // alert(error.message || 'Failed to add doctor. Please try again.');
    }
};
/*
  This script handles the admin dashboard functionality for managing doctors:
  - Loads all doctor cards
  - Filters doctors by name, time, or specialty
  - Adds a new doctor via modal form


  Attach a click listener to the "Add Doctor" button
  When clicked, it opens a modal form using openModal('addDoctor')


  When the DOM is fully loaded:
    - Call loadDoctorCards() to fetch and display all doctors


  Function: loadDoctorCards
  Purpose: Fetch all doctors and display them as cards

    Call getDoctors() from the service layer
    Clear the current content area
    For each doctor returned:
    - Create a doctor card using createDoctorCard()
    - Append it to the content div

    Handle any fetch errors by logging them


  Attach 'input' and 'change' event listeners to the search bar and filter dropdowns
  On any input change, call filterDoctorsOnChange()


  Function: filterDoctorsOnChange
  Purpose: Filter doctors based on name, available time, and specialty

    Read values from the search bar and filters
    Normalize empty values to null
    Call filterDoctors(name, time, specialty) from the service

    If doctors are found:
    - Render them using createDoctorCard()
    If no doctors match the filter:
    - Show a message: "No doctors found with the given filters."

    Catch and display any errors with an alert


  Function: renderDoctorCards
  Purpose: A helper function to render a list of doctors passed to it

    Clear the content area
    Loop through the doctors and append each card to the content area


  Function: adminAddDoctor
  Purpose: Collect form data and add a new doctor to the system

    Collect input values from the modal form
    - Includes name, email, phone, password, specialty, and available times

    Retrieve the authentication token from localStorage
    - If no token is found, show an alert and stop execution

    Build a doctor object with the form values

    Call saveDoctor(doctor, token) from the service

    If save is successful:
    - Show a success message
    - Close the modal and reload the page

    If saving fails, show an error message
*/