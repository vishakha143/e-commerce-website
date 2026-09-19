# Fashion E-Commerce Platform — Claude Code Architecture

## 1. Project Overview

Build a production-quality, full-stack fashion e-commerce platform using **Next.js as the full-stack framework**.

The platform should support:

- Men's T-Shirts
- Women's Wear
- Footwear
- Belts
- Accessories
- New Arrivals
- Sale items
- Future categories and subcategories

The core domain entity must be a generic **Product**, not a T-shirt-specific model.

The application should be designed so new categories, product types, variants, and attributes can be added without restructuring the entire system.

Primary goals:

- Clean architecture
- Strong UI/UX foundation
- Mobile-first responsive implementation
- Reusable components
- Secure authentication
- Persistent cart
- Wishlist
- Product variants and inventory
- Orders and checkout
- Admin management
- Zero/minimal upfront cost
- Free-tier-friendly deployment

---

# 2. Technology Stack

## Frontend / Full-Stack Framework

- Next.js
- App Router
- TypeScript
- React Server Components by default

## Styling

- Tailwind CSS
- shadcn/ui
- Lucide React

## Animation

- Motion / Framer Motion

Use animation only where it improves interaction and feedback.

## State Management

- Zustand

Use Zustand primarily for client-side UI and shopping state.

Do not put the entire application state into Zustand.

## Database

- MongoDB Atlas Free Tier
- Mongoose

## Authentication

- Auth.js
- Credentials authentication
- Google OAuth can be added if desired

Passwords must be securely hashed with:

- bcryptjs

## Validation

- Zod
- React Hook Form

## Images

- Cloudinary Free Tier when image hosting is required

During early development, seed/local/public images can be used.

## Deployment

- Vercel Free Tier for Next.js
- MongoDB Atlas Free Tier
- Cloudinary Free Tier if required

## Version Control

- Git
- GitHub

---

# 3. Architecture Philosophy

Use Next.js as the complete application layer.

Do NOT create a separate Express backend.

Preferred architecture:

```text
Browser
   |
   v
Next.js App Router
   |
   +-- Server Components
   |
   +-- Client Components
   |
   +-- Server Actions
   |
   +-- Route Handlers
   |
   +-- Authentication
   |
   v
Service / Domain Logic
   |
   v
Mongoose
   |
   v
MongoDB
```

Use Server Components for data-heavy read operations where practical.

Use Client Components only when interactivity requires them.

Use Server Actions for appropriate mutations.

Use Route Handlers for API-style endpoints, webhooks, or cases where an HTTP endpoint is required.

Keep database access and business logic out of presentational components.

---

# 4. High-Level System Architecture

```text
                         CUSTOMER
                            |
                            v
                    +---------------+
                    |    Next.js    |
                    |  App Router   |
                    +-------+-------+
                            |
            +---------------+---------------+
            |               |               |
            v               v               v
     Server Components  Client Components  Server Actions
            |               |               |
            |               v               |
            |          Zustand Store        |
            |               |               |
            +---------------+---------------+
                            |
                            v
                    Domain / Services
                            |
                            v
                       Mongoose
                            |
                            v
                        MongoDB
                            |
          +-----------------+-----------------+
          |                 |                 |
          v                 v                 v
        Users            Products           Orders
          |                 |                 |
          v                 v                 v
      Wishlist          Inventory          Reviews
          |
          v
        Cart
```

External services should remain replaceable:

```text
Next.js
   |
   +-- MongoDB
   |
   +-- Cloudinary
   |
   +-- Auth Provider
   |
   +-- Future Payment Provider
```

---

# 5. Application Structure

Recommended project structure:

