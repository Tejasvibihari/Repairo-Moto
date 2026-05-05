# Repairo Moto

A full-stack bike repair service platform that connects customers with mechanics and vendors. The system supports booking, real-time tracking, invoicing, referral earnings, and role-based dashboards for Admins, Employees (Mechanics), Vendors, and Users.

---

## Tech Stack

### Frontend (Client)
- **React 19** with Vite
- **Redux Toolkit** + Redux Persist (state management)
- **React Router DOM v7**
- **Tailwind CSS v4**
- **MUI (Material UI v7)**
- **Framer Motion** (animations)
- **React Leaflet** (service area maps)
- **Three.js / @react-three/fiber** (3D visuals)
- **D3.js** (charts)
- **Jodit React** (rich text blog editor)
- **QRCode.react** (QR generation)
- **XLSX** (spreadsheet export)
- **Socket.IO Client** (real-time chat)
- **Axios**

### Backend (Server)
- **Node.js** with **Express 5**
- **MongoDB** + **Mongoose**
- **Socket.IO** (real-time chat)
- **JWT** (authentication)
- **Bcrypt** (password hashing)
- **Multer** (file/image uploads)
- **Nodemailer** (email notifications)
- **Razorpay** (payment gateway + webhook)
- **Node-Cron** (scheduled jobs)
- **Dotenv**

---

## Project Structure

```
Repairo-Moto/
├── client/                   # React frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── slice/        # Redux slices (admin, user, employee, vendor, brand)
│   │   │   └── store.js      # Redux store with persist config
│   │   ├── components/       # Reusable UI components
│   │   │   ├── auth/         # Sign-in/Sign-up forms per role
│   │   │   ├── ui/           # Sidebar, Navbar, Pagination, Dialogs, etc.
│   │   │   └── ...           # Feature components
│   │   ├── pages/
│   │   │   ├── auth/         # Auth pages (Admin, Employee, Vendor, User)
│   │   │   ├── dashboard/    # Admin dashboard pages
│   │   │   ├── employee/     # Employee (mechanic) dashboard pages
│   │   │   ├── vendor/       # Vendor dashboard pages
│   │   │   ├── user/         # User account pages
│   │   │   └── landing/      # Public-facing pages (Home, Services, Blog, etc.)
│   │   ├── service/          # Axios API service layer
│   │   └── utils/            # Helper utilities
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── server/                   # Node.js/Express backend
    ├── Controllers/          # Business logic per entity
    ├── Models/               # Mongoose schemas
    ├── Routes/               # Express route definitions
    ├── Middleware/           # Auth guards, Multer configs
    ├── Utils/                # Mailer, invoice template, cron jobs
    ├── services/             # Notification & push services
    ├── sockets/              # Socket.IO chat handler
    ├── static/               # Served static files
    ├── index.js              # App entry point
    └── package.json
```

---

## Features

### User
- Register / Login with email & password
- Book a bike repair (Scheduled or Emergency)
- Track mechanic location in real-time
- View all bookings and booking details
- Add bike profile (brand, model, CC, BS)
- Generate and share QR code for quick booking
- Referral system with wallet earnings and withdrawal requests
- Real-time chat with admin/mechanic

### Admin
- Dashboard with key metrics
- Manage orders — assign mechanic, update status, generate invoice
- Manage employees (mechanics) and vendors
- Manage service areas with map-based boundaries
- Manage bike brands and models
- Manage blog content (rich text editor)
- Referral and earnings overview
- Manual booking form
- QR code management
- Manual invoice creation

### Employee (Mechanic)
- Separate login and dashboard
- View and manage assigned bookings
- Access to blog, QR, vendor, and user management (role-permissioned)
- Invoice viewing
- Referral tracking

### Vendor
- Separate login and dashboard
- View and manage vendor orders
- Referral tracking
- Profile management

---

## Role-Based Authentication

Each role has its own authentication middleware and JWT token flow:

| Role     | Route Prefix            | Middleware         |
|----------|-------------------------|--------------------|
| Admin    | `/api/admin`            | `authAdmin.js`     |
| User     | `/api/user`             | `authUser.js`      |
| Employee | `/api/employee/auth`    | `employeeAuth.js`  |
| Vendor   | `/api/vendor/auth`      | `vendorAuth.js`    |

