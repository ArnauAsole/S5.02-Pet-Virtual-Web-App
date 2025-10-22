# 🐉 Tolkien Creatures

> A **Virtual Creature Application** inspired by the world of Tolkien — created as a final project for the course **S5.02 Pet Virtual Web App**.

---

## 🚀 Description

**Tolkien Creatures** is a full-stack web application that allows users to create, train, and manage virtual creatures inspired by Tolkien’s universe.  
Users can register, log in, and take care of their creatures, while administrators can manage all users and creatures in the system.

The project consists of two main components:

- 🧠 **Backend:** REST API built with **Spring Boot + MySQL + JWT**
- 💅 **Frontend:** Fully developed with **V0 App by Vercel (Next.js + React + TailwindCSS)**

---

## 🧩 Technologies Used

### Backend
- **Java 21**
- **Spring Boot 3**
- **Spring Security + JWT**
- **Spring Data JPA**
- **MySQL**
- **Lombok**
- **Maven**

### Frontend
- **Next.js (React 18)**
- **TypeScript**
- **TailwindCSS**
- **TanStack Query**
- **Axios**
- **V0 App by Vercel + ChatGPT** for design, component generation, and optimization

---

## ⚙️ Installation & Configuration

### 1️⃣ Clone the repository
```
git clone https://github.com/ArnauAsole/S5.02-Pet-Virtual-Web-App.git
cd S5.02-Pet-Virtual-Web-App

```
2️⃣ Set up the MySQL database

Create a database named tolkiencreatures:

```
CREATE DATABASE tolkiencreatures CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
3️⃣ Configure backend environment

(application.yml)

```
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/tolkiencreatures
    username: your_user
    password: your_password
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQLDialect
  main:
    allow-circular-references: true

jwt:
  secret: your_secure_secret_key

```

(application-dev.yml)

```
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/tolkiencreatures
    username: your_user
    password: your_password
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQLDialect
  main:
    allow-circular-references: true

jwt:
  secret: your_secure_secret_key

```

(application-prod.yml)

```
spring:
  datasource:
    url: jdbc:mysql://${DB_HOST:localhost}:${DB_PORT:3306}/${DB_NAME:tolkienCreatures}?useSSL=true&allowPublicKeyRetrieval=true&serverTimezone=UTC
    username: ${DB_USER:root}
    password: ${DB_PASS:Arestom123!}
    driver-class-name: com.mysql.cj.jdbc.Driver

  jpa:
    hibernate:
      ddl-auto: validate  # No modifica la estructura de tablas
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQLDialect
        format_sql: false

  web:
    cors:
      allowed-origins: "https://tu-dominio.com"
      allowed-methods: "GET,POST,PUT,DELETE,OPTIONS"
      allowed-headers: "*"
      allow-credentials: true

jwt:
  secret: ${JWT_SECRET:mi_clave_super_secreta_para_firmar_tokens_123456789}
  expiration: ${JWT_EXPIRATION:86400000}


```


(application-test.yml)

```
spring:
  datasource:
    url: jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1
    driver-class-name: org.h2.Driver
    username: sa
    password:

  jpa:
    hibernate:
      ddl-auto: create-drop
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.H2Dialect

  sql:
    init:
      mode: always

jwt:
  secret: test_secret_para_pruebas_123456789
  expiration: 3600000 # 1 hora

logging:
  level:
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE
```


4️⃣ Run the backend
```
cd backend
./mvnw spring-boot:run
📍 Server runs at http://localhost:8080
```
5️⃣ Run the frontend
```
cd frontend
npm install
npm run dev
📍 Frontend runs at http://localhost:3000

```
🔐 Authentication & Roles

🔑 JWT System

    All users authenticate using JWT tokens.
    Protected routes require the following header:
    makefile
    Authorization: Bearer <token>

🧙‍♂️ Available Roles
```
Role	Permissions
ROLE_USER	CRUD for their own creatures
ROLE_ADMIN	Can view, edit, and delete any user or creature in the system
```
📚 API Endpoints

🧍‍♂️ Authentication (/api/auth)
```
Method	Endpoint	Description
POST	/register	Register a new user
POST	/login	Log in and receive a JWT token
```
🐉 Creatures (/api/creatures)
```
Method	Endpoint	Description
GET	/api/creatures	Get all creatures belonging to the authenticated user
GET	/api/creatures/{id}	Get details of a specific creature
POST	/api/creatures	Create a new creature
PUT	/api/creatures/{id}	Update an existing creature
DELETE	/api/creatures/{id}	Delete a creature
POST	/api/creatures/{id}/train	Train a creature (gain XP and level up)
POST	/api/creatures/{id}/rest	Rest a creature (recover health)
```
🧙‍♀️ Admin (/api/admin)
```
Method	Endpoint	Description
GET	/api/admin/users	List all users
DELETE	/api/admin/users/{id}	Delete a user and all their creatures
GET	/api/admin/users/{userId}/creatures	Get all creatures belonging to a specific user
DELETE	/api/admin/creatures/{id}	Delete a creature (no owner validation required)
```
⚔️ Game Logic
```
Each creature has a set of base stats:

Property	Description
level	Current level
experience	Accumulated experience (increases with training or battles)
health	Current health (decreases in battle, recovers with rest)
attack	Attack power
defense	Defense capability
inCombat	Whether the creature is currently in combat
```
🧠 Training (/train)
```
When a creature trains:

Gains +10 XP per session

If it reaches 100 XP, it levels up

On leveling up:

level +1

attack +5

defense +3

health resets to 100 + (level * 10)
```
😴 Rest (/rest)
```
Recovers +20 health, up to a maximum of 100.
```
## 🧰 Example Workflow


1️⃣ Register a User
```
POST /api/auth/register
{
  "email": "frodo@shire.com",
  "password": "ringbearer"
}
```
2️⃣ Login
```
POST /api/auth/login
{
  "email": "frodo@shire.com",
  "password": "ringbearer"
}
```
→ Returns a JWT token

3️⃣ Create a Creature
```
POST /api/creatures
Authorization: Bearer <token>
{
  "name": "Smaug",
  "race": "Dragon",
  "characterClass": "BARBARO",
  "imageUrl": "https://example.com/smaug.png"
}
```
4️⃣ Train a Creature
```
POST /api/creatures/1/train
Authorization: Bearer <token>
```

5️⃣ Delete a Creature (Admin)

```
DELETE /api/admin/creatures/1
Authorization: Bearer <admin_token>
```

🧠 System Architecture
vbnet
```
frontend/
 ├── components/
 ├── pages/
 ├── lib/
 └── public/
backend/
 ├── controller/
 ├── dto/
 ├── model/
 ├── repo/
 ├── service/
 └── security/
 ```
💬 Learning Reflection

```
During development, generative AI (ChatGPT + V0 App by Vercel) was used to:

Generate the initial backend and frontend codebase.

Debug errors and refine API communication.

Add extra features such as training, classes, and role-based access.

Learn and apply best practices in RESTful design and JWT security.

This process made it possible to:

Understand how to generate and adapt code using AI tools.

Connect and synchronize a real frontend with a backend API.

Build a scalable and secure web application from scratch.
```

👨‍💻 Author

```
Arnau Asole
```

🔗 GitHub Repository
```
https://github.com/ArnauAsole/S5.02-Pet-Virtual-Web-App.git
```

🪄 License
```
This project was developed for educational purposes.
Inspired by the world of J.R.R. Tolkien.
```