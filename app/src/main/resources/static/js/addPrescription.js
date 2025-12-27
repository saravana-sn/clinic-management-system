import { savePrescription, getPrescription } from "./services/prescriptionServices.js";

document.addEventListener('DOMContentLoaded', async () => {
  // Select UI Elements
  const savePrescriptionBtn = document.getElementById("savePrescription");
  const patientNameInput = document.getElementById("patientName");
  const medicinesInput = document.getElementById("medicines");
  const dosageInput = document.getElementById("dosage");
  const notesInput = document.getElementById("notes");
  const heading = document.getElementById("heading");

  // Get URL Parameters
  const urlParams = new URLSearchParams(window.location.search);
  const appointmentId = urlParams.get("appointmentId");
  const mode = urlParams.get("mode");
  const token = localStorage.getItem("token");
  const patientNameParam = urlParams.get("patientName");

  // 1. Update Heading UI
  if (heading) {
    heading.innerHTML = mode === "view" ? `View <span>Prescription</span>` : `Add <span>Prescription</span>`;
  }

  // Fetch and pre-fill existing prescription if it exists
  if (appointmentId && token) {
    try {
      const response = await getPrescription(appointmentId, token);
      console.log("getPrescription :: ", response);

      // Access the 'prescription' object directly from the response
      const existingPrescription = response.prescription;

      if (existingPrescription) {
        console.log("Filling form with:", existingPrescription);

        // Update the values using the exact keys seen in your console image
        if (patientNameInput) patientNameInput.value = existingPrescription.patientName || "";
        if (medicinesInput)   medicinesInput.value   = existingPrescription.medication || "";
        if (dosageInput)     dosageInput.value     = existingPrescription.dosage || "";
        if (notesInput)      notesInput.value      = existingPrescription.doctorNotes || "";
      }

    } catch (error) {
      console.warn("No existing prescription found or failed to load:", error);
    }
  }

  // 4. Handle 'View' Mode UI
  if (mode === 'view') {
    [patientNameInput, medicinesInput, dosageInput, notesInput].forEach(input => {
      if (input) input.disabled = true;
    });
    if (savePrescriptionBtn) savePrescriptionBtn.style.display = "none";
  }

  // 5. Save Logic
  if (savePrescriptionBtn) {
    savePrescriptionBtn.addEventListener('click', async (e) => {
      e.preventDefault();

      const prescription = {
        patientName: patientNameInput.value,
        medication: medicinesInput.value,
        dosage: dosageInput.value,
        doctorNotes: notesInput.value,
        appointmentId: appointmentId // Critical for Spring Boot @ManyToOne mapping
      };

      const result = await savePrescription(prescription, token);

      if (result && result.success) {
        alert("✅ Prescription saved successfully.");
        // Use window.location as a fallback if selectRole isn't imported
        if (window.selectRole) {
            window.selectRole('doctor');
        } else {
            window.location.href = "/pages/doctorDashboard.html";
        }
      } else {
        alert("❌ Failed to save: " + (result.message || "Unknown error"));
      }
    });
  }
});