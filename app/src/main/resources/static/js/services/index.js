import { openModal } from "../components/modals.js";
import { API_BASE_URL } from "../config/config.js";

// Define the login endpoints
const ADMIN_API = API_BASE_URL + '/admin/login';
const DOCTOR_API = API_BASE_URL + '/doctor/login';

// Ensure the DOM is loaded before attaching listeners
window.onload = function () {
    const adminBtn = document.getElementById('adminLogin');
    const doctorBtn = document.getElementById('doctorLogin');

    // Setup Admin button click
    if (adminBtn) {
        adminBtn.addEventListener('click', () => {
            openModal('adminLogin');
        });
    }

    // Setup Doctor button click
    if (doctorBtn) {
        doctorBtn.addEventListener('click', () => {
            openModal('doctorLogin');
        });
    }
};

/**
 * Global handler for Admin Login
 */
window.adminLoginHandler = async function (event) {
    // Prevent the form from refreshing the page
    if (event) event.preventDefault();

    try {
        // Step 1: Get values from input fields
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;

        // Step 2: Create admin object
        const admin = { username, password };

        // Step 3: Send POST request
        const response = await fetch(ADMIN_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(admin)
        });

        // Step 4: Handle successful response
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('userRole', 'admin');

            // This function from render.js handles the role-based view
            if (typeof selectRole === 'function') {
                selectRole('admin');
            }
        } else {
            // Step 5: Handle invalid credentials
            alert("Invalid credentials!");
        }
    } catch (error) {
        // Step 6: Handle network or server errors
        console.error("Login Error:", error);
        alert("Something went wrong. Please try again later.");
    }
};

/**
 * Global handler for Doctor Login
 */
window.doctorLoginHandler = async function (event) {
    if (event) event.preventDefault();

    try {
        // Step 1: Get values from input fields
        const identifier = document.getElementById('doctorEmail').value;
        const password = document.getElementById('doctorPassword').value;
       console.log("doctor", identifier)

        // Step 2: Create doctor object
        const doctor = { identifier, password };

        // Step 3: Send POST request
        const response = await fetch(DOCTOR_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(doctor)
        });

        // Step 4: Handle success
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('userRole', 'doctor');

            if (typeof selectRole === 'function') {
                selectRole('doctor');
            }
        } else {
            // Step 5: Handle failure
            alert("Invalid credentials!");
        }
    } catch (error) {
        // Step 6: Graceful error handling
        console.error("Doctor Login Error:", error);
        alert("A server error occurred.");
    }
};

export function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
};

/*
  Import the openModal function to handle showing login popups/modals
  Import the base API URL from the config file
  Define constants for the admin and doctor login API endpoints using the base URL

  Use the window.onload event to ensure DOM elements are available after page load
  Inside this function:
    - Select the "adminLogin" and "doctorLogin" buttons using getElementById
    - If the admin login button exists:
        - Add a click event listener that calls openModal('adminLogin') to show the admin login modal
    - If the doctor login button exists:
        - Add a click event listener that calls openModal('doctorLogin') to show the doctor login modal


  Define a function named adminLoginHandler on the global window object
  This function will be triggered when the admin submits their login credentials

  Step 1: Get the entered username and password from the input fields
  Step 2: Create an admin object with these credentials

  Step 3: Use fetch() to send a POST request to the ADMIN_API endpoint
    - Set method to POST
    - Add headers with 'Content-Type: application/json'
    - Convert the admin object to JSON and send in the body

  Step 4: If the response is successful:
    - Parse the JSON response to get the token
    - Store the token in localStorage
    - Call selectRole('admin') to proceed with admin-specific behavior

  Step 5: If login fails or credentials are invalid:
    - Show an alert with an error message

  Step 6: Wrap everything in a try-catch to handle network or server errors
    - Show a generic error message if something goes wrong


  Define a function named doctorLoginHandler on the global window object
  This function will be triggered when a doctor submits their login credentials

  Step 1: Get the entered email and password from the input fields
  Step 2: Create a doctor object with these credentials

  Step 3: Use fetch() to send a POST request to the DOCTOR_API endpoint
    - Include headers and request body similar to admin login

  Step 4: If login is successful:
    - Parse the JSON response to get the token
    - Store the token in localStorage
    - Call selectRole('doctor') to proceed with doctor-specific behavior

  Step 5: If login fails:
    - Show an alert for invalid credentials

  Step 6: Wrap in a try-catch block to handle errors gracefully
    - Log the error to the console
    - Show a generic error message
*/
