# Frontend Technology Stack & Interactions

## Tech Stack Overview

| Layer           | Technology             | Version | Purpose                      |
| --------------- | ---------------------- | ------- | ---------------------------- |
| **View**        | React + TypeScript     | 18.x    | Component-based UI           |
| **Styling**     | Tailwind CSS           | 4.1.18  | Utility-first CSS            |
| **Router**      | React Router           | 6.x     | Page routing & navigation    |
| **State**       | Redux Toolkit          | 2.9.0   | Global auth state            |
| **API State**   | React Query (TanStack) | 5.90.2  | Server state caching         |
| **HTTP Client** | Axios                  | 1.12.2  | HTTP requests + interceptors |
| **Form**        | React Hook Form + Zod  | Latest  | Form validation              |
| **Icons**       | Lucide React           | Latest  | Icon components              |
| **Build**       | Vite + TypeScript      | Latest  | Fast dev server & bundling   |

---

## Technology Interaction Diagram

```
┌──────────────────────────────────────────────────────────┐
│                    React Components                      │
│            (Pages + UI Components + Hooks)              │
└──────────────────────────┬───────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
    Redux Toolkit    React Router    React Hook Form
   (Global Auth)    (Navigation)     (Form Inputs)
        │                │                │
        └────────┬───────┴────────┬──────┘
                 ▼                ▼
            React Query ←──→ Axios + Interceptors
         (Server Cache)    (HTTP Layer + JWT)
                 │                │
                 └────────┬───────┘
                          ▼
                    Backend API
                  (REST Endpoints)
                          ▼
                    PostgreSQL Database
```

---

## Core Technologies & Roles

### 1. **React 18 + TypeScript**

```
├─ Functional Components (Pages, Widgets)
├─ Hooks (useState, useEffect, useCallback)
├─ Context API (in some cases)
└─ Type Safety (TypeScript interfaces)

Interaction:
React Components ←→ Render UI ←→ User Interactions
    ↓ (events) ↓
Redux / React Query (state updates)
```

### 2. **Redux Toolkit** (Global State)

```
Target: User authentication & role management

├─ authSlice.ts
│   ├─ State: { user, token, role, isHydrated }
│   ├─ Actions: setCredentials, logout
│   └─ Selectors: selectUser, selectRole
│
└─ Interceptors read Redux state to attach JWT token

Interaction:
Login Component
    ↓
authApi.login()
    ↓
Axios POST /auth/login
    ↓
Backend returns { token, user }
    ↓
Redux dispatch(setCredentials(...))
    ↓
localStorage.setItem('token')
    ↓
Axios interceptor reads Redux state
    ↓
All subsequent requests include Authorization header
```

### 3. **React Query (TanStack)** (Server State)

```
Target: API response caching & synchronization

├─ useQuery()
│   ├─ Queries data from backend
│   ├─ Caches by queryKey
│   ├─ Auto-retry on failure
│   └─ Returns { data, isLoading, error, refetch }
│
├─ useMutation()
│   ├─ POST/PUT/DELETE operations
│   ├─ onSuccess/onError callbacks
│   ├─ onSettled: invalidates related queries
│   └─ Returns { mutate, isPending, error }
│
└─ queryClient
    ├─ invalidateQueries() - force refetch
    ├─ setQueryData() - update cache manually
    └─ Manual cache management

Interaction:
Component mounts
    ↓
useQuery(['seller', 'bikes', page])
    ↓
Checks memory cache (exists? return immediately)
    ↓
Cache stale? (yes) → Fetch from API
    ↓
Axios request with JWT
    ↓
Backend response
    ↓
React Query stores in memory
    ↓
Component rerenders with data
    ↓
User clicks next page
    ↓
Query key changes ['seller', 'bikes', page+1]
    ↓
New query fired (different key = different cache)
```

### 4. **Axios** (HTTP Client)

```
Target: HTTP communication with backend

├─ Request Interceptor
│   ├─ Reads Redux state.auth.token
│   ├─ Adds Authorization: Bearer {token}
│   ├─ Sets Content-Type headers
│   └─ baseURL: process.env.API_URL
│
└─ Response Interceptor
    ├─ 401 (Unauthorized)
    │   ├─ Clear Redux auth
    │   ├─ Remove localStorage token
    │   ├─ Redirect to /login
    │   └─ Reject promise
    │
    ├─ 4xx/5xx errors
    │   ├─ Parse error message
    │   ├─ Pass to React Query
    │   └─ Component shows error toast
    │
    └─ 200 (Success)
        ├─ Return response.data
        └─ React Query caches it

Interaction:
Component calls useQuery()
    ↓
React Query: queryFn(() => api.getBikes())
    ↓
axios.get('/seller/v1/bikes')
    ↓
Request Interceptor
    ├─ Read Redux: user.token
    ├─ Add header: Authorization: Bearer jwt_token_here
    └─ Send request
    ↓
Backend receives + validates JWT
    ↓
Backend returns { success, data: [...], message }
    ↓
Response Interceptor logs/validates
    ↓
Return response.data
    ↓
React Query caches result
    ↓
Component rerenders
```

