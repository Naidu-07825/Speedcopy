# 🚀 Speedcopy – Online Xerox & Print Service Platform

Speedcopy is a **full-stack web application** that allows users to place online printing and xerox orders with real-time order tracking, secure payments, admin management, and staff workflows.

---

## 🌟 Features

### 👤 User
- User registration & authentication
- Upload documents for printing
- Select print options (B/W, Color, Binding, Lamination, etc.)
- Order tracking with live status
- Online payments (Stripe)
- Notifications & order history

### 🛠 Admin
- Admin dashboard
- Manage users, orders, promotions
- Assign staff & delivery
- View revenue & analytics
- Handle complaints & support

### 👷 Staff / Delivery
- Role-based login
- Assigned order management
- Delivery tracking

---

## 🧰 Tech Stack

### Frontend
- React (Vite)
- React Router
- Axios
- CSS
- Socket.IO (real-time updates)

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Stripe Payments
- Nodemailer (Email)
- Twilio / SMS integration

---

## 📂 Project Structure

```bash
Speedcopy/
├── backend/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── utils/
│   └── server.js
├── frontend/
│   ├── src/
│   ├── public/
│   └── vite.config.js
├── package.json
└── README.md