```text
project-root/
│
├── public/
│   ├── images/
│   └── icons/
│
├── src/
│   │
│   ├── app/
│   │   │
│   │   ├── (store)/
│   │   │   ├── page.tsx
│   │   │   │
│   │   │   ├── shop/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── category/
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── product/
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── search/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── wishlist/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── cart/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   └── checkout/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── forgot-password/
│   │   │       └── page.tsx
│   │   │
│   │   ├── account/
│   │   │   ├── page.tsx
│   │   │   ├── orders/
│   │   │   ├── wishlist/
│   │   │   ├── addresses/
│   │   │   └── settings/
│   │   │
│   │   ├── admin/
│   │   │   ├── page.tsx
│   │   │   ├── products/
│   │   │   ├── orders/
│   │   │   ├── customers/
│   │   │   ├── categories/
│   │   │   └── analytics/
│   │   │
│   │   ├── api/
│   │   │   ├── products/
│   │   │   ├── cart/
│   │   │   ├── wishlist/
│   │   │   ├── orders/
│   │   │   └── auth/
│   │   │
│   │   ├── layout.tsx
│   │   ├── not-found.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   │
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── AnnouncementBar.tsx
│   │   │
│   │   ├── home/
│   │   │   ├── Hero.tsx
│   │   │   ├── CategoryShowcase.tsx
│   │   │   ├── TrendingProducts.tsx
│   │   │   ├── NewArrivals.tsx
│   │   │   ├── ShopTheLook.tsx
│   │   │   └── TrustSection.tsx
│   │   │
│   │   ├── product/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── ProductGallery.tsx
│   │   │   ├── ProductInfo.tsx
│   │   │   ├── SizeSelector.tsx
│   │   │   ├── ColorSelector.tsx
│   │   │   ├── AddToCartButton.tsx
│   │   │   ├── WishlistButton.tsx
│   │   │   ├── ProductReviews.tsx
│   │   │   └── RelatedProducts.tsx
│   │   │
│   │   ├── cart/
│   │   │   ├── CartDrawer.tsx
│   │   │   ├── CartItem.tsx
│   │   │   └── CartSummary.tsx
│   │   │
│   │   ├── search/
│   │   │   ├── SearchOverlay.tsx
│   │   │   └── SearchResults.tsx
│   │   │
│   │   ├── filters/
│   │   │   ├── ProductFilters.tsx
│   │   │   ├── FilterDrawer.tsx
│   │   │   └── SortDropdown.tsx
│   │   │
│   │   ├── checkout/
│   │   │   ├── AddressForm.tsx
│   │   │   ├── PaymentMethod.tsx
│   │   │   ├── CheckoutSummary.tsx
│   │   │   └── CheckoutSteps.tsx
│   │   │
│   │   ├── account/
│   │   │   ├── AccountSidebar.tsx
│   │   │   ├── OrderCard.tsx
│   │   │   └── AddressCard.tsx
│   │   │
│   │   ├── admin/
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── StatsCard.tsx
│   │   │   └── DataTable.tsx
│   │   │
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Drawer.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   │
│   │   └── providers/
│   │       └── Providers.tsx
│   │
│   ├── actions/
│   │   ├── cart.ts
│   │   ├── wishlist.ts
│   │   ├── product.ts
│   │   ├── order.ts
│   │   └── user.ts
│   │
│   ├── lib/
│   │   ├── mongodb.ts
│   │   ├── auth.ts
│   │   ├── cloudinary.ts
│   │   ├── utils.ts
│   │   ├── constants.ts
│   │   └── validations/
│   │       ├── auth.ts
│   │       ├── product.ts
│   │       ├── cart.ts
│   │       └── order.ts
│   │
│   ├── models/
│   │   ├── User.ts
│   │   ├── Product.ts
│   │   ├── Category.ts
│   │   ├── Order.ts
│   │   └── Review.ts
│   │
│   ├── services/
│   │   ├── productService.ts
│   │   ├── cartService.ts
│   │   ├── orderService.ts
│   │   └── userService.ts
│   │
│   ├── store/
│   │   ├── cartStore.ts
│   │   └── uiStore.ts
│   │
│   ├── types/
│   │   ├── product.ts
│   │   ├── user.ts
│   │   ├── cart.ts
│   │   └── order.ts
│   │
│   └── constants/
│       └── categories.ts
│
├── scripts/
│   └── seed.ts
│
├── .env.local
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

---

# 6. Routing Architecture

## Customer Routes

```text
/
 /shop
 /category/[slug]
 /product/[slug]
 /search
 /wishlist
 /cart
 /checkout
