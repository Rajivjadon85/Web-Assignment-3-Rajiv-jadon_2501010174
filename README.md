# Inventory and Data Management System

REST API built with Node.js, Express, MongoDB (Mongoose) and dotenv.

**Submitted by:** Rajiv Jadon (Roll No: 2501010174)  
**Course:** Web Development - Assignment 3  

## Setup

```bash
npm install
npm run seed             # optional: loads 12 sample products
npm start                # or: npm run dev
```

Needs MongoDB running locally (`mongodb://127.0.0.1:27017/inventory_db`) or an Atlas URI in `.env`.

## Endpoints

| Method | URL | What it does |
|---|---|---|
| POST | `/api/products` | Create product |
| GET | `/api/products` | List with filter / sort / pagination |
| GET | `/api/products/:id` | Get one product |
| PUT | `/api/products/:id` | Update details (partial body OK) |
| PATCH | `/api/products/:id/stock` | Restock / sale: `{ "change": 10 }` or `{ "change": -3 }` |
| DELETE | `/api/products/:id` | Delete product |
| GET | `/api/products/low-stock` | Products where quantity <= reorderLevel |
| GET | `/api/products/summary` | Category-wise aggregation |

### Query params for `GET /api/products`

`category`, `supplier`, `search` (name), `minPrice`, `maxPrice`,
`sort` (e.g. `-price,name`), `page` (default 1), `limit` (default 10, max 100)

Example: `/api/products?category=Electronics&minPrice=1000&sort=-price&page=1&limit=5`

### Sample create body

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

## Structure

```
server.js
seed.js
package.json
README.md
src/
  config/db.js
  models/Product.js            schema + validation + stockValue virtual
  controllers/productController.js
  routes/productRoutes.js
  middleware/validate.js       body + ObjectId validation
  middleware/errorHandler.js   centralized errors (validation, duplicate SKU, cast, 404)
  utils/AppError.js, asyncHandler.js
```

## Notes

- Stock decrement is atomic (`findOneAndUpdate` with `$inc` and a `quantity >= n` guard), so stock can never go negative.
- `/low-stock` and `/summary` are declared before `/:id` so they aren't mistaken for IDs.
- Duplicate SKU returns `409`, validation errors `400`, missing product `404`.