---

## API Routes

| Prefix                       | Resource                        |
|------------------------------|---------------------------------|
| `/api/admin`                 | Admin auth & management         |
| `/api/admin/brands`          | Bike brands & models            |
| `/api/admin/order`           | Order management                |
| `/api/admin/employee`        | Employee management             |
| `/api/admin/blog`            | Blog management                 |
| `/api/admin/dashboard`       | Dashboard metrics               |
| `/api/vendor`                | Vendor management               |
| `/api/vendor/auth`           | Vendor auth                     |
| `/api/vendor/vendororder`    | Vendor orders                   |
| `/api/user`                  | User auth & profile             |
| `/api/employee/auth`         | Employee auth                   |
| `/api/orders`                | Payment & order creation        |
| `/api/webhooks/razorpay`     | Razorpay payment webhook        |
| `/api/bike-profiles`         | User bike profiles              |
| `/api/service-areas`         | Service area management         |
| `/api/notifications`         | Notifications                   |
| `/api/chat`                  | Chat messages                   |
| `/api/manual-invoices`       | Manual invoice creation         |

---

## Database Models

| Model            | Description                                      |
|------------------|--------------------------------------------------|
| `User`           | Customer with referral wallet and withdrawal     |
| `Admin`          | Admin account with settings                      |
| `Employee`       | Mechanic with ratings and assigned jobs          |
| `Vendor`         | Vendor partner with ratings                      |
| `Order`          | Booking with full status lifecycle and geo-data  |
| `Invoice`        | Auto-generated invoice linked to order           |
| `ManualInvoice`  | Manually created invoice                         |
| `Brand`          | Bike brand with associated models                |
| `BikeProfile`    | User's registered bike                           |
| `ServiceArea`    | Geofenced area with coverage config              |
| `Blog`           | Blog post with rich content                      |
| `Chat`           | Chat messages between user and admin/mechanic    |
| `Notification`   | In-app notifications per role                    |
| `VendorOrder`    | Orders assigned to vendor                        |
| `AdminSettings`  | Global platform configuration                    |

---

## Order Status Flow

```
Pending → Mechanic Assigned → Mechanic Arrived → In Progress → Work Completed → Invoice Generated → Completed
```

Cancellation is also supported at applicable stages.

---

## Scheduled Jobs (Cron)

- **`photoCleanCron.js`** — Removes orphaned uploaded images from disk periodically.
- **`upcomingBookingReminder.js`** — Sends email reminders to customers before their scheduled booking time.

---

## Real-Time Features

- **Socket.IO** powers live chat between users and admin/mechanics.
- **Mechanic location tracking** — mechanic GPS coordinates are stored and updated on the order document, enabling the user to track progress.

---

## Email Notifications

Nodemailer is used to send transactional emails via SMTP. Email templates are defined in `Utils/emailTemplates.js` and `Utils/InvoiceTamplet.js`.

Emails are triggered for:
- Booking confirmation
- Booking reminders
- Invoice delivery
- Password reset (if implemented)

---

## Payment Integration

Razorpay is used for online payments:
- Order creation via `/api/orders`
- Webhook verification (raw body) at `/api/webhooks/razorpay`
- Signature verification using Razorpay secret

---

## Environment Variables

Create a `.env` file inside the `server/` directory with the following keys:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EMPLOYEE_SECRET=your_employee_jwt_secret
JWT_VENDOR_SECRET=your_vendor_jwt_secret
JWT_ADMIN_SECRET=your_admin_jwt_secret

SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_email
SMTP_PASS=your_email_password

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

---

## Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)
- Razorpay account (for payments)
- SMTP credentials (for email)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/Tejasvibihari/Repairo-Moto.git
cd Repairo-Moto
```

**2. Setup the Server**
```bash
cd server
npm install
# Create .env file with the variables listed above
npm start
```

**3. Setup the Client**
```bash
cd client
npm install
npm run dev
```

The client runs on `http://localhost:5173` and the server on `http://localhost:5000` by default.

---

## Author

**Tejasvi Bihari**  
[github.com/Tejasvibihari](https://github.com/Tejasvibihari)

---

## License

ISC