```

## Authentication Routes

```text
/login
/register
/forgot-password
```

## Account Routes

```text
/account
/account/orders
/account/orders/[id]
/account/wishlist
/account/addresses
/account/settings
```

## Admin Routes

```text
/admin
/admin/products
/admin/products/new
/admin/products/[id]
/admin/orders
/admin/orders/[id]
/admin/customers
/admin/categories
/admin/analytics
```

Use route protection for account and admin pages.

---

# 7. Product Domain Model

The product system must be generic.

Example conceptual structure:

```text
Product
├── _id
├── name
├── slug
├── description
├── category
├── subcategory
├── brand
├── price
├── compareAtPrice
├── images[]
├── variants[]
│   ├── color
│   ├── size
│   ├── sku
│   └── stock
├── rating
├── reviewCount
├── featured
├── isNew
├── tags[]
├── createdAt
└── updatedAt
```

The variant system must support different product types.

Example:

```text
T-Shirt
Color + Size

Footwear
Color + Size

Belt
Color + Length

Accessory
Color or no variants
```

Do not hardcode T-shirt-specific fields into the Product model.

---

# 8. User Model

```text
User
├── _id
├── name
├── email
├── password
├── image
├── role
├── addresses[]
│   ├── name
│   ├── phone
│   ├── address
│   ├── city
│   ├── state
│   ├── pincode
│   └── isDefault
├── wishlist[]
├── createdAt
└── updatedAt
```

Roles:

```text
customer
admin
```

Default role must be customer.

Admin access must be protected server-side.

---

# 9. Cart Architecture

Cart should support both:

## Guest Cart

Store temporary cart state on the client using Zustand/local persistence.

## Authenticated Cart

Persist cart data against the user.

When a guest logs in:

```text
Guest Cart
    |
    v
Login
    |
    v
Merge with User Cart
    |
    v
Persistent User Cart
```

Do not blindly overwrite the user's existing cart.

Implement a predictable merge strategy.

Cart item concept:

```text
CartItem
├── productId
├── variantId / SKU
├── quantity
├── priceAtAddition
├── name
├── image
├── selectedColor
└── selectedSize
```

The server must validate price and stock before creating an order.

Never trust price or stock values supplied by the client.

---

# 10. Wishlist Architecture

Wishlist belongs to authenticated users.

Basic flow:

```text
User
 |
 v
Wishlist button
 |
 v
Server Action
 |
 v
Validate session
 |
 v
Update User.wishlist
 |
 v
UI updates
```

For guests:

- Allow temporary client-side wishlist if desired.
- On login, merge guest wishlist with user wishlist.

---

# 11. Authentication Architecture

Use Auth.js.

Required functionality:

```text
Register
Login
Logout
Session
Protected account routes
Admin authorization
Password hashing
```

Optional later:

```text
Google OAuth
Password reset email
Email verification
```

Authentication must never rely only on client-side checks.

Admin authorization must be checked server-side.

---

# 12. Product API / Server Actions

Product operations:

```text
GET products
GET product by slug
GET products by category
Search products
Filter products
Sort products
Create product
Update product
Delete product
```

Example query:

```text
/products?
search=oversized
&category=men
&subcategory=t-shirts
&size=L
&color=black
&minPrice=500
&maxPrice=1500
&sort=price_asc
&page=1
&limit=20
```

Support pagination.

Do not load every product into the browser.

---

# 13. Search Architecture

Search should support:

- Product name
- Category
- Subcategory
- Brand
- Tags

Example:

```text
"black oversized t-shirt"
```

should return relevant products.

Initial implementation can use MongoDB text/search-friendly queries.

The architecture should allow semantic/AI search to be added later without rewriting the product system.

---

# 14. Category Architecture

Categories should be data-driven.

Example:

```text
Men
├── T-Shirts
├── Shirts
└── Hoodies

