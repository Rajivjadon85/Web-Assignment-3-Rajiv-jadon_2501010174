# Inventory and Data Management System

**Course:** Web Development (2nd Year)  
**Assignment:** Assignment 3  
**Submitted by:** Rajiv Jadon  
**Roll / Student ID:** 2501010174  

---

## 📌 Project Overview

This project is a robust, modular RESTful API built using **Node.js**, **Express.js**, and **MongoDB (Mongoose)** for managing an inventory catalog. It includes complete CRUD capabilities, advanced filtering, full-text regex search, sorting, pagination, atomic stock adjustments to prevent race conditions, and category-level aggregation analytics.

---

## 🛠️ Tech Stack & Dependencies

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database:** MongoDB via Mongoose ODM
- **Utilities:** `dotenv` (environment variables), `cors` (cross-origin resource sharing)

---

## 🚀 Quick Setup & Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` or create `.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/inventory_db
```
*(Replace `MONGO_URI` with your local MongoDB URI or MongoDB Atlas connection string)*

### 3. Seed Sample Data (Optional but Recommended)
Populates the database with 12 realistic sample products across multiple categories:
```bash
npm run seed
```

### 4. Start the Application
- **Production Mode:**
  ```bash
  npm start
  ```
- **Development Mode (Auto-reload on file change):**
  ```bash
  npm run dev
  ```

The server will start listening at: `http://localhost:5000`

---

## 📋 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API status, metadata & endpoint directory |
| `POST` | `/api/products` | Create a new product |
| `GET` | `/api/products` | Retrieve products (with search, filter, sort, pagination) |
| `GET` | `/api/products/low-stock` | Get items where `quantity <= reorderLevel` |
| `GET` | `/api/products/summary` | Category-wise aggregation summary |
| `GET` | `/api/products/:id` | Retrieve single product by ID |
| `PUT` | `/api/products/:id` | Update product details |
| `PATCH` | `/api/products/:id/stock` | Adjust inventory stock atomically (`{ "change": 10 }` or `{ "change": -3 }`) |
| `DELETE` | `/api/products/:id` | Delete product by ID |

---

## 🔍 Detailed Usage & Query Parameters

### 1. List Products (`GET /api/products`)
Supports query parameters for querying and filtering:
- `search`: Filter by name (case-insensitive substring)
- `category`: Filter by exact category (case-insensitive)
- `supplier`: Filter by supplier name (case-insensitive)
- `minPrice`: Minimum price boundary
- `maxPrice`: Maximum price boundary
- `sort`: Comma-separated list of fields. Prefix with `-` for descending order (e.g. `-price,name`)
- `page`: Page number (default: `1`)
- `limit`: Items per page (default: `10`, max: `100`)

**Example:**
```http
GET /api/products?category=Electronics&minPrice=1000&sort=-price&page=1&limit=5
```

---

### 2. Create Product (`POST /api/products`)
**Request Body:**
```json
{
  "name": "Wireless Gaming Mouse",
  "sku": "ELEC-MS-201",
  "category": "Electronics",
  "price": 1899,
  "quantity": 45,
  "reorderLevel": 15,
  "supplier": "Razer India"
}
```

**Validation Rules:**
- `name`: Required, 2-100 characters.
- `sku`: Required, unique, uppercase alphanumeric with hyphens (`/^[A-Z0-9-]+$/`).
- `category`: Required string.
- `price`: Required, non-negative number.
- `quantity`: Optional integer >= 0 (default: 0).
- `reorderLevel`: Optional integer >= 0 (default: 10).
- `supplier`: Optional string.

---

### 3. Low Stock Alert (`GET /api/products/low-stock`)
Returns all inventory items whose `quantity` has fallen below or reached their respective `reorderLevel` using MongoDB `$expr: { $lte: ['$quantity', '$reorderLevel'] }`.

---

### 4. Category Summary Aggregation (`GET /api/products/summary`)
Uses MongoDB Aggregation Pipeline (`$group`, `$project`, `$sort`) to compute:
- Total distinct items per category
- Total inventory quantity
- Total stock valuation (`sum(price * quantity)`)
- Average product price (rounded to 2 decimal places)

---

### 5. Atomic Stock Adjustment (`PATCH /api/products/:id/stock`)
Restock inventory or record a sale safely:
```json
{
  "change": -5
}
```
> **Safety Guard:** Stock adjustments use MongoDB's atomic `$inc` with a quantity condition (`quantity >= Math.abs(change)`). If a sale request exceeds available stock, the operation fails with HTTP `400 Insufficient stock`, guaranteeing stock never becomes negative even under concurrent requests.

---

## 🗂️ Project Architecture

```
.
├── .env.example              # Sample environment variables
├── .gitignore                # Git ignore file (node_modules, .env)
├── package.json              # Project configuration and scripts
├── server.js                 # Express application entry point
├── seed.js                   # Database seeding script with realistic data
├── README.md                 # Complete documentation
└── src/
    ├── config/
    │   └── db.js             # Mongoose connection setup
    ├── controllers/
    │   └── productController.js # Request handlers & business logic
    ├── middleware/
    │   ├── errorHandler.js   # Centralized error handler (Mongoose, Cast, 404, 409)
    │   └── validation.js     # Body validation & ObjectId checks
    ├── models/
    │   └── Product.js        # Mongoose Schema, virtuals, and indexes
    ├── routes/
    │   └── productRoutes.js  # API route definitions
    └── utils/
        ├── apiError.js       # Custom operational error class
        └── asyncHandler.js   # Async wrapper to handle promise rejections
```

---

## 🛡️ Error Handling

The API utilizes centralized error handling for consistent responses:
- `400 Bad Request`: Validation failure, invalid ObjectId, malformed JSON body.
- `404 Not Found`: Endpoint or product ID not found.
- `409 Conflict`: Attempting to use a duplicate SKU.
- `500 Internal Server Error`: Unhandled server-side exceptions.

---

## 👤 Author

- **Rajiv Jadon**
- Roll Number: `2501010174`
- Assignment 3: Web Development
