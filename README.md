<div align="center">

# 🏋️‍♂️ Elite Gym - Enterprise Management System

[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.0-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-17%20%7C%2022-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![JWT](https://img.shields.io/badge/JWT-Stateless_Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![JUnit 5](https://img.shields.io/badge/JUnit-5.10-25A162?style=for-the-badge&logo=junit5&logoColor=white)](https://junit.org/junit5/)

<p align="center">
  A production-grade, multi-role Gym Management Web Application built with high-performance Java Spring Boot, React SPA, and MySQL. Featuring complete workflow automation for memberships, digital payments, attendance streaks, personalized training routines, body biometric tracking, support ticketing, and real-time executive dashboards.
</p>

[Quick Start](#-quick-start--installation) • [Architecture](#-system-architecture--tech-stack) • [Feature Matrix](#-feature-matrix-phases-18) • [API Directory](#-rest-api-directory) • [Docker Deployment](#-docker-containerization)

</div>

---

## 🏛️ System Architecture & Tech Stack

```
                                      ┌──────────────────────────────────────┐
                                      │        Client Web Browser            │
                                      │   (React 18 + Framer Motion SPA)     │
                                      └──────────────────┬───────────────────┘
                                                         │ HTTP / JSON
                                                         ▼ :80 / :5173
                                      ┌──────────────────────────────────────┐
                                      │       Nginx Reverse Proxy & Static   │
                                      │   (SPA Routing + Gzip + Cache-Control)
                                      └──────────────────┬───────────────────┘
                                                         │ /api/ Reverse Proxy
                                                         ▼ :8080
 ┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 │                                   Spring Boot 3.3.0 Backend Layer                                      │
 │                                                                                                        │
 │  ┌───────────────────────┐   ┌──────────────────────────┐   ┌───────────────────────────────────────┐  │
 │  │ Spring Security 6     │   │ REST API Controllers     │   │ Global Exception Handler              │  │
 │  │ - JWT Filter (HMAC512)│──▶│ - Dual URL Mapping       │──▶│ - Standardized ApiResponse<T> Envelop │  │
 │  │ - RBAC PreAuthorize   │   │   (/api/* & /api/v1/*)   │   │ - Bean Validation Error Interceptor   │  │
 │  └───────────────────────┘   └────────────┬─────────────┘   └───────────────────────────────────────┘  │
 │                                           │                                                            │
 │                                           ▼                                                            │
 │  ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐  │
 │  │ Concrete Business Services (Auth, Payment, Attendance, Progress, Workout, Complaint, Dashboard)   │  │
 │  └────────────────────────────────────────┬─────────────────────────────────────────────────────────┘  │
 │                                           │                                                            │
 │                                           ▼                                                            │
 │  ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐  │
 │  │ Spring Data JPA Repositories (Optimized JPQL Queries with JOIN FETCH to prevent N+1 queries)     │  │
 │  └────────────────────────────────────────┬─────────────────────────────────────────────────────────┘  │
 └───────────────────────────────────────────┼────────────────────────────────────────────────────────────┘
                                             │ JDBC / HikariCP Pool
                                             ▼ :3306
 ┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 │                               MySQL 8.0 Normalized 14-Table Database Schema                            │
 │  users • student_profiles • trainer_profiles • membership_plans • student_memberships • payments      │
 │  attendances • workout_plans • workout_exercises • trainer_requests • progress_entries                 │
 │  progress_photos • complaints • notifications                                                          │
 └────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Technology Matrix

| Layer | Technologies & Libraries |
|---|---|
| **Backend Framework** | Spring Boot 3.3.0, Spring MVC, Spring Data JPA, Spring Validation |
| **Security & Auth** | Spring Security 6, JJWT 0.12.5 (HMAC-SHA512), BCrypt password hashing |
| **Database & ORM** | MySQL 8.0, Hibernate 6.5, HikariCP Connection Pool (10 Max / 5 Min Idle) |
| **Frontend Framework** | React 18.3, React Router DOM 6.23, Vite 5.4 |
| **Styling & Motion** | Pure CSS Custom Properties, Glassmorphism, Dark/Light Theme Tokens, Framer Motion |
| **Icons & Media** | React Icons (HeroIcons / FontAwesome) |
| **DevOps & Containers**| Multi-stage Docker, Alpine Linux, Nginx 1.25, Docker Compose v2 |
| **Testing** | JUnit 5, Mockito 5.11, MockMvc, AssertJ |

---

## 🔐 Role-Based Access Control (RBAC)

The application enforces strict role segmentation across three core user domains:

```
                  ┌──────────────────────────────────────────────────┐
                  │                 Application User                 │
                  └─────────┬────────────────┬─────────────────┬─────┘
                            │                │                 │
              ROLE_STUDENT  │   ROLE_TRAINER │      ROLE_ADMIN │
                            ▼                ▼                 ▼
             ┌─────────────────┐ ┌─────────────────┐ ┌───────────────────┐
             │ Student Member  │ │ Personal Coach  │ │ General Admin     │
             │ - Subscription  │ │ - Athlete Roster│ │ - Financial Ledger│
             │ - Daily Check-in│ │ - Plan Builder  │ │ - Staff & Members │
             │ - Workout Split │ │ - Consultation  │ │ - Plan Catalog    │
             │ - Biometrics    │ │ - Capacity Cap  │ │ - Ticket Triage  │
             │ - Support Desk  │ │                 │ │ - Executive KPIs  │
             └─────────────────┘ └─────────────────┘ └───────────────────┘
```

---

## ⚡ Feature Matrix (Phases 1–8)

### 1. Authentication & Security (Phase 1)
* **JWT Stateless Flow**: Dual token generation with HMAC-SHA512 signing, 24-hour expiration, and token refresh support.
* **Role Verification Guards**: Method-level security annotations (`@PreAuthorize("hasRole('...')")`) coupled with React Router client guards (`<ProtectedRoute allowedRoles={[...]} />`).
* **Data Privacy**: Passwords hashed with BCrypt (10 rounds); sensitive user biometrics restricted to personal owner and assigned trainers.

### 2. Workouts & Trainer Management (Phase 2)
* **Custom Plan Builder**: Multi-day routine constructor supporting exercise splits, sets, reps, weight targets, and rest intervals.
* **Coaching Capacity Enforcement**: Prevents trainer over-allocation with automated capacity checks (`maxStudentCapacity`).
* **Direct Consultation Desk**: Student-to-trainer request system for assignment, routine modification, and 1-on-1 slot bookings.

### 3. Smart Attendance Management (Phase 3)
* **One-Click Check-In / Check-Out**: Real-time floor session timestamping with automated duration calculation.
* **Daily Streak Engine**: Streak algorithm calculating continuous workout days and attendance rate percentages over 30-day rolling windows.
* **Lateness Detection**: Automated status categorization (`PRESENT`, `LATE`, `ABSENT`).

### 4. Progress Tracking & Biometrics (Phase 4)
* **Biometric Journaling**: Track historical weight (kg), height (cm), body fat %, chest, waist, hips, biceps, and thighs measurements.
* **Visual Progress Gallery**: Multi-angle photo logger categorized by `BEFORE`, `PROGRESS`, and `AFTER` milestones.
* **Transformation Analytics**: Automatic delta calculations showing total weight lost/gained and body fat composition changes.

### 5. Grievances & Notifications (Phase 5)
* **Support Ticket Desk**: Issue ticketing categorized by `EQUIPMENT`, `FACILITY`, `TRAINER`, `BILLING`, or `OTHER` with priority weighting (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
* **Admin Triage Portal**: Real-time response and ticket resolution workflow (`OPEN` ➔ `IN_PROGRESS` ➔ `RESOLVED` / `CLOSED`).
* **In-App Notification Center**: Instant alert system notifying users of membership renewals, workout assignments, and support updates.

### 6. Subscriptions & Payments (Phase 6)
* **Digital Checkout Flow**: Flexible payment gateway simulation supporting `CREDIT_CARD`, `DEBIT_CARD`, `UPI`, `NET_BANKING`, and `CASH`.
* **Automated Invoice Engine**: Unique invoice generation (`INV-YYYYMMDD-XXXX`) with tax calculations, itemization, and instant status updates.
* **Administrative Financial Ledger**: Filterable revenue stream with totals, transaction auditing, and refund management.

### 7. Executive Command Dashboards (Phase 8)
* **Student Dashboard**: Live membership status, countdown days, attendance streak flame, today's workout split, body progress widget, and assigned coach profile.
* **Trainer Dashboard**: Active athlete count vs capacity bar, pending consultation request triage, managed routine library, and student quick-actions.
* **Admin Command Center**: Macro KPIs (total members, staff trainers, gross revenue in INR `₹`, today's check-ins, open grievances), recent transaction stream, and urgent ticket queue.

---

## 🚀 Quick Start & Installation

### Method 1: Docker Compose (Recommended)

Run the complete stack (MySQL 8.0, Spring Boot, React + Nginx) with a single command:

```bash
# 1. Clone the repository
git clone https://github.com/your-username/elite-gym.git
cd "elite-gym"

# 2. Build and start all containers in background
docker compose up --build -d
```

* **Frontend Web App**: [`http://localhost`](http://localhost) (Port 80)
* **Backend REST API**: [`http://localhost:8080/api`](http://localhost:8080/api) (Port 8080)

To view logs or stop:
```bash
# View live logs
docker compose logs -f

# Stop containers
docker compose down
```

---

### Method 2: Manual Local Setup

#### Prerequisites
* **Java**: OpenJDK 17 or 22
* **Maven**: Apache Maven 3.9+
* **Node.js**: v18.0+ & npm v9.0+
* **Database**: MySQL Server 8.0+ running on port `3306`

#### Step 1: Database Initialization
Open MySQL CLI or Workbench and run the DDL schema:
```bash
mysql -u root -p < "./database/schema.sql"
```

#### Step 2: Run the Spring Boot Backend
```bash
cd backend

# Compile and run
mvn spring-boot:run
```
*Backend runs on `http://localhost:8080`*

#### Step 3: Run the React Frontend
```bash
cd ../frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 🔑 Seeded Demo Credentials

The backend automatically seeds a default system administrator and 3 starter membership plans on initial startup:

| Role | Username / Email | Password | Pre-configured Data |
|---|---|---|---|
| **System Admin** | `admin` / `admin@elitegym.com` | `Admin@123456` | Full administrative ledger & plan controls |
| **New Student** | *Self-register at `/register`* | *Your password* | Auto-creates `StudentProfile` & metric tracker |
| **New Trainer** | *Self-register as Trainer* | *Your password* | Auto-creates `TrainerProfile` & 20 athlete cap |

### Starter Membership Catalog

* **Basic Monthly**: ₹29.99 / 1 Month — Standard gym floor, free weights, locker room access.
* **Pro Quarterly**: ₹79.99 / 3 Months — Sauna, hydro-massage, custom splits, functional fitness classes.
* **Elite Annual**: ₹249.99 / 12 Months — Dedicated trainer assignment, VIP private locker, biometric scans.

---

## 📡 REST API Directory

All endpoints support `/api/*` and `/api/v1/*` route prefixes:

### Public Endpoints (`/api/public/*`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/public/membership-plans` | Retrieve all active membership plan tiers |
| `GET` | `/api/public/membership-plans/{id}` | Retrieve details for a specific membership plan |

### Authentication (`/api/auth/*`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register/student` | Register new student member profile |
| `POST` | `/api/auth/register/trainer` | Register new certified trainer profile |
| `POST` | `/api/auth/login` | Authenticate user & return JWT Bearer token |
| `GET` | `/api/auth/me` | Retrieve currently authenticated user context |

### Student Endpoints (`/api/student/*`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/student/dashboard/stats` | Aggregated student KPI summary |
| `GET` | `/api/student/profile` | Retrieve student profile details & biometrics |
| `PUT` | `/api/student/profile` | Update profile information & fitness goals |
| `GET` | `/api/student/memberships/active` | Retrieve current active membership plan |
| `POST`| `/api/student/attendance/check-in`| Log daily gym floor check-in |
| `POST`| `/api/student/attendance/check-out`| Log daily gym floor check-out |
| `GET` | `/api/student/workouts/active` | Get assigned active workout routine |
| `GET` | `/api/student/progress` | Get body measurement and photo log history |
| `POST`| `/api/student/payments/checkout` | Process subscription checkout & payment |
| `GET` | `/api/student/complaints` | Get user filed support tickets |
| `POST`| `/api/student/complaints` | File a new support grievance ticket |

### Trainer Endpoints (`/api/trainer/*`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/trainer/dashboard/stats` | Aggregated trainer KPI summary & roster |
| `GET` | `/api/trainer/students` | Get all athletes assigned to this coach |
| `GET` | `/api/trainer/requests` | Retrieve pending student consultation requests |
| `PUT` | `/api/trainer/requests/{id}` | Approve or reject consultation request |
| `POST`| `/api/trainer/workouts` | Create and assign custom workout routine |
| `GET` | `/api/trainer/workouts` | Get all workout plan templates |

### Admin Endpoints (`/api/admin/*`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/dashboard/stats` | Macro KPI center (revenue, members, staff) |
| `GET` | `/api/admin/members` | Full student and trainer roster management |
| `GET` | `/api/admin/payments` | Full financial transactions ledger |
| `POST`| `/api/admin/plans` | Create new membership plan tier |
| `PUT` | `/api/admin/plans/{id}` | Edit membership plan tier pricing/status |
| `GET` | `/api/admin/complaints` | Global member support ticket triage |
| `PUT` | `/api/admin/complaints/{id}/respond` | Submit official response & resolve ticket |

---

## 🧪 Testing Suite

The backend contains unit and integration tests across services, security, and controllers.

```bash
# Navigate to backend directory
cd backend

# Execute all JUnit 5 test suites
mvn test

# Execute specific Dashboard test classes
mvn test -Dtest=DashboardServiceTest,DashboardControllersTest
```

---

## 📄 License & Standards

This project is licensed under the **MIT License**. Built with clean code standards, Spring Security 6 compliance, and modern React best practices.