Women
├── Tops
├── Dresses
└── T-Shirts

Footwear
├── Sneakers
├── Casual
└── Sandals

Accessories
├── Belts
├── Bags
└── Wallets
```

Store category relationships in the database rather than hardcoding them throughout the UI.

Use slugs for URLs:

```text
/category/men
/category/men/t-shirts
/category/footwear/sneakers
```

---

# 15. Order Architecture

Order flow:

```text
Customer
   |
   v
Product
   |
   v
Add to Cart
   |
   v
Cart
   |
   v
Checkout
   |
   v
Address
   |
   v
Payment Method
   |
   v
Order Validation
   |
   +-- Validate user
   +-- Validate product
   +-- Validate variant
   +-- Validate stock
   +-- Recalculate prices
   |
   v
Create Order
   |
   v
Reduce Inventory
   |
   v
Order Confirmation
```

The backend/server must recalculate:

- Product prices
- Quantity
- Discounts
- Shipping
- Total

Never trust totals from the frontend.

---

# 16. Order Model

```text
Order
├── _id
├── user
├── items[]
│   ├── product
│   ├── name
│   ├── image
│   ├── SKU
│   ├── size
│   ├── color
│   ├── quantity
│   └── price
├── shippingAddress
├── subtotal
├── shippingCost
├── discount
├── total
├── status
├── paymentStatus
├── paymentMethod
├── createdAt
└── updatedAt
```

Order status:

```text
pending
confirmed
processing
shipped
delivered
cancelled
```

Payment status:

```text
pending
paid
failed
refunded
```

---

# 17. Zero-Investment Checkout Strategy

Initial checkout should support:

```text
Cash on Delivery
```

The payment architecture must remain extensible.

Later:

```text
Razorpay
Stripe
Other payment provider
```

Do not tightly couple checkout UI to a specific payment provider.

---

# 18. Inventory Architecture

Inventory belongs to product variants.

Example:

```text
Oversized Black T-Shirt

S   -> 10
M   -> 25
L   -> 17
XL  -> 8
XXL -> 3
```

Each variant must have:

```text
SKU
Stock
```

When an order is confirmed:

```text
Current Stock
      |
      v
Stock - Ordered Quantity
```

Prevent ordering if stock is insufficient.

Inventory operations must happen server-side.

---

# 19. Reviews

Review model:

```text
Review
├── _id
├── user
├── product
├── rating
├── title
├── comment
├── verifiedPurchase
├── createdAt
└── updatedAt
```

Only authenticated users should be able to submit reviews.

Ideally, `verifiedPurchase` should be calculated from order history.

---

# 20. Admin Architecture

Admin dashboard should provide:

```text
Dashboard
Products
Categories
Inventory
Orders
Customers
Reviews
Analytics
```

## Dashboard

Display:

```text
Total Revenue
Total Orders
Total Customers
Total Products
```

Charts:

```text
Revenue over time
Orders over time
Top products
Sales by category
```

## Products

```text
Create
Read
Update
Delete
```

Support:

- Product images
- Category
- Subcategory
- Price
- Discount
- Variants
- SKU
- Stock
- Featured
- New arrival
- Tags

## Orders

Admin can:

```text
View order
Update status
View customer
View items
View shipping address
```

---

# 21. State Management Strategy

Do not put server data into Zustand unnecessarily.

Use Zustand for:

```text
Cart UI
Guest cart
Wishlist UI state
Cart drawer open/close
Mobile navigation
Quick-view state
Other temporary client state
```

Use the server/database for:

```text
Users
Products
Orders
Inventory
Reviews
Persistent wishlist
Persistent cart
```

---

# 22. UI Component Architecture

Reusable components should include:

```text
Navbar
MobileNav
Footer
AnnouncementBar

Hero
CategoryCard
ProductCard
ProductGrid
ProductCarousel

ProductGallery
ProductInfo
SizeSelector
ColorSelector
AddToCartButton
WishlistButton
RelatedProducts
ProductReviews

