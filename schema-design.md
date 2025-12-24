## MySQL Database Design

### Table: appointments
- id: INT, Primary Key, Auto Increment
- doctor_id: INT, Foreign Key → doctors(id)
- patient_id: INT, Foreign Key → patients(id)
- appointment_booking_time: DATETIME, Not Null (current datetime)
- appointment_start_time: DATETIME, Not Null
- appointment_end_time: DATETIME, Not Null
- status: INT (0 = Scheduled, 1 = Completed, 2 = Canceled)

### Table: doctors
- id: INT, Primary Key, Auto Increment
- name: VARCHAR(30), Not Null
- specialization: VARCHAR(30), Not Null
- email: VARCHAR(128), Unique, Not Null
- password: VARCHAR(128), Not Null
- is_active: BOOLEAN, Default: 1
- created_at: DATETIME, Default: CURRENT_TIMESTAMP
- updated_at: DATETIME, Default: NULL
- deleted_at: DATETIME, Default: NULL

### Table: patients
- id: INT, Primary Key, Auto Increment
- admin_id: INT, Foreign Key → admins(id)
- name: VARCHAR(30), Not Null
- email: VARCHAR(128), Unique, Not Null
- password: VARCHAR(128), Not Null
- is_active: BOOLEAN, Default: 1
- created_at: DATETIME, Default: CURRENT_TIMESTAMP
- updated_at: DATETIME, Default: NULL
- deleted_at: DATETIME, Default: NULL

### Table: admins
- id: INT, Primary Key, Auto Increment
- name: VARCHAR(30), Not Null
- email: VARCHAR(128), Unique, Not Null
- password: VARCHAR(128), Not Null

### Relationships
- One Doctor can have many appointments.
- One Patient can have many appointments.

## MongoDB Collection Design

### Collection: prescriptions

```json
{
  "_id": "ObjectId('64abc123456')",
  "patientName": "John Smith",
  "appointmentId": 51,
  "medication": "Paracetamol",
  "dosage": "500mg",
  "doctorNotes": "Take 1 tablet every 6 hours.",
  "refillCount": 2,
  "pharmacy": {
    "name": "Walgreens SF",
    "location": "Market Street"
  }
}