### 5. **React Router** (Navigation)

```
Target: Client-side page routing

├─ BrowserRouter
│   └─ <Routes>
│       ├─ <Route path="/login" element={<LoginPage />} />
│       ├─ <Route path="/seller/*" element={<RoleGuard><SellerDashboard /></RoleGuard>} />
│       ├─ <Route path="/buyer/*" element={<BuyerDashboard />} />
│       └─ <Route path="/admin/*" element={<AdminDashboard />} />
│
├─ Guards (Components)
│   ├─ AuthGuard: requires user logged in
│   ├─ RoleGuard: requires specific role
│   └─ GuestGuard: only for non-authenticated users
│
└─ useNavigate, useParams, useSearchParams

Interaction:
User clicks "Go to Dashboard"
    ↓
navigate('/seller/dashboard')
    ↓
React Router updates URL
    ↓
Matches route → renders SellerDashboard
    ↓
RoleGuard checks Redux: role === 'seller'
    ✓ Allow render
    ✗ Redirect to unauthorized
    ↓
SellerDashboard mounts
    ↓
useSellerDashboardQuery() fires
    ↓
GET /seller/v1/dashboard
    ↓
Render dashboard with data
```

### 6. **React Hook Form** (Form Management)

```
Target: Efficient form handling without re-rendering whole form

├─ useForm()
│   ├─ register() - connect input to form
│   ├─ watch() - track specific fields
│   ├─ handleSubmit() - validation before submit
│   └─ formState: { errors, isDirty, isSubmitting }
│
└─ Zod (Schema Validation)
    ├─ Define type-safe schemas
    ├─ Validate on submit
    └─ Provide typed errors

Interaction:
PostListingPage mounts
    ↓
const { register, handleSubmit, formState } = useForm()
    ↓
User fills title input
    ├─ Input value updates
    ├─ React Hook Form tracks change (no full rerender)
    └─ Only input rerenders (not whole page)
    ↓
User clicks Submit
    ↓
handleSubmit(onSubmit)
    ├─ Validates against Zod schema
    ├─ Finds errors? Show error messages
    └─ Valid? Call onSubmit()
    ↓
onSubmit fires useMutation
    ↓
FormData built from watch values
    ↓
Axios POST /seller/v1/bikes (multipart)
    ↓
Backend creates bike
    ↓
Invalidate ['seller', 'bikes'] query
    ↓
User redirected to bike detail
```

### 7. **TypeScript** (Type Safety)

```
Target: Compile-time type checking

├─ API Response Types
│   ├─ interface SellerBikeDetail { ... }
│   ├─ interface SellerBikeDetailInspection { ... }
│   └─ interface ApiResponse<T> { success, data, message }
│
├─ Component Props
│   ├─ interface SellerDashboardProps { user: User }
│   └─ type PageParams = { id: string }
│
└─ Query Keys Pattern
    └─ const queryKeys = { seller: { bikes: (...) => [...] } }

Interaction:
Define API response type:
    ↓
const response = await api.getBikes()
    ↓
TypeScript checks: response has .data, .success props?
    ✓ Yes → allow access
    ✗ No → compile error
    ↓
Component renders response.data.bikes.map(...)
    ↓
TypeScript checks: each bike has .id, .title?
    ✓ Yes → compile passes
    ✗ No → error before runtime
```

### 8. **Tailwind CSS** (Styling)

```
Target: Utility-first CSS framework

├─ Classes
│   ├─ Layout: flex, grid, gap, p-4
│   ├─ Colors: text-[#f57224], bg-blue-100
│   ├─ Responsive: sm:, md:, lg: prefixes
│   └─ States: hover:, focus:, disabled:
│
└─ Custom Config
    ├─ tailwind.config.js
    ├─ Extends colors, spacing
    └─ Integrates with dark mode

Interaction:
Design component in JSX
    ↓
Add Tailwind classes: className="flex gap-4 sm:gap-6"
    ↓
Vite processes Tailwind
    ↓
Only used classes compiled to CSS
    ↓
Final bundle includes only needed styles
```

---

## Data Flow Through Technologies

```
USER ACTION (click, type, submit)
    ↓
React Component (handleClick, onChange)
    ↓
React Router (navigate) OR React Hook Form (handleSubmit)
    ↓
Redux dispatch (setCredentials) OR React Query useMutation
    ↓
Axios request
    ├─ Request Interceptor: attach JWT from Redux
    ├─ POST/PUT/GET /api/...
    └─ Response Interceptor: handle errors
    ↓
Backend API
    ↓
Database (PostgreSQL)
    ↓
Response: { success, data, message }
    ↓
Axios returns to React Query
    ↓
React Query caches by queryKey
    ↓
Component subscribed to query
    ↓
React rerenders with new data
    ↓
Tailwind classes applied
    ↓
User sees updated UI
```