CartDrawer
CartItem
CartSummary

SearchOverlay
SearchResults
ProductFilters
FilterDrawer
SortDropdown

LoginForm
RegisterForm

AccountSidebar
OrderCard
AddressCard

CheckoutSteps
AddressForm
PaymentMethod
CheckoutSummary

AdminSidebar
StatsCard
DataTable

Modal
Drawer
Toast
Skeleton
EmptyState
```

Components should be reusable and composable.

---

# 23. UI/UX Requirements

The implementation must be UI/UX-focused.

Design characteristics:

- Modern fashion brand
- Minimal
- Premium
- Editorial
- Image-focused
- Strong whitespace
- Responsive
- Mobile-first

Avoid:

- Generic bootstrap-style UI
- Excessive gradients
- Excessive shadows
- Too many colors
- Excessive rounded cards
- Unnecessary animation
- Cluttered layouts

Important interaction states:

```text
Loading
Empty
Error
Success
Disabled
Out of stock
Low stock
Hover
Focus
Selected
```

Every important user action must provide visual feedback.

---

# 24. Responsive Architecture

Target:

```text
Mobile:
375px
390px
430px

Tablet:
768px

Desktop:
1024px
1280px
1440px
```

Do not simply shrink desktop layouts.

Examples:

Desktop filters:

```text
Sidebar
```

Mobile:

```text
Filter Drawer
```

Desktop navigation:

```text
Full Navbar
```

Mobile:

```text
Compact Header + Drawer
```

Desktop product page:

```text
Two-column
```

Mobile:

```text
Stacked
```

---

# 25. Performance Strategy

Use Next.js capabilities properly.

Prefer:

- Server Components
- Image optimization
- Lazy loading
- Dynamic imports when useful
- Pagination
- Efficient MongoDB queries
- Database indexes
- Minimal client-side JavaScript

Do not make the entire application a Client Component.

Product listing pages should not download unnecessary data.

---

# 26. SEO

Implement:

- Metadata
- Dynamic product metadata
- Dynamic category metadata
- SEO-friendly slugs
- Open Graph metadata
- Product structured data where appropriate
- Sitemap
- Robots configuration

Example:

```text
/product/oversized-black-cotton-t-shirt
```

is preferable to:

```text
/product?id=123
```

---

# 27. Security Requirements

Never trust the client.

Server-side validation is required for:

- Authentication
- Product creation
- Product updates
- Cart mutations
- Wishlist mutations
- Order creation
- Inventory updates
- Admin actions

Use:

- Zod validation
- Auth.js sessions
- bcryptjs
- Environment variables
- Server-side authorization

Never expose:

```text
MongoDB credentials
Auth secrets
Cloudinary secrets
Payment secrets
```

to the client.

---

# 28. Database Indexing

Add appropriate indexes for common queries.

Important fields may include:

```text
Product.slug
Product.category
Product.subcategory
Product.tags
Product.createdAt
Product.featured
Product.isNew

User.email

Order.user
Order.status
Order.createdAt
```

Avoid adding unnecessary indexes without understanding query patterns.

---

# 29. Seed Data

Create a seed script:

```text
scripts/seed.ts
```

It should create:

- Categories
- Subcategories
- Sample products
- Variants
- Sample users if appropriate
- Admin user for local development

Example products:

```text
Oversized Black T-Shirt
Minimal White Tee
Graphic Brown Tee
Relaxed Fit Olive Tee
Classic Polo
White Sneakers
Casual Sneakers
Leather Belt
Canvas Belt
```

Use realistic product data so the UI can be developed against meaningful content.

---

# 30. Environment Variables

Use `.env.local`.

Example:

```text
MONGODB_URI=

AUTH_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Only include variables actually required by the selected implementation.

Never commit `.env.local`.

---

# 31. Development Phases

Do not build the entire application in one uncontrolled pass.

## Phase 1 — Foundation

Build:

