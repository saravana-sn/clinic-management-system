// render.js

// Add this import at the top of render.js
import { openModal } from "./components/modals.js";

function selectRole(role) {
  const token = localStorage.getItem('token');

  // If we don't have a token, we MUST show the login modal
  if (!token) {
    if (role === 'admin') openModal('adminLogin');
    if (role === 'doctor') openModal('doctorLogin');
    if (role === 'patient'){
        localStorage.setItem('userRole', 'patient')
        window.location.href = "./pages/patientDashboard.html";
    }
    return;
  }

  if (role === "admin") {
      window.location.href = `/adminDashboard/${token}`;
  } else if (role === "loggedPatient") {
      window.location.href = "loggedPatientDashboard.html";
  } else if (role === "doctor") {
      window.location.href = `/doctorDashboard/${token}`;
  }
}

function renderContent() {
  const role = getRole();
  if (!role) {
    window.location.href = "/"; // if no role, send to role selection page
    return;
  }
}

window.selectRole = selectRole;