---

## Key Interactions Summary

| From            | To           | How                   | When                          |
| --------------- | ------------ | --------------------- | ----------------------------- |
| React           | Redux        | dispatch()            | After login, logout           |
| React           | React Query  | useQuery/useMutation  | Component mounts, user action |
| React Query     | Axios        | queryFn calls api.\*  | React Query needs data        |
| Axios           | Redux        | Read token from state | Every request (interceptor)   |
| Axios           | Backend      | HTTP + JWT            | After interceptor adds token  |
| Backend         | Axios        | JSON response         | After processing request      |
| Axios           | React Query  | Cache response        | Response interceptor succeeds |
| React Query     | React        | Data prop             | Component subscribed to query |
| React Router    | React        | Route match           | URL changes                   |
| React           | React Router | navigate()            | User clicks link              |
| React Hook Form | Zod          | validate()            | User clicks submit            |
| Components      | Tailwind     | className             | Every render                  |

---

## Technology Communication Points

### Redux ↔ Axios

```typescript
// Request: Redux token → Axios adds to header
axios.interceptors.request.use((config) => {
  const state = store.getState();
  const token = state.auth.token;
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response: Error handling → Redux dispatch
axios.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logout()); // ← Redux dispatch
    }
  },
);
```

### React Query ↔ React Router

```typescript
// Page component receives URL params
const { bikeId } = useParams();
// Pass to query
const { data } = useBuyerBikeDetailQuery(bikeId);
// After mutation, reroute
const { mutate } = useBuyerCreateTransactionMutation({
  onSuccess: () => navigate('/transactions'),
});
```

### React Hook Form ↔ React Query

```typescript
// Form submission → mutation
const { handleSubmit } = useForm();
const { mutate } = usePostBikeMutation();

const onSubmit = (data) => {
  mutate(data); // ← Form data → mutation
};
```

---

## Performance Optimizations

| Technology      | Optimization                                     |
| --------------- | ------------------------------------------------ |
| React Query     | Query caching (same key = same data, no refetch) |
| React Query     | Stale time (refetch only after duration)         |
| React Hook Form | Only changed fields rerender (not whole form)    |
| Axios           | Interceptors (centralized auth logic)            |
| Tailwind        | Tree-shaking (only used classes in bundle)       |
| Vite            | Code splitting (lazy load routes)                |
| React           | Keys in lists (prevent unnecessary rerenders)    |

---

**Total Technologies:** 8 main  
**Integration Points:** 12+ handoff patterns  
**Type Safety:** 100% TypeScript  
**State Managers:** 2 (Redux for auth, React Query for server)

---

---

# Backend Technology Stack & Interactions

## Backend Tech Stack Overview

| Layer            | Technology      | Version       | Purpose                       |
| ---------------- | --------------- | ------------- | ----------------------------- |
| **Runtime**      | Node.js         | 18.x          | JavaScript runtime            |
| **Framework**    | Express.js      | 4.x           | HTTP server & routing         |
| **Language**     | TypeScript      | 5.x           | Type-safe code                |
| **Database**     | PostgreSQL      | 14+           | Relational database           |
| **ORM**          | Drizzle         | 0.45.1        | Type-safe SQL queries         |
| **Auth**         | JWT + bcryptjs  | 9.0.3 / 3.0.3 | Token auth & password hashing |
| **File Storage** | AWS S3 + Multer | 2.0.2         | Image upload & storage        |
| **Payments**     | VNPay SDK       | 2.4.4         | Vietnamese payment processor  |
| **Validation**   | Zod             | Latest        | Schema validation             |
| **Env Config**   | dotenv          | 16.x          | Environment variables         |

---

## Backend Architecture Layers

```
┌─────────────────────────────────────────────────┐
│           HTTP Request                          │
│    (From Frontend via Axios)                    │
└────────────────────┬────────────────────────────┘
                     ▼
        ┌────────────────────────────┐
        │   Express Middleware       │
        │  - CORS, body-parser       │
        │  - JWT Verification        │
        │  - Error Handling          │
        └────────────────┬───────────┘
                         ▼
        ┌────────────────────────────┐
        │   Route Handlers           │
        │  (Controllers)             │
        │  - Auth, Seller, Buyer     │
        │  - Admin, Inspector        │
        └────────────────┬───────────┘
                         ▼
        ┌────────────────────────────┐
        │   Business Logic           │
        │  (Service Layer)           │
        │  - Validation              │
        │  - Business Rules          │
        └────────────────┬───────────┘
                         ▼
        ┌────────────────────────────┐
        │   Data Access Layer        │
        │  (Drizzle ORM)             │
        │  - Query Database          │
        │  - Transactions            │
        └────────────────┬───────────┘
                         ▼
        ┌────────────────────────────┐
        │   PostgreSQL Database      │
        │  - Tables, Relations       │
        │  - Data Persistence        │
        └────────────────────────────┘
                         ▼
        ┌────────────────────────────┐
        │   JSON Response            │
        │  (to Frontend)             │
        └────────────────────────────┘
```