```text
Next.js
TypeScript
Tailwind
shadcn
MongoDB connection
Base layout
Design tokens
Navbar
Footer
```

## Phase 2 — Homepage

Build:

```text
Hero
Category showcase
Trending products
New arrivals
Editorial section
Trust section
```

## Phase 3 — Product System

Build:

```text
Product model
Category model
Product listing
Product details
Variants
Search
Filters
Sorting
Pagination
```

## Phase 4 — Authentication

Build:

```text
Register
Login
Logout
Session
Protected routes
Account
Admin authorization
```

## Phase 5 — Shopping

Build:

```text
Cart
Cart drawer
Guest cart
Persistent user cart
Wishlist
Variant selection
Quantity management
```

## Phase 6 — Checkout

Build:

```text
Address
COD
Order creation
Order validation
Inventory reduction
Order confirmation
Order history
```

## Phase 7 — Admin

Build:

```text
Dashboard
Products
Categories
Inventory
Orders
Customers
Reviews
Analytics
```

## Phase 8 — Production Polish

Build:

```text
Loading states
Empty states
Error states
Animations
Accessibility
SEO
Performance optimization
Responsive refinement
Security review
```

---

# 32. Implementation Rules for Claude Code

When implementing this project:

1. Inspect the existing codebase before creating files.
2. Do not overwrite working code unnecessarily.
3. Follow the existing architecture if it is already partially implemented.
4. Keep business logic separate from UI.
5. Prefer reusable components.
6. Avoid duplicate code.
7. Use TypeScript strictly.
8. Validate inputs with Zod.
9. Keep secrets server-side.
10. Do not expose database credentials.
11. Use Server Components by default.
12. Use Client Components only where required.
13. Use Server Actions for appropriate mutations.
14. Use Route Handlers when an actual HTTP endpoint is needed.
15. Use Zustand only for client state.
16. Validate all important mutations server-side.
17. Recalculate order totals server-side.
18. Validate stock server-side.
19. Keep payment integration replaceable.
20. Keep the product model generic.
21. Keep categories data-driven.
22. Build mobile-first.
23. Implement loading, error and empty states.
24. Do not introduce unnecessary dependencies.
25. Keep the application compatible with free-tier deployment.

---

# 33. Definition of Done

The project should eventually support:

```text
[ ] Homepage
[ ] Category navigation
[ ] Product listing
[ ] Search
[ ] Filters
[ ] Sorting
[ ] Pagination
[ ] Product details
[ ] Product variants
[ ] Authentication
[ ] Protected routes
[ ] Cart
[ ] Guest cart
[ ] Persistent user cart
[ ] Wishlist
[ ] Checkout
[ ] Address management
[ ] Cash on Delivery
[ ] Order creation
[ ] Inventory management
[ ] Order history
[ ] Reviews
[ ] Admin dashboard
[ ] Product management
[ ] Category management
[ ] Order management
[ ] Customer management
[ ] Analytics
[ ] Responsive design
[ ] Loading states
[ ] Empty states
[ ] Error states
[ ] SEO
[ ] Accessibility
[ ] Performance optimization
[ ] Production deployment
```

---

# 34. Final Architecture Principle

The application should be thought of as:

```text
                    FASHION E-COMMERCE
                           |
             +-------------+-------------+
             |                           |
        CUSTOMER APP                 ADMIN APP
             |                           |
             v                           v
          Next.js                    Next.js
             |                           |
             +-------------+-------------+
                           |
                    Domain / Services
                           |
          +----------------+----------------+
          |                |                |
        Users           Products          Orders
          |                |                |
       Wishlist        Inventory         Reviews
          |
         Cart
                           |
                           v
                        MongoDB
```

The architecture should remain simple enough for a fresher to understand, but structured enough to demonstrate real full-stack engineering.

The final application is a **generic fashion commerce platform**, not just a T-shirt store.

Future additions such as:

- AI product search
- Recommendations
- Online payments
- Coupons
- Notifications
- Delivery tracking
- Semantic search

should be possible without replacing the core architecture.
