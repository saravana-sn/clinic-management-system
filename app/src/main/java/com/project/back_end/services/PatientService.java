package com.project.back_end.services;

import com.project.back_end.DTO.AppointmentDTO;
import com.project.back_end.models.Appointment;
import com.project.back_end.models.Patient;
import com.project.back_end.repo.AppointmentRepository;
import com.project.back_end.repo.PatientRepository;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.ValidationException;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final @Lazy TokenService tokenService;

    public PatientService(PatientRepository patientRepository,
                          AppointmentRepository appointmentRepository,
                          TokenService tokenService) {
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.tokenService = tokenService;
    }

    @Transactional
    public int createPatient(Patient patient) {

        try {
            if (patientRepository.findByEmail(patient.getEmail()) != null) {
                throw new RuntimeException("Patient with this email already exists");
            }
            patientRepository.save(patient);
            return 1;
        } catch (ConstraintViolationException e) {  // Catch ConstraintViolationException directly
            Set<ConstraintViolation<?>> violations = e.getConstraintViolations();

            List<String> errorMessages = violations.stream()
                    .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                    .collect(Collectors.toList());

            throw new RuntimeException("Validation failed: " + String.join(", ", errorMessages));
        } catch (ValidationException e) {
            throw new RuntimeException("Validation failed: " + e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("Failed to save patient: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getPatientAppointment(Long id, String token) {
        Map<String, Object> response = new HashMap<>();

        // Verify patient owns the appointments

        /*String userEmail = tokenService.extractIdentifier(token);
        Optional<Patient> patient = Optional.ofNullable(patientRepository.findByEmail(userEmail));
        if (patient.isEmpty() || !patient.get().getId().equals(id)) {
            response.put("message", "Unauthorized access");
            return ResponseEntity.badRequest().body(response);
        }*/

        try {
            List<Appointment> appointments = appointmentRepository.findByPatientId(id);
            List<AppointmentDTO> appointmentDTOs = appointments.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            response.put("appointments", appointmentDTOs);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", "Failed to fetch appointments");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> filterByCondition(String condition, Long id) {
        Map<String, Object> response = new HashMap<>();
        int status = -1;

        if ("past".equalsIgnoreCase(condition)) {
            status = 1; // Completed appointments
        } else if ("future".equalsIgnoreCase(condition)) {
            status = 0; // Scheduled appointments
        } else {
            response.put("error", "Invalid condition. Use 'past' or 'future'");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            List<Appointment> appointments = appointmentRepository
                    .findByPatient_IdAndStatusOrderByAppointmentTimeAsc(id, status);
            List<AppointmentDTO> appointmentDTOs = appointments.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            response.put("appointments", appointmentDTOs);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", "Failed to filter appointments");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> filterByDoctor(String name, Long patientId) {
        Map<String, Object> response = new HashMap<>();

        try {
            List<Appointment> appointments = appointmentRepository.filterByDoctorNameAndPatientId(name, patientId);
            List<AppointmentDTO> appointmentDTOs = appointments.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            response.put("appointments", appointmentDTOs);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", "Failed to filter by doctor");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> filterByDoctorAndCondition(String condition, String name,
                                                                          long patientId) {
        Map<String, Object> response = new HashMap<>();
        int status = -1;

        if ("past".equalsIgnoreCase(condition)) {
            status = 1;
        } else if ("future".equalsIgnoreCase(condition)) {
            status = 0;
        } else {
            response.put("error", "Invalid condition. Use 'past' or 'future'");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            List<Appointment> appointments = appointmentRepository.filterByDoctorNameAndPatientIdAndStatus(name,
                    patientId, status);
            List<AppointmentDTO> appointmentDTOs = appointments.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            response.put("appointments", appointmentDTOs);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", "Failed to filter appointments");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getPatientDetails(String token) {
        Map<String, Object> response = new HashMap<>();

        try {
            String email = tokenService.extractIdentifier(token);
            Patient patient = patientRepository.findByEmail(email);

            if (patient == null) {
                response.put("error", "Patient not found");
                return ResponseEntity.status(404).body(response);
            }

            // Create a response with only necessary patient details
            Map<String, Object> patientDetails = new HashMap<>();
            patientDetails.put("id", patient.getId());
            patientDetails.put("name", patient.getName());
            patientDetails.put("email", patient.getEmail());
            patientDetails.put("phone", patient.getPhone());

            response.put("patient", patientDetails);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", "Failed to fetch patient details");
            return ResponseEntity.internalServerError().body(response);
        }
    }
    private AppointmentDTO convertToDTO(Appointment appointment) {
        return new AppointmentDTO(
                appointment.getId(),
                appointment.getDoctor().getId(),
                appointment.getDoctor().getName(),
                appointment.getPatient().getId(),
                appointment.getPatient().getName(),
                appointment.getPatient().getEmail(),
                appointment.getPatient().getPhone(),
                appointment.getPatient().getAddress(),
                appointment.getAppointmentTime(),
                appointment.getStatus());
    }
}

// 1. **Add @Service Annotation**:
//    - The `@Service` annotation is used to mark this class as a Spring service component. 
//    - It will be managed by Spring's container and used for business logic related to patients and appointments.
//    - Instruction: Ensure that the `@Service` annotation is applied above the class declaration.

// 2. **Constructor Injection for Dependencies**:
//    - The `PatientService` class has dependencies on `PatientRepository`, `AppointmentRepository`, and `TokenService`.
//    - These dependencies are injected via the constructor to maintain good practices of dependency injection and testing.
//    - Instruction: Ensure constructor injection is used for all the required dependencies.

// 3. **createPatient Method**:
//    - Creates a new patient in the database. It saves the patient object using the `PatientRepository`.
//    - If the patient is successfully saved, the method returns `1`; otherwise, it logs the error and returns `0`.
//    - Instruction: Ensure that error handling is done properly and exceptions are caught and logged appropriately.

// 4. **getPatientAppointment Method**:
//    - Retrieves a list of appointments for a specific patient, based on their ID.
//    - The appointments are then converted into `AppointmentDTO` objects for easier consumption by the API client.
//    - This method is marked as `@Transactional` to ensure database consistency during the transaction.
//    - Instruction: Ensure that appointment data is properly converted into DTOs and the method handles errors gracefully.

// 5. **filterByCondition Method**:
//    - Filters appointments for a patient based on the condition (e.g., "past" or "future").
//    - Retrieves appointments with a specific status (0 for future, 1 for past) for the patient.
//    - Converts the appointments into `AppointmentDTO` and returns them in the response.
//    - Instruction: Ensure the method correctly handles "past" and "future" conditions, and that invalid conditions are caught and returned as errors.

// 6. **filterByDoctor Method**:
//    - Filters appointments for a patient based on the doctor's name.
//    - It retrieves appointments where the doctor’s name matches the given value, and the patient ID matches the provided ID.
//    - Instruction: Ensure that the method correctly filters by doctor's name and patient ID and handles any errors or invalid cases.

// 7. **filterByDoctorAndCondition Method**:
//    - Filters appointments based on both the doctor's name and the condition (past or future) for a specific patient.
//    - This method combines filtering by doctor name and appointment status (past or future).
//    - Converts the appointments into `AppointmentDTO` objects and returns them in the response.
//    - Instruction: Ensure that the filter handles both doctor name and condition properly, and catches errors for invalid input.

// 8. **getPatientDetails Method**:
//    - Retrieves patient details using the `tokenService` to extract the patient's email from the provided token.
//    - Once the email is extracted, it fetches the corresponding patient from the `patientRepository`.
//    - It returns the patient's information in the response body.
    //    - Instruction: Make sure that the token extraction process works correctly and patient details are fetched properly based on the extracted email.

// 9. **Handling Exceptions and Errors**:
//    - The service methods handle exceptions using try-catch blocks and log any issues that occur. If an error occurs during database operations, the service responds with appropriate HTTP status codes (e.g., `500 Internal Server Error`).
//    - Instruction: Ensure that error handling is consistent across the service, with proper logging and meaningful error messages returned to the client.

// 10. **Use of DTOs (Data Transfer Objects)**:
//    - The service uses `AppointmentDTO` to transfer appointment-related data between layers. This ensures that sensitive or unnecessary data (e.g., password or private patient information) is not exposed in the response.
//    - Instruction: Ensure that DTOs are used appropriately to limit the exposure of internal data and only send the relevant fields to the client.
