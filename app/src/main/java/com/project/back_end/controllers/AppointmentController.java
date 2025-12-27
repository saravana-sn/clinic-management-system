package com.project.back_end.controllers;


import com.project.back_end.models.Appointment;
import com.project.back_end.services.AppointmentService;
import com.project.back_end.services.Service;
import jakarta.persistence.RollbackException;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.ValidationException;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.TransactionSystemException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final Service service;

    public AppointmentController(AppointmentService appointmentService,
                                 Service service) {
        this.appointmentService = appointmentService;
        this.service = service;
    }

    @GetMapping("/{date}/{patientName}/{token}")
    public ResponseEntity<Map<String, Object>> getAppointments(
            @PathVariable LocalDate date,
            @PathVariable String patientName,
            @PathVariable String token) {

        ResponseEntity<Map<String, String>> validationResponse = service.validateToken(token, "doctor");

        if (validationResponse.getStatusCode().isError()) {
            return ResponseEntity.status(validationResponse.getStatusCode())
                    .body(Map.of("error", "Invalid or expired token"));
        }

        return ResponseEntity.ok(appointmentService.getAppointment(patientName, date, token));
    }

    @PostMapping("/{token}")
    public ResponseEntity<Map<String, String>> bookAppointment(
            @RequestBody Appointment appointment,
            @PathVariable String token) {

        ResponseEntity<Map<String, String>> validationResponse = service.validateToken(token, "patient");

        if (validationResponse.getStatusCode().isError()) {
            return validationResponse;
        }

        int validationResult = service.validateAppointment(appointment);
        if (validationResult == -1) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Doctor not found"));
        } else if (validationResult == 0) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Time slot not available"));
        }

        int result = appointmentService.bookAppointment(appointment);
        if (result == 1) {
            return ResponseEntity.status(201)
                    .body(Map.of("message", "Appointment booked successfully"));
        } else {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to book appointment"));
        }
    }

    @PutMapping("/{token}")
    public ResponseEntity<Map<String, String>> updateAppointment(
            @RequestBody Appointment appointment,
            @PathVariable String token) {

        ResponseEntity<Map<String, String>> validationResponse = service.validateToken(token, "patient");
        if (validationResponse.getStatusCode().isError()) {
            return validationResponse;
        }

        try {
            ResponseEntity<Map<String, String>> updateResult = appointmentService.updateAppointment(appointment);
            return updateResult;
        } catch (Exception e) {
            return handleUpdateException(e);
        }
    }

    private ResponseEntity<Map<String, String>> handleUpdateException(Exception e) {
        // Handle ConstraintViolationException (direct or wrapped)
        ConstraintViolationException constraintViolation = extractConstraintViolation(e);
        if (constraintViolation != null) {
            String errorMessage = constraintViolation.getConstraintViolations().stream()
                    .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                    .collect(Collectors.joining(", "));
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Validation failed: " + errorMessage));
        }

        // Handle other specific exceptions
        if (e instanceof ValidationException) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Validation failed: " + e.getMessage()));
        }

        // Generic error handling
        return ResponseEntity.badRequest()
                .body(Map.of("message", "Failed to update appointment: " + e.getMessage()));
    }

    private ConstraintViolationException extractConstraintViolation(Throwable e) {
        // Check if exception is directly a ConstraintViolationException
        if (e instanceof ConstraintViolationException) {
            return (ConstraintViolationException) e;
        }

        // Check if exception is wrapped in TransactionSystemException
        if (e instanceof TransactionSystemException) {
            Throwable cause = e.getCause();
            if (cause instanceof RollbackException && cause.getCause() instanceof ConstraintViolationException) {
                return (ConstraintViolationException) cause.getCause();
            }
        }

        // Check nested causes
        Throwable cause = e.getCause();
        if (cause != null && cause != e) {
            return extractConstraintViolation(cause);
        }

        return null;
    }

    @DeleteMapping("/{id}/{token}")
    public ResponseEntity<Map<String, String>> cancelAppointment(
            @PathVariable Long id,
            @PathVariable String token) {

        ResponseEntity<Map<String, String>> validationResponse = service.validateToken(token, "patient");

        if (validationResponse.getStatusCode().isError()) {
            return validationResponse;
        }

        return appointmentService.cancelAppointment(id, token);
    }

// 1. Set Up the Controller Class:
//    - Annotate the class with `@RestController` to define it as a REST API controller.
//    - Use `@RequestMapping("/appointments")` to set a base path for all appointment-related endpoints.
//    - This centralizes all routes that deal with booking, updating, retrieving, and canceling appointments.


// 2. Autowire Dependencies:
//    - Inject `AppointmentService` for handling the business logic specific to appointments.
//    - Inject the general `Service` class, which provides shared functionality like token validation and appointment checks.


// 3. Define the `getAppointments` Method:
//    - Handles HTTP GET requests to fetch appointments based on date and patient name.
//    - Takes the appointment date, patient name, and token as path variables.
//    - First validates the token for role `"doctor"` using the `Service`.
//    - If the token is valid, returns appointments for the given patient on the specified date.
//    - If the token is invalid or expired, responds with the appropriate message and status code.


// 4. Define the `bookAppointment` Method:
//    - Handles HTTP POST requests to create a new appointment.
//    - Accepts a validated `Appointment` object in the request body and a token as a path variable.
//    - Validates the token for the `"patient"` role.
//    - Uses service logic to validate the appointment data (e.g., check for doctor availability and time conflicts).
//    - Returns success if booked, or appropriate error messages if the doctor ID is invalid or the slot is already taken.


// 5. Define the `updateAppointment` Method:
//    - Handles HTTP PUT requests to modify an existing appointment.
//    - Accepts a validated `Appointment` object and a token as input.
//    - Validates the token for `"patient"` role.
//    - Delegates the update logic to the `AppointmentService`.
//    - Returns an appropriate success or failure response based on the update result.


// 6. Define the `cancelAppointment` Method:
//    - Handles HTTP DELETE requests to cancel a specific appointment.
//    - Accepts the appointment ID and a token as path variables.
//    - Validates the token for `"patient"` role to ensure the user is authorized to cancel the appointment.
//    - Calls `AppointmentService` to handle the cancellation process and returns the result.


}
