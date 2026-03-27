# 🏀 HoopRise — Youth Basketball Platform

Rwanda's #1 Youth Basketball Platform. Book courts, join programs, request equipment and rise together.

**Live Demo:** https://zesty-dango-155437.netlify.app

---

## 📋 Prerequisites

Make sure you have these installed before starting:

- [Node.js](https://nodejs.org) v18 or higher
- [MySQL](https://dev.mysql.com/downloads/installer/) v8.0 or higher
- [Git](https://git-scm.com)

---

## 🚀 Getting Started

### Step 1 — Clone the Repository
```bash
git clone https://github.com/tgabin1/hooprise-project.git
cd hooprise-project/hooprise
```

---

### Step 2 — Set Up the Database

Open your terminal and run:
```bash
# Windows PowerShell
Get-Content server/db/schema.sql | & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p hooprise

# Mac/Linux
mysql -u root -p < server/db/schema.sql
```

Enter your MySQL password when prompted.

This will automatically:
- Create the `hooprise` database
- Create all 8 tables
- Insert sample courts, equipment and programs

---

### Step 3 — Set Up the Backend
```bash
cd server
npm install
```

Create your `.env` file:
```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

Open `.env` and fill in your values:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=hooprise

PAYPACK_CLIENT_ID=your_paypack_client_id
PAYPACK_CLIENT_SECRET=your_paypack_client_secret

EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
ADMIN_EMAIL=your_admin_email@gmail.com
```

> **EMAIL_PASS** — Use a Gmail App Password, not your regular Gmail password.
> Generate one at: https://myaccount.google.com/apppasswords
> 1. Go to your Google Account
> 2. Click Security
> 3. Click App Passwords
> 4. Type a name like "HoopRise" and click Create
> 5. Copy the 16-character password (no spaces)
> 6. Paste it as your EMAIL_PASS

> **PAYPACK** — Sign up at https://paypack.rw to get your Client ID and Secret

Start the server:
```bash
npm start
```

✅ Backend runs at: **http://localhost:5000**

---

### Step 4 — Set Up the Frontend
```bash
cd ../client
npm install
```

Create your `.env` file:
```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

The `client/.env.example` already has the correct value for local development:
```
VITE_API_URL=http://localhost:5000
```

Start the frontend:
```bash
npm run dev
```

✅ Frontend runs at: **http://localhost:3000**

---

### Step 5 — Set Up Admin Account

> ⚠️ IMPORTANT: Without this step the Admin Dashboard will not be accessible.

1. Go to **http://localhost:3000** and create an account
2. Open MySQL and run:
```bash
# Windows PowerShell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p hooprise

# Mac/Linux
mysql -u root -p hooprise
```

3. Run this SQL:
```sql
UPDATE users SET is_admin = TRUE WHERE email = 'your_email@gmail.com';
EXIT;
```

4. Log out and log back in
5. You should now see the **Admin** button in the navbar

---

## 📁 Project Structure
```
hooprise/
├── client/                    ← React frontend (Vite)
│   ├── .env.example
│   └── src/
│       ├── App.jsx
│       ├── index.css
│       └── components/
│           ├── Navbar.jsx
│           ├── Hero.jsx
│           ├── Courts.jsx
│           ├── Programs.jsx
│           ├── AuthModal.jsx
│           ├── BookingModal.jsx
│           ├── BookingHistory.jsx
│           ├── ProfileModal.jsx
│           ├── EquipmentModal.jsx
│           ├── AdminDashboard.jsx
│           ├── AdminPasswordModal.jsx
│           ├── NotificationBell.jsx
│           ├── Toast.jsx
│           ├── Footer.jsx
│           ├── Features.jsx
│           ├── HowItWorks.jsx
│           └── CTABanner.jsx
│
└── server/                    ← Node.js + Express backend
    ├── .env.example
    ├── index.js
    ├── db/
    │   ├── connection.js
    │   └── schema.sql
    ├── routes/
    │   ├── auth.js
    │   ├── courts.js
    │   ├── bookings.js
    │   ├── equipment.js
    │   ├── programs.js
    │   ├── notifications.js
    │   └── admin.js
    └── services/
        ├── email.js
        └── payment.js
```

---

## 🔌 API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| POST | /api/auth/signup | Create account |
| POST | /api/auth/login | Login |
| GET | /api/auth/profile/:id | Get profile |
| PUT | /api/auth/profile/:id | Update profile |
| PUT | /api/auth/change-password/:id | Change password |
| GET | /api/courts | List all courts |
| GET | /api/courts/:id/booked-slots | Get booked slots |
| POST | /api/bookings | Create booking |
| GET | /api/bookings/user/:email | Get user bookings |
| GET | /api/equipment | List equipment |
| POST | /api/equipment/request | Request equipment |
| POST | /api/equipment/share | Share equipment |
| GET | /api/equipment/my-requests/:email | Get user requests |
| GET | /api/programs | List programs |
| POST | /api/programs/register | Register for program |
| GET | /api/programs/my-registrations/:email | Get user registrations |
| GET | /api/notifications/:email | Get notifications |
| PUT | /api/notifications/mark-read/:id | Mark as read |
| PUT | /api/notifications/mark-all/:email | Mark all as read |

---

## ✨ Features

- **Court Booking** — Book basketball courts with MTN MoMo and Airtel Money payments via Paypack
- **User Profiles** — Create and edit your player profile with position and location
- **Equipment** — Request or share sports equipment with the community
- **Programs** — Register for training camps, tournaments and workshops
- **Notifications** — In-app and email notifications for all activities
- **Admin Dashboard** — Manage courts, bookings, users, equipment and programs
- **Google Maps** — View court locations directly on Google Maps
- **3D Effects** — Floating basketball, particle background and 3D card tilt effects

---

## 🛠️ Built With

- **React 18** + **Vite** — Frontend
- **Node.js** + **Express** — Backend API
- **MySQL2** — Database
- **bcryptjs** — Password hashing
- **Nodemailer** — Email notifications
- **Paypack** — MTN MoMo and Airtel Money payments
- **Axios** — HTTP requests

---

## 🌐 Deployment

- **Frontend** — [Netlify](https://netlify.com)
- **Backend** — [Render](https://render.com)
- **Database** — [Aiven MySQL](https://aiven.io)

---

## ⚠️ Important Notes

- Render free tier sleeps after 15 minutes of inactivity — first request may take ~50 seconds
- For payments to work in production, your Paypack account must be approved for live transactions
- Never commit your `.env` file — it contains sensitive credentials

---

Made with ❤️ in Rwanda 🇷🇼