---

## Core Backend Technologies & Roles

### 1. **Express.js** (Web Server)

```
Target: Handle HTTP requests & route to controllers

├─ Middleware
│   ├─ cors() - allow cross-origin requests
│   ├─ express.json() - parse JSON body
│   ├─ express.urlencoded() - parse form data
│   ├─ multer - handle file uploads
│   └─ Custom JWT verification middleware
│
├─ Routes
│   ├─ POST /auth/login
│   ├─ GET /seller/v1/dashboard
│   ├─ GET /buyer/v1/bikes/search
│   ├─ POST /admin/v1/bikes/:id/approve
│   └─ ... 60+ endpoints total
│
└─ Error Handler
    ├─ Catches all errors
    ├─ Formats response: { success: false, message, error }
    └─ Returns appropriate HTTP status code

Interaction:
Axios POST /seller/v1/bikes
    ↓
Express receives request
    ↓
CORS middleware checks origin ✓
    ↓
JWT middleware validates token
    ├─ Read Authorization header
    ├─ Verify JWT signature
    ├─ Extract userId, role
    └─ Attach to req.user
    ↓
Route matcher finds POST /seller/v1/bikes
    ↓
Multer middleware processes file upload
    ├─ Save images to temp
    ├─ Upload to AWS S3
    └─ Get URLs
    ↓
Controller: postBike(req, res)
    ├─ Validate req.body
    ├─ Call service
    └─ Return response
```

### 2. **TypeScript** (Type Safety)

```
Target: Compile-time type checking at backend

├─ Request Types
│   ├─ interface CreateBikeRequest { title, price, ... }
│   ├─ interface SearchBikesQuery { keyword?, sortBy?, ... }
│   └─ type AuthenticatedRequest = Request & { user: JwtPayload }
│
├─ Database Types
│   ├─ Generated from Drizzle schema
│   ├─ type Bike = typeof bikes.$inferSelect
│   └─ Fully typed ORM queries
│
├─ Response Envelopes
│   ├─ interface ApiResponse<T> { success, data, message }
│   ├─ type BikeDetailResponse = ApiResponse<BikeDetail>
│   └─ Ensures consistent response format
│
└─ Database Query Results
    ├─ Type-safe: TypeScript knows exact shape
    ├─ result.bike.title → no type errors
    └─ result.notexist → compile error

Interaction:
Define request type:
    ↓
async function createBike(req: CreateBikeRequest, res: Response)
    ↓
TypeScript checks: req.title exists and is string?
    ✓ Yes → compile passes
    ✗ No → error before runtime
    ↓
Drizzle query returns typed results
    ↓
TypeScript checks: result.bike.price is number?
    ✓ Yes → safe to use in calculations
    ✗ No → type error caught
```

### 3. **Drizzle ORM** (Database Access)

```
Target: Type-safe SQL queries for PostgreSQL

├─ Schema Definition (drizzle/schema.ts)
│   ├─ export const users = pgTable('users', { ... })
│   ├─ export const bikes = pgTable('bikes', { ... })
│   ├─ export const transactions = pgTable('transactions', { ... })
│   └─ Relations defined between tables
│
├─ Query Builder
│   ├─ db.query.bikes.findMany() - SELECT *
│   ├─ db.query.bikes.findFirst() - SELECT LIMIT 1
│   ├─ db.insert(bikes).values({}) - INSERT
│   ├─ db.update(bikes).set({}) - UPDATE
│   └─ db.delete(bikes).where(...) - DELETE
│
├─ Relations
│   ├─ with: { seller: true } - JOIN seller
│   ├─ with: { inspections: true } - JOIN inspections[]
│   └─ Automatic type inference for nested objects
│
└─ Transactions
    ├─ db.transaction((tx) => { ... })
    ├─ Multiple queries in atomic operation
    └─ Rollback on any error

Interaction:
Service needs bike detail with seller & inspections:
    ↓
const bike = await db.query.bikes.findFirst({
  where: eq(bikes.id, bikeId),
  with: {
    seller: true,
    inspections: true,
    transactions: true
  }
})
    ↓
Drizzle generates SQL:
SELECT bikes.*, sellers.*, inspections.*, transactions.*
FROM bikes
LEFT JOIN sellers ON bikes.sellerId = sellers.id
LEFT JOIN inspections ON inspections.bikeId = bikes.id
LEFT JOIN transactions ON transactions.bikeId = bikes.id
WHERE bikes.id = ?
    ↓
PostgreSQL executes query
    ↓
Drizzle maps results back to typed object
    ↓
TypeScript knows: bike.seller.name exists (string)
    ↓
Service returns typed result
    ↓
Controller sends to client
```

