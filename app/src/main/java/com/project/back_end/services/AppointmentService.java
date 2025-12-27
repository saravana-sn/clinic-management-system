package com.project.back_end.services;

import com.project.back_end.models.Appointment;
import com.project.back_end.models.Doctor;
import com.project.back_end.models.Patient;
import com.project.back_end.repo.AppointmentRepository;
import com.project.back_end.repo.DoctorRepository;
import com.project.back_end.repo.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
public class AppointmentService {
// 1. **Add @Service Annotation**:
//    - To indicate that this class is a service layer class for handling business logic.
//    - The `@Service` annotation should be added before the class declaration to mark it as a Spring service component.
//    - Instruction: Add `@Service` above the class definition.

    // 2. **Constructor Injection for Dependencies**:
//    - The `AppointmentService` class requires several dependencies like `AppointmentRepository`, `Service`, `TokenService`, `PatientRepository`, and `DoctorRepository`.
//    - These dependencies should be injected through the constructor.
//    - Instruction: Ensure constructor injection is used for proper dependency management in Spring.
    private AppointmentRepository appointmentRepository;
    private @Lazy TokenService tokenService;
    private com.project.back_end.services.Service service;
    private PatientRepository patientRepository;
    private DoctorRepository doctorRepository;

    @Autowired
    public AppointmentService(AppointmentRepository appointmentRepository,
                              com.project.back_end.services.Service service,
                              TokenService tokenService,
                              PatientRepository patientRepository,
                              DoctorRepository doctorRepository) {
        this.appointmentRepository = appointmentRepository;
        this.service = service;
        this.tokenService = tokenService;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
    }

// 3. **Add @Transactional Annotation for Methods that Modify Database**:
//    - The methods that modify or update the database should be annotated with `@Transactional` to ensure atomicity and consistency of the operations.
//    - Instruction: Add the `@Transactional` annotation above methods that interact with the database, especially those modifying data.

    // 4. **Book Appointment Method**:
//    - Responsible for saving the new appointment to the database.
//    - If the save operation fails, it returns `0`; otherwise, it returns `1`.
//    - Instruction: Ensure that the method handles any exceptions and returns an appropriate result code.
    @Transactional
    public int bookAppointment(Appointment appointment) {
        try {
            //validate doctor exists
            Optional<Doctor> doctor = doctorRepository.findById(appointment.getDoctor().getId());
            if (doctor.isEmpty()) return 0;

            //validate patient exists
            Optional<Patient> patient = patientRepository.findById(appointment.getPatient().getId());
            if (patient.isEmpty()) return 0;

            appointmentRepository.save(appointment);
            return 1;
        } catch (Exception e) {
            return 0;
        }
    }

    // 5. **Update Appointment Method**:
//    - This method is used to update an existing appointment based on its ID.
//    - It validates whether the patient ID matches, checks if the appointment is available for updating, and ensures that the doctor is available at the specified time.
//    - If the update is successful, it saves the appointment; otherwise, it returns an appropriate error message.
//    - Instruction: Ensure proper validation and error handling is included for appointment updates.
    @Transactional
    public ResponseEntity<Map<String, String>> updateAppointment(Appointment appointment) {
        ResponseEntity<Map<String, String>> response;
        HashMap<String, String> map = new HashMap<>();
        try {
            Optional<Appointment> existingApp = appointmentRepository.findById(appointment.getId());
            if (existingApp.isPresent() &&
                    existingApp.get().getPatient().getId().equals(appointment.getPatient().getId())
                    && existingApp.get().isUpcoming() && service.validateAppointment(appointment) == 1
            ) {
                existingApp.get().setAppointmentTime(appointment.getAppointmentTime());
                existingApp.get().setDoctor(appointment.getDoctor());
                appointmentRepository.save(existingApp.get());
                map.put("message", "appointment updated");
                response = new ResponseEntity<>(map, HttpStatus.OK);
                return response;
            } else {
                map.put("message", "appointment not found");
                response = new ResponseEntity<>(map, HttpStatus.NOT_FOUND);
                return response;
            }
        } catch (Exception e) {
            map.put("Error:", e.getMessage());
            response = new ResponseEntity<>(map, HttpStatus.INTERNAL_SERVER_ERROR);
            return response;
        }
    }

    // 6. **Cancel Appointment Method**:
//    - This method cancels an appointment by deleting it from the database.
//    - It ensures the patient who owns the appointment is trying to cancel it and handles possible errors.
//    - Instruction: Make sure that the method checks for the patient ID match before deleting the appointment.
    @Transactional
    public ResponseEntity<Map<String, String>> cancelAppointment(Long id, String token) {
        ResponseEntity<Map<String, String>> response;
        HashMap<String, String> map = new HashMap<>();
        Optional<Appointment> appointment = appointmentRepository.findById(id);
        String patientEmail = tokenService.extractIdentifier(token);
        if (appointment.isPresent() && tokenService.validateToken(token, "patient")
                && appointment.get().getPatient().getEmail().equals(patientEmail)) {
            appointmentRepository.deleteById(id);
            map.put("message", "appointment cancelled");
            response = new ResponseEntity<>(map, HttpStatus.OK);
        }
        map.put("message", "Invalid appointment token");
        response = new ResponseEntity<>(map, HttpStatus.UNAUTHORIZED);
        return response;
    }

    // 7. **Get Appointments Method**:
//    - This method retrieves a list of appointments for a specific doctor on a particular day, optionally filtered by the patient's name.
//    - It uses `@Transactional` to ensure that database operations are consistent and handled in a single transaction.
//    - Instruction: Ensure the correct use of transaction boundaries, especially when querying the database for appointments.
    @Transactional(readOnly = true)
    public Map<String, Object> getAppointment(String pname, LocalDate date, String token) {
        List<Appointment> res = new ArrayList<>();
        Map<String, Object> map = new HashMap<>();
        if (!tokenService.validateToken(token, "doctor")) {
            map.put("message", "Invalid token");
            return map;
        } else {
            String drEmail = tokenService.extractIdentifier(token);
            Doctor doctor = doctorRepository.findByEmail(drEmail);
            LocalDateTime start = date.atStartOfDay();
            LocalDateTime end = date.atTime(LocalTime.MAX);
            if (pname.equals("null") || pname.isEmpty()) {
                res = appointmentRepository.findByDoctorIdAndAppointmentTimeBetween(doctor.getId(), start, end);
            } else {
                res = appointmentRepository.findByDoctorIdAndPatient_NameContainingIgnoreCaseAndAppointmentTimeBetween(doctor.getId(), pname, start, end);
            }
            map.put("message", "appointment found");
            map.put("appointments", res);
            return map;
        }
    }

    // 8. **Change Status Method**:
//    - This method updates the status of an appointment by changing its value in the database.
//    - It should be annotated with `@Transactional` to ensure the operation is executed in a single transaction.
//    - Instruction: Add `@Transactional` before this method to ensure atomicity when updating appointment status.
    @Transactional
    public void changeStatus(long id, int status) {
        appointmentRepository.updateStatus(id, status);
    }
}

