# TravelGo – Travel & Tourism Management Portal

TravelGo is a full-stack web application designed for booking tour packages, processing online payments, and managing destinations, user reservations, and travel analytics. Built with a Node.js + Express backend, MySQL database, and clean HTML/CSS/Vanilla JavaScript frontend.

---

## 🚀 Features

- **User Authentication**: Secure Registration, Login, JWT authorization, and password hashing using `bcrypt`.
- **Destinations & Packages**: Browse popular travel spots and detailed tour packages with pricing, durations, and images.
- **Online Payment Gateway**:
  - Pay online using Credit/Debit Cards, UPI (GPay/PhonePe/Paytm), or Net Banking.
  - Unique transaction reference ID generation (`PAY_TG_<TIMESTAMP>_<RANDOM>`).
  - Automated instant booking status confirmation (`confirmed`) upon successful online payment.
  - Printable/Downloadable digital payment receipts.
  - "Pay Now" modal on user dashboard for existing pending bookings.
- **User Dashboard**: Track personal bookings with real-time status badges (`Pending`/`Confirmed`/`Cancelled`) and payment status badges (`PAID`/`UNPAID`).
- **Admin Control Panel**:
  - Dashboard analytics: Total Users, Total Bookings, Total Destinations, Paid Transactions, and Total Verified Revenue.
  - View Payment Status, Payment Method, and Transaction IDs in the Admin Bookings table.
  - Manage booking status and delete records.
  - User management table.
  - CRUD operations for Destinations and Tour Packages.
- **XSS Protection & Security**: Input validation via `express-validator`, HTML escaping on all dynamic frontend content, and strict admin route enforcement.

---

## 🛠️ Tech Stack

- **Backend**: Node.js (v18+), Express 5 (CommonJS), `mysql2` (Promise API with Connection Pool), `bcrypt`, `jsonwebtoken`, `dotenv`, `cors`, `express-validator`, `nodemon`.
- **Database**: MySQL 8 (InnoDB engine, utf8mb4 charset).
- **Frontend**: Plain HTML5, CSS3 (Responsive Grid & Flexbox), Vanilla JavaScript (`fetch` API).

---

## 📋 Prerequisites

- **Node.js**: v18.0.0 or higher
- **MySQL Server**: v8.0 or higher

---

## ⚙️ Installation & Setup Guide

### 1. Database Creation & Seeding
Open your terminal and run the schema and seed SQL files using MySQL CLI:

```bash
# Create database tables and indexes
mysql -u root -p < database/schema.sql

# Seed initial destinations and packages
mysql -u root -p travelgo < database/seed.sql
```

---

### 2. Backend Setup & Environment Variables
Navigate to the `backend/` directory:

```bash
cd backend
```

Create a `.env` file based on `.env.example`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Bhargavi@2710
DB_NAME=travelgo
JWT_SECRET=travelgo_super_secret_jwt_key_2026_antigravity
```

Install backend dependencies:

```bash
npm install
```

---

### 3. Create Admin Account
Execute the admin creation script to generate the default system administrator:

```bash
node scripts/createAdmin.js
```

**Default Admin Credentials:**
- **Email**: `admin@travelgo.com`
- **Password**: `Admin@123`

---

### 4. Start the Application
Run the server in development mode:

```bash
npm run dev
```

Or start standard mode:

```bash
npm start
```

Access the application in your browser at:  
👉 **http://localhost:3000**

---

## 📡 REST API Endpoint Documentation

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new user account |
| POST | `/api/auth/login` | Public | Authenticate user & return JWT |
| GET | `/api/auth/me` | User | Get authenticated user profile |

### Destinations (`/api/destinations`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/destinations` | Public | List all destinations |
| GET | `/api/destinations/:id` | Public | Get destination details by ID |

### Tour Packages (`/api/packages`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/packages` | Public | List active packages (optional `?destination_id=`) |
| GET | `/api/packages/:id` | Public | Get package details by ID |

### Bookings & Online Payments (`/api/bookings`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/bookings` | User | Create a booking request (supports optional instant online payment) |
| POST | `/api/bookings/:id/pay` | User | Process online payment for an existing unpaid booking |
| GET | `/api/bookings/my` | User | Get current user's booking history & payment transaction info |
| PATCH | `/api/bookings/:id/cancel` | User | Cancel own booking request |

### Admin Management (`/api/admin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/admin/stats` | Admin | Get system analytics & paid revenue |
| GET | `/api/admin/users` | Admin | List all registered users |
| GET | `/api/admin/bookings` | Admin | List all bookings with payment transaction IDs |
| PATCH | `/api/admin/bookings/:id/status` | Admin | Update booking status (`pending`/`confirmed`/`cancelled`) |
| DELETE | `/api/admin/bookings/:id` | Admin | Delete a booking |
| POST | `/api/admin/destinations` | Admin | Create a new destination |
| PUT | `/api/admin/destinations/:id` | Admin | Update destination |
| DELETE | `/api/admin/destinations/:id` | Admin | Delete destination |
| POST | `/api/admin/packages` | Admin | Create a new tour package |
| PUT | `/api/admin/packages/:id` | Admin | Update tour package |
| DELETE | `/api/admin/packages/:id` | Admin | Delete tour package |

---

## ❓ Troubleshooting & MySQL Common Errors

### 1. `ER_ACCESS_DENIED_ERROR`
- **Cause**: Incorrect MySQL username or password in `.env`.
- **Fix**: Open `backend/.env` and ensure `DB_USER` and `DB_PASSWORD` match your MySQL installation credentials.

### 2. `ER_NOT_SUPPORTED_AUTH_MODE`
- **Cause**: MySQL 8 default authentication plugin (`caching_sha2_password`) compatibility issue with older node clients.
- **Fix**: Update password plugin in MySQL CLI:
  ```sql
  ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'YourPassword';
  FLUSH PRIVILEGES;
  ```

### 3. `ECONNREFUSED` (Port 3306)
- **Cause**: MySQL Server service is not running or running on a non-default port.
- **Fix**: Start the MySQL service via Windows Services (`services.msc`) or run `net start MySQL80` / `net start MySQL`.

---

## 📄 License

This project is open source and available under the [ISC License](LICENSE).