### 4. **PostgreSQL + Drizzle** (Data Persistence)

```
Target: Store and retrieve all application data

Database Tables (11 total):
├─ users          - All user accounts (buyer, seller, admin, inspector)
├─ categories     - Bike type classification
├─ bikes          - Bike listings with status tracking
├─ inspections    - Quality verification results
├─ transactions   - Offers & purchases (status: pending→approved→completed)
├─ messages       - Buyer↔Seller↔Admin communication
├─ wishlist       - Favorite bikes
├─ reviews        - Buyer ratings for sellers
├─ reports        - Violation reports (stolen, fake, etc)
├─ report_reasons - Predefined violation types
└─ [more tables for logs, payments, etc]

Key Relationships:
bikes → seller (FK users.id)
bikes → category (FK categories.id)
inspections → bike (FK bikes.id)
inspections → inspector (FK users.id, role='inspector')
transactions → bike, buyer, seller (all FK users.id)
messages → sender, receiver (both FK users.id)
reviews → buyer, seller (both FK users.id)

Interaction:
Controller receives: POST /seller/v1/bikes
    ↓
Extract seller_id from JWT token
    ↓
Drizzle query:
INSERT INTO bikes (title, price, seller_id, status)
VALUES (?, ?, ?, 'pending')
    ↓
PostgreSQL validates:
- seller_id exists in users table ✓
- Data types match schema ✓
- Constraints satisfied ✓
    ↓
INSERT succeeds, returns bike.id
    ↓
SELECT newly created bike
    ↓
Return to controller
    ↓
Format as ApiResponse
    ↓
Send JSON to frontend
```

### 5. **JWT Authentication** (Security)

```
Target: Stateless user authentication & authorization

JWT Structure (3 parts: header.payload.signature):
{
  "header": { "alg": "HS256", "typ": "JWT" },
  "payload": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "seller@example.com",
    "role": "seller",  // buyer|seller|admin|inspector
    "iat": 1711913200,
    "exp": 1711999600  // 24 hours
  },
  "signature": "HMACSHA256(base64(header).base64(payload), secret_key)"
}

Login Flow:
POST /auth/login { email, password, role }
    ↓
Find user where (email, role) pair unique
    ↓
bcryptjs.compare(provided_password, hash_in_db)
    ├─ Match ✓ → continue
    └─ No match → 401 Unauthorized
    ↓
Generate JWT:
token = jwt.sign(
  { userId, email, role },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
)
    ↓
Return { success, token, user }
    ↓
Frontend stores in Redux + localStorage
    ↓
Frontend includes in every request:
Authorization: Bearer {token}
    ↓
Express middleware verifies token:
const decoded = jwt.verify(token, secret)
    ├─ Signature valid? ✓
    ├─ Not expired? ✓
    ├─ Extract userId, role
    └─ req.user = decoded
    ↓
Controller checks: req.user.role === 'seller'
    ├─ Match ✓ → process request
    └─ No match → 403 Forbidden
    ↓
Invalid/expired token → 401 → frontend clears auth
```

### 6. **Bcryptjs** (Password Hashing)

```
Target: Secure password storage

Registration:
password: 'mySecurePassword123'
    ↓
bcryptjs.hash(password, salt=10)
    ├─ Generate random salt
    ├─ Hash password 2^10 iterations
    └─ Output: $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36DvDT32
    ↓
Store hash in database (not password)
    ↓
User logs in: password: 'mySecurePassword123'
    ↓
bcryptjs.compare(provided, stored_hash)
    ├─ Hash provided password
    ├─ Compare to stored hash
    └─ Match? ✓ Continue
```

### 7. **AWS S3 + Multer** (File Upload)

```
Target: Store bike images and inspection photos

Upload Flow:
User selects images in PostListingPage
    ↓
React Hook Form collects FormData
    ↓
Axios POST /seller/v1/bikes (multipart/form-data)
    ↓
Express receives request
    ↓
Multer middleware:
├─ Listen for file streams
├─ Write to temp storage
├─ Parse multipart boundary
└─ req.files populated
    ↓
Controller uploads each file to AWS S3:
aws.s3.putObject({
  Bucket: 'bicycle-marketplace',
  Key: `bikes/${bikeId}/image-1.jpg`,
  Body: fileStream,
  ContentType: 'image/jpeg'
})
    ↓
AWS S3 stores file
    ↓
Returns URL: https://bucket.s3.amazonaws.com/bikes/{id}/image-1.jpg
    ↓
Store URLs in database: images: [url1, url2, ...]
    ↓
Return to frontend
    ↓
Frontend displays images via <img src={url} />
```

