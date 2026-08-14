# 🌱 Green Root Market

A full-stack plant e-commerce app — Django REST API backend + React frontend.
Browse plants, add to cart, check out, and track orders.

```
green-root-market/
├── backend/     Django + Django REST Framework API
└── frontend/    React app (Create React App)
```

---

## 1. Prerequisites

| Tool    | Version      |
|---------|--------------|
| Python  | 3.10 – 3.12  |
| Node.js | 18.x or 20.x (LTS) |
| npm     | 9+ (comes with Node) |

Check what you have:
```bash
python --version
node --version
npm --version
```

---

## 2. Backend setup (Django)

```bash
cd backend

# create + activate a virtual environment
python -m venv venv
source venv/bin/activate      # Mac/Linux
venv\Scripts\activate         # Windows

# install dependencies
pip install -r requirements.txt

# copy env file (defaults work fine for local dev)
cp .env.example .env

# create the database tables
python manage.py migrate

# (optional) create an admin login
python manage.py createsuperuser

# (optional) load 15 sample plants + 5 categories
python manage.py seed_data

# start the API server
python manage.py runserver
```
Backend runs at **http://127.0.0.1:8000**
Admin panel: **http://127.0.0.1:8000/admin**

---

## 3. Frontend setup (React)

Open a **second terminal**:
```bash
cd frontend

npm install

# copy env file (defaults work fine for local dev)
cp .env.example .env

npm start
```
Frontend runs at **http://localhost:3000** and talks to the Django API automatically.

---

## 4. Using the app

1. Go to `http://localhost:3000`
2. Click **Sign up** to create an account
3. Browse **Shop**, add plants to your **Cart**
4. Go to **Checkout**, enter a shipping address, place the order
5. View it under **Orders**

---

## 5. API reference (backend)

| Method | Endpoint                     | Auth required | Description                  |
|--------|-------------------------------|:---:|-------------------------------|
| POST   | `/api/auth/register/`         | –  | Create an account             |
| POST   | `/api/auth/login/`            | –  | Get access + refresh tokens   |
| POST   | `/api/auth/refresh/`          | –  | Refresh an access token       |
| GET    | `/api/auth/me/`               | ✅ | Current user profile          |
| GET    | `/api/products/`              | –  | List products (search, category, ordering) |
| GET    | `/api/products/<slug>/`       | –  | Product detail                |
| GET    | `/api/categories/`            | –  | List categories               |
| GET/POST | `/api/cart/`                | ✅ | View cart / add item          |
| PATCH/DELETE | `/api/cart/items/<id>/`  | ✅ | Update or remove a cart item  |
| GET    | `/api/orders/`                | ✅ | Order history                 |
| POST   | `/api/orders/checkout/`       | ✅ | Place an order from the cart  |

Query params on `/api/products/`: `?search=basil`, `?category=indoor-plants`, `?ordering=price`.

---

## 6. Project structure

```
backend/
├── green_root_market/     settings, urls, wsgi/asgi
├── store/
│   ├── models.py          Category, Product, Cart, CartItem, Order, OrderItem
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   ├── admin.py
│   └── management/commands/seed_data.py
├── manage.py
└── requirements.txt

frontend/
├── public/
├── src/
│   ├── api/axios.js        API client with JWT auto-refresh
│   ├── context/             AuthContext, CartContext
│   ├── components/          Navbar, Footer, ProductCard, Loader, ProtectedRoute
│   ├── pages/                Home, Products, ProductDetail, Cart, Checkout, Orders, Login, Register
│   ├── styles/index.css     Design system (colors, type, components)
│   ├── App.js                Routes
│   └── index.js
└── package.json
```

---

## 7. Troubleshooting

- **CORS error in browser console** → make sure the backend is running on port 8000 and `CORS_ALLOWED_ORIGINS` in `backend/.env` includes `http://localhost:3000`.
- **401 errors after a while** → the access token expired; the frontend auto-refreshes it using the refresh token. If it still fails, log out and log back in.
- **`ModuleNotFoundError: No module named 'django'`** → your virtual environment isn't activated, or `pip install -r requirements.txt` wasn't run inside it.
- **Port already in use** → run Django on another port: `python manage.py runserver 8001` (and update `REACT_APP_API_URL` in `frontend/.env` to match).

---

## 8. Moving to production (later)

- Set `DJANGO_DEBUG=False` and a strong `DJANGO_SECRET_KEY` in `backend/.env`.
- Swap SQLite for PostgreSQL by changing `DATABASES` in `backend/green_root_market/settings.py`.
- Set `REACT_APP_API_URL` to your deployed API URL before running `npm run build`.
- Serve product images from cloud storage (e.g. S3) instead of local `media/`.
