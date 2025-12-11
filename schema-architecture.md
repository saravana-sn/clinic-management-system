This Spring Boot application uses both MVC and REST controllers. 
Thymeleaf templates are used for the Admin and Doctor dashboards, while REST APIs serve all other modules. 
The application interacts with two databases—MySQL (for patient, doctor, appointment, and admin data) and MongoDB (for prescriptions). 
All controllers route requests through a common service layer, which in turn delegates to the appropriate repositories. 
MySQL uses JPA entities while MongoDB uses document models.

# Numbered flow of data and control
1. User accesses AdminDashboard or Appointment pages.
2. The action is routed to the appropriate Thymeleaf or REST controller.
3. All controllers delegate logic to the Service Layer, which acts as the heart of the backend system.
4. Service layer calls the appropriate repository (MySQL)
5. Repository interfaces directly with the underlying MySQL database
6. Once data is retrieved from th DB it is mapped to the appropriate entity (JPA)
7. Finally, the bound models are used in the response layer.