### 8. **VNPay** (Payment Processing)

```
Target: Vietnamese payment gateway integration

Payment Flow:
User clicks "Thanh toán" on transaction with status='approved'
    ↓
POST /payment/v1/create/:txnId
    ↓
Backend generates VNPay payment URL:
paymentUrl = vnpay.buildPaymentUrl({
  vnp_Amount: amount * 100,  // in cents
  vnp_TxnRef: transactionId,
  vnp_ReturnUrl: 'https://frontend.com/payment-callback',
  vnp_IpnUrl: 'https://backend.com/payment/ipn',
  vnp_OrderInfo: `Thanh toan bic ${bikeId}`,
  ...other params
})
    ↓
Return { paymentUrl } to frontend
    ↓
Frontend redirects to: https://sandbox.vnpayment.vn/...
    ↓
User enters card details on VNPay page
    ↓
VNPay processes payment
    ↓
After payment, user redirected to callback:
https://frontend.com/payment-callback?vnp_TransactionStatus=00&...
    ↓
Frontend verifies callback signature (security check)
    ↓
Frontend shows success/failure page
    ↓
VNPay also sends server-to-server IPN webhook:
POST /payment/v1/ipn?vnp_TransactionStatus=00&...
    ↓
Backend verifies VNPay signature
    ↓
Update transaction: status='completed'
    ↓
Invalidate React Query cache on frontend
    ↓
Frontend displays transaction as "Hoàn tất"
```

---

## Backend Request Processing Pipeline

```
1. REQUEST ARRIVAL
   HTTP Request (with JWT in Authorization header)
        ↓
2. MIDDLEWARE PROCESSING
   - CORS validation
   - Body parsing (JSON/multipart)
   - File upload handling (Multer)
   - JWT verification
   - Attach user to req.user
        ↓
3. ROUTING
   Match URL pattern to controller function
   /seller/v1/bikes/:id → sellerController.getBikeDetail()
        ↓
4. INPUT VALIDATION
   - Zod schema validation
   - Type checking
   - Authorization check (JWT role)
        ↓
5. BUSINESS LOGIC
   - Service layer processes request
   - Database queries via Drizzle
   - External API calls (VNPay, S3)
   - Complex calculations
        ↓
6. DATABASE OPERATIONS
   - Drizzle generates SQL
   - PostgreSQL executes
   - Results mapped to types
   - Relations loaded (seller, inspections, etc)
        ↓
7. RESPONSE FORMATTING
   Wrap in ApiResponse<T>:
   {
     success: true,
     data: { ... },
     message: "Bike updated successfully"
   }
        ↓
8. RESPONSE SENDING
   res.status(200).json(formatted_response)
        ↓
9. ERROR HANDLING (if anywhere fails)
   Try-catch → Format error
   res.status(400-500).json({
     success: false,
     message: "User-friendly error",
     error: "Technical details"
   })
```

---

## Frontend ↔ Backend Interaction Patterns

### Pattern 1: Simple GET Request

```
Frontend: useQuery(['seller', 'dashboard'])
    ↓
queryFn(() => axios.get('/seller/v1/dashboard'))
    ↓
Axios adds: Authorization: Bearer {jwt}
    ↓
Express receives, JWT middleware verifies
    ↓
sellerController.getDashboard(req, res)
    ├─ Extract userId from req.user
    ├─ Query DB for seller stats
    └─ Format response
    ↓
res.json({ success: true, data: {...} })
    ↓
Axios response interceptor
    ↓
React Query caches
    ↓
Component rerenders with data
```

### Pattern 2: Form Submission (POST)

```
Frontend: <form> with React Hook Form
    ↓
User fills fields + submits
    ↓
handleSubmit validates with Zod
    ↓
useMutation fires
    ↓
FormData built: title, price, images[], video
    ↓
axios.post('/seller/v1/bikes', formData)
    ├─ Sets Content-Type: multipart/form-data
    └─ Axios adds Authorization header
    ↓
Express receives
    ↓
Multer parses multipart
    ├─ Extract fields: title, price, video
    ├─ Extract files: images
    └─ Upload images to S3
    ↓
sellerController.postBike(req, res)
    ├─ Validate with Zod schema
    ├─ Check seller role
    ├─ Insert into DB
    └─ Return bike.id
    ↓
Mutation onSuccess: invalidate query cache
    ↓
Navigate to /seller/bikes/:id
```

### Pattern 3: Search/Filter (Complex Query)

