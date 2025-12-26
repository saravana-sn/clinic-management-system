/**
 * Doctor Services Module
 * Handles all API interactions related to doctor data
 */

import { API_BASE_URL } from "../config/config.js";

const DOCTOR_API = `${API_BASE_URL}/doctor`;

/**
 * Fetches all doctors from the API
 * @returns {Promise<Array>} Array of doctor objects
 */
export async function getDoctors() {
    try {
        const response = await fetch(DOCTOR_API);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.doctors || [];
    } catch (error) {
        console.error("Failed to fetch doctors:", error);
        return [];
    }
}

/**
 * Deletes a specific doctor
 * @param {string} id - Doctor ID to delete
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Operation result {success, message}
 */
export async function deleteDoctor(id, token) {
    try {
        const response = await fetch(`${DOCTOR_API}/${id}/${token}`, {
            method: 'DELETE',
            // headers: {
            //     'Authorization': `Bearer ${token}`
            // }
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Failed to delete doctor');
        }

        return {
            success: true,
            message: result.message || 'Doctor deleted successfully'
        };
    } catch (error) {
        console.error("Delete doctor failed:", error);
        return {
            success: false,
            message: error.message || 'Failed to delete doctor'
        };
    }
}

/**
 * Saves a new doctor to the system
 * @param {Object} doctor - Doctor data to save
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Operation result {success, message, doctor}
 */
export async function saveDoctor(doctor, token) {
    try {
        const response = await fetch(`${DOCTOR_API}/${token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(doctor)
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Failed to save doctor');
        }

        return {
            success: true,
            message: result.message || 'Doctor saved successfully',
            doctor: result.doctor
        };
    } catch (error) {
        console.error("Save doctor failed:", error);
        return {
            success: false,
            message: error.message // || 'Failed to save doctor'
        };
    }
}

/**
 * Filters doctors based on criteria
 * @param {string} name - Doctor name filter
 * @param {string} time - Availability time filter
 * @param {string} specialty - Specialty filter
 * @returns {Promise<Array>} Filtered array of doctors
 */
export async function filterDoctors(name = '', time = '', specialty = '') {
    try {
        // Construct query parameters
        // const params = new URLSearchParams();
        // if (name) params.append('name', name);
        // if (time) params.append('time', time);
        // if (specialty) params.append('specialty', specialty);
        // const url = `${DOCTOR_API}/filter?${params.toString()}`;

        const url = `${DOCTOR_API}/filter/${name}/${time}/${specialty}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.doctors || [];
    } catch (error) {
        console.error("Failed to filter doctors:", error);
        alert("Failed to filter doctors. Please try again.");
        return [];
    }
}
/*
  Import the base API URL from the config file
  Define a constant DOCTOR_API to hold the full endpoint for doctor-related actions


  Function: getDoctors
  Purpose: Fetch the list of all doctors from the API

   Use fetch() to send a GET request to the DOCTOR_API endpoint
   Convert the response to JSON
   Return the 'doctors' array from the response
   If there's an error (e.g., network issue), log it and return an empty array


  Function: deleteDoctor
  Purpose: Delete a specific doctor using their ID and an authentication token

   Use fetch() with the DELETE method
    - The URL includes the doctor ID and token as path parameters
   Convert the response to JSON
   Return an object with:
    - success: true if deletion was successful
    - message: message from the server
   If an error occurs, log it and return a default failure response


  Function: saveDoctor
  Purpose: Save (create) a new doctor using a POST request

   Use fetch() with the POST method
    - URL includes the token in the path
    - Set headers to specify JSON content type
    - Convert the doctor object to JSON in the request body

   Parse the JSON response and return:
    - success: whether the request succeeded
    - message: from the server

   Catch and log errors
    - Return a failure response if an error occurs


  Function: filterDoctors
  Purpose: Fetch doctors based on filtering criteria (name, time, and specialty)

   Use fetch() with the GET method
    - Include the name, time, and specialty as URL path parameters
   Check if the response is OK
    - If yes, parse and return the doctor data
    - If no, log the error and return an object with an empty 'doctors' array

   Catch any other errors, alert the user, and return a default empty result
*/