```
Frontend: User clicks filters
    ↓
setSearchParams({ keyword, minPrice, maxPrice, sortBy })
    ↓
queryKey changes → new query fired
    ↓
axios.get('/buyer/v1/bikes/search', { params: {...} })
    ↓
Query string: ?keyword=trek&minPrice=1000&sortBy=price&sortOrder=asc
    ↓
Express routes to buyerController.searchBikes(req, res)
    ↓
Drizzle query:
SELECT * FROM bikes
WHERE status='approved'
  AND (title ILIKE ? OR brand ILIKE ?)
  AND price >= ? AND price <= ?
ORDER BY price ASC
LIMIT 10 OFFSET 0
    ↓
PostgreSQL searches & sorts
    ↓
Results returned: bike[], with seller & category relations
    ↓
Response: { items: [...], meta: { total, page, limit } }
    ↓
React Query caches by full query key
    ↓
Component renders paginated list
    ↓
User clicks next page
    ↓
Query key changes → new fetch
```

---

## Technology Integration Summary

| Direction | Technology Flow     | Security                               |
| --------- | ------------------- | -------------------------------------- |
| FE→BE     | Axios + JWT token   | Bearer token validated                 |
| BE→DB     | Drizzle ORM queries | SQL injection prevented (parametrized) |
| BE→S3     | AWS SDK             | IAM role authentication                |
| BE→VNPay  | HTTP POST           | HMAC signature verification            |
| BE→FE     | JSON response       | CORS validated                         |
| JWT       | Signed by secret    | Signature verified each request        |

---

## Backend Error Handling

```
Try Block:
  → Process request
  → Query database
  → Call external API

Catch Block:
  ├─ Database Error
  │  └─ res.status(500).json({ message: 'Database error' })
  │
  ├─ Validation Error (Zod)
  │  └─ res.status(400).json({ message: 'Invalid input', errors: [...] })
  │
  ├─ Authorization Error (JWT/Role)
  │  ├─ 401: Token invalid/expired
  │  └─ 403: Insufficient permissions
  │
  ├─ Not Found Error
  │  └─ res.status(404).json({ message: 'Bike not found' })
  │
  └─ External API Error (S3, VNPay)
     └─ res.status(500).json({ message: 'File upload failed' })

All errors return:
{
  success: false,
  message: "User-friendly message",
  error: "Technical details (dev only)"
}
```

---

**Backend Technologies:** 10 main  
**Database Tables:** 11 (with 50+ fields total)  
**API Endpoints:** 60+ (across 5 controllers)  
**Type Safety:** 100% TypeScript throughout  
**Architecture Pattern:** Layered (routes → controllers → services → ORM → database)

---

## Key Request/Response Flows

### 1. **User Login Flow**

```
User Input (email, password, role)
    ↓
LoginPage Component
    ↓
useAuthLoginMutation()
    ↓
authApi.login(email, password, role)
    ↓
POST /api/auth/login
    ↓
Backend validates JWT
    ↓
Response: { token, user }
    ↓
Redux saveCredentials()
    ↓
Navigate to dashboard
```

---

### 2. **Seller View Bike Detail Flow**

```
User clicks bike in list
    ↓
SellerBikeDetailPage (useParams: id)
    ↓
useSellerBikeDetailQuery(id)
    ↓
GET /api/seller/v1/bikes/:id
    ↓
Backend queries: bike + inspections + transactions
    ↓
Response: { success, data: { bike, inspections[], transactions[] } }
    ↓
React Query caches with key: ['seller', 'bike', id]
    ↓
Component rerenders with data
    ↓
Displays: bike info, inspection status, transactions history
```

---

### 3. **Buyer Search Bikes Flow**

```
User enters search params & clicks filter
    ↓
AllListingsPage/CategoryPage
    ↓
setSearchParams(keyword, sortBy, price, etc)
    ↓
useBuyerSearchBikesQuery({keyword, brand, model, sortBy, limit})
    ↓
GET /buyer/v1/bikes/search?keyword=...&sortBy=...
    ↓
Backend filters approved bikes from database
    ↓
Response: { items: BuyerBike[], meta: { total, page, limit } }
    ↓
React Query caches by query key
    ↓
Renders paginated list with images
```

---

### 4. **Buyer Message Seller Flow**

```
User clicks "Message Seller" button on bike detail
    ↓
BuyerMessagePage (params: sellerId, bikeId)
    ↓
useGetBuyerMessages(sellerId, bikeId)
    ↓
GET /buyer/v1/messages/:sellerId?bikeId=X
    ↓
Backend queries messages WHERE (sender/receiver pair) AND bikeId=X
    ↓
Response: { messages: [ { content, timestamp, sender, receiver } ] }
    ↓
React Query key includes bikeId → prevents thread mixing
    ↓
Display message history for THIS bike only
    ↓
User types & clicks send
    ↓
useBuyerSendMessageMutation(sellerId, { content, bikeId })
    ↓
POST /buyer/v1/messages/:sellerId (FormData: content, bikeId, attachment?)
    ↓
Backend creates message record
    ↓
Response: { success, data: { message } }
    ↓
Mutation onSettled invalidates specific thread cache
    ↓
New message appears in UI
```

---

### 5. **Buyer Submit Transaction (Offer) Flow**

```
User enters price & clicks "Make Offer"
    ↓
CheckoutPage
    ↓
useBuyerCreateTransactionMutation({ bikeId, offerPrice })
    ↓
POST /buyer/v1/transactions { bikeId, offerPrice }
    ↓
Backend creates transaction: status='pending'
    ↓
Response: { success, data: { transactionId, status } }
    ↓
useBuyerGetTransactionsQuery() invalidates
    ↓
Redirect to transactions page
    ↓
New transaction shows with "Chờ xác nhận" status
```

---

### 6. **Seller Approve & Payment Flow**

```
Seller views transaction in dashboard
    ↓
useSellerTransactionDetailQuery(txnId)
    ↓
GET /api/seller/v1/transactions/:txnId
    ↓
Seller clicks "Approve Offer"
    ↓
useSellerUpdateTransactionMutation({ txnId, status: 'approved' })
    ↓
PUT /api/seller/v1/transactions/:txnId
    ↓
Backend updates status: 'approved'
    ↓
Response: { success, data: transaction }
    ↓
Buyer now sees "Đã duyệt" → can pay
    ↓
Buyer clicks "Thanh toán"
    ↓
usePaymentCreateUrlMutation(txnId)
    ↓
POST /payment/v1/create/:txnId
    ↓
Backend generates VNPay payment URL
    ↓
Response: { paymentUrl: "https://sandbox.vnpayment.vn/..." }
    ↓
Redirect to VNPay (user enters card)
    ↓
VNPay → callback to /payment/v1/callback
    ↓
Backend updates transaction: status='completed'
    ↓
useSellerTransactionDetailQuery refetch
    ↓
Shows "Hoàn tất" status
```

---

## Query Key Patterns (React Query)

**Prevents data collisions & enables targeted cache invalidation:**

```typescript
// Individual resource queries
['seller', 'bike', bikeId][('buyer', 'bike', bikeId)][
  // List queries (include pagination)
  ('seller', 'bikes', 'list', page, limit, sortBy, sortOrder)
][('buyer', 'bikes', 'search', keyword, sortBy, page, limit)][
  // Message threads (CRITICAL - includes bikeId to separate threads)
  ('seller', 'messages', 'partner', partnerId, bikeId, page)
][('buyer', 'messages', sellerId, bikeId, page)][
  // Different bikeId = completely different query = no data mixing

  // Transaction queries
  ('seller', 'transactions', page, limit)
][('buyer', 'transactions', page, limit)][
  // Dashboard
  ('seller', 'dashboard')
][('buyer', 'dashboard')];
```

---

## Error Handling Pipeline

```
Axios Request
    ↓
API Interceptor attachs JWT token
    ↓
Backend Response (success or 4xx/5xx)
    ↓
Error Interceptor checks status
    ↓
401 (Unauthorized) → Clear Redux auth → Redirect /login
4xx (Client Error) → Show toast "Không tải được..."
5xx (Server Error) → Show toast "Lỗi server"
    ↓
React Query marks query as error state
    ↓
Component displays error UI with retry button
```

---

## Data Flow Summary

```
UI Component
    ↓ (user action)
React Query Hook
    ↓ (useQuery/useMutation)
API Client (axios)
    ↓ (HTTP + JWT token)
Backend API
    ↓ (Database query)
API Response
    ↓ (cached by React Query)
Component Rerender
    ↓
User sees updated UI
```

---

## Authentication Flow

```
User Credentials
    ↓
authApi.login() → POST /auth/login
    ↓
JWT Token received
    ↓
Redux: setCredentials({ user, token, role })
    ↓
Stored in localStorage (for refresh)
    ↓
Axios interceptor adds Authorization header
    ↓
All subsequent requests include JWT
    ↓
Backend verifies JWT
    ↓
401 → Interceptor clears auth & redirects login
```

---

## Role-Based Access Pattern

```
User logs in with role='seller'
    ↓
Redux authSlice stores role='seller'
    ↓
RoleGuard component checks role
    ↓
✓ Matches 'seller' → render <SellerDashboard />
✗ Doesn't match → redirect to /unauthorized
    ↓
All API calls include role via JWT
    ↓
Backend validates user has permission
```

---

## Key Design Principles

✅ **Separation of Concerns** - Pages don't know about HTTP  
✅ **Caching** - React Query prevents redundant requests  
✅ **Type Safety** - TypeScript APIs with proper interfaces  
✅ **Thread Isolation** - Query keys include bikeId (prevents admin message leaks)  
✅ **Error Resilience** - Interceptors handle 401/500 globally  
✅ **Stateless Auth** - JWT tokens, no server sessions

---

**Total Request Types:** 60+ endpoints  
**Cache Stores:** React Query (client-side)  
**Auth Method:** JWT (24-hour expiry)  
**Error Handling:** Global interceptors + component-level feedback
