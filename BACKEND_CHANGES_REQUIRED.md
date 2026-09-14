# BACKEND CHANGES REQUIRED

## Status

Implemented in the current repository:

- Product and business image metadata models/endpoints with ownership checks; binary storage remains behind a storage-provider boundary.
- Business hours and special closure persistence/endpoints.
- Product/business review persistence and published-review reads.
- Customer/business conversations and participant-authorized messages.
- Authenticated notifications list/unread/read endpoints.
- Admin audit-log persistence and recording for user/business/product status mutations.
- Delivery, payment, and subscription provider interfaces with explicit `not-configured` behavior at `/api/providers/status`.
- Server-side pagination/query filtering for product search and admin user/business/product reads.
- Separate customer and business-owner registration entry points; business registration creates a `BUSINESS_OWNER`, `PENDING` business, and location transactionally.
- Private admin frontend path at `/control-panel`, protected by backend `ADMIN` guards.
- Product calendar-month expiration fields, lazy expiration enforcement, customer visibility filtering, transactional purchase/reservation protection, and owner renewal.
- Customer addresses: persisted CRUD read/create/delete endpoints under `/api/addresses`.
- Favorites: persisted product/business list, add, and remove endpoints under `/api/favorites`.
- Multi-business cart: persisted cart read/add/update/remove/clear endpoints under `/api/cart`.
- Orders: transactional checkout/order creation, customer list/detail/cancel under `/api/orders`.
- Reservations: customer create/list/detail/cancel under `/api/reservations`.
- Business owner catalog: existing product/business APIs plus frontend product creation, inventory, status, and order management.
- Admin catalog overview: protected user/business/product reads and status mutations under `/api/admin/*`.
- External businesses: provider abstraction with OpenStreetMap Overpass default and optional Google adapter under `/api/external-businesses/search`.

Partially implemented or provider-ready:

- Checkout supports pickup and delivery intent, but payment sessions and delivery quotes are not integrated.
- External discovery supports free OpenStreetMap data and Google as an optional server-side provider; usage limits and attribution requirements remain provider-dependent.
- Delivery, payment, and subscription abstractions are provider-ready but no real provider is configured, so they correctly fail rather than simulate success.
- Role-protected frontend routes and dashboards expose only API-backed actions, while unavailable workflows remain visibly unavailable.

Still pending:

- Business-owner ban/unban and server-enforced owner suspension policy beyond existing user status handling
- Product image storage and metadata
- Business image storage and metadata
- Reviews and moderation
- Review reporting/moderation UI and purchase-verification business rules
- Messaging frontend and unread aggregation UI
- Notifications frontend and event producers for every workflow
- Business hours and holiday closures
- Product/business images and object storage
- Customer profile mutation and password changes
- Real delivery providers and tracking
- Real payment providers and refunds
- Real subscription billing, featured-listing purchase flow, and promotions
- Analytics and event aggregation
- Admin audit logs
- Admin location-filtered pagination and reporting APIs
- Pagination on large catalog/management endpoints
- Automated authorization and workflow tests

Testing status:

- Backend unit suite: 13 test files, 20 tests passing.
- Covered: customer role safety, duplicate registration, business agreements, inactive login, product calendar-month expiration, renewal, customer expiration filtering, expired checkout rejection, and expired reservation rejection.
- Existing controller/service smoke specs now provide their required Nest dependencies and pass.

The current API supports public catalog discovery, category reads, authentication, business-owner business/product management, inventory updates, and admin business status/category management. The following customer and platform requirements are not represented in the current controllers or Prisma schema.

1. ORDERS AND CHECKOUT
   Backend file: `backend/src/order/` (new module) and `backend/prisma/schema.prisma`
   Current API: None
   Required API: Create checkout session, create order, list customer orders, get order, cancel order, and owner order management
   Method: `POST /api/orders`, `GET /api/orders`, `GET /api/orders/:id`, `PATCH /api/orders/:id/cancel`, owner status mutation
   Request: Business-grouped cart items, quantity, fulfillment mode, delivery address reference, and payment session selection
   Response: Price/currency snapshots, order items, business/location, fulfillment, payment status, and order status
   Authorization: Authenticated customer owns customer reads; business owners access only their business orders; admins have oversight
   Database change: Order, OrderItem, CustomerAddress, payment/fulfillment fields, and immutable price/currency snapshots
   Priority: High

2. RESERVATIONS
   Backend file: `backend/src/reservation/` (new module) and `backend/prisma/schema.prisma`
   Current API: None
   Required API: Create, list, detail, cancel, and business accept/reject/complete reservation endpoints
   Method: `POST /api/reservations`, `GET /api/reservations`, `GET /api/reservations/:id`, `PATCH /api/reservations/:id/cancel`, owner status mutation
   Request: Product, business location, quantity, and optional pickup time
   Response: Reservation status, quantity, product snapshot, store, and timestamps
   Authorization: Customer ownership and business ownership enforced by backend guards and service queries
   Database change: Reservation and status history models
   Priority: High

3. CUSTOMER ADDRESSES
   Backend file: `backend/src/address/` (new module) and `backend/prisma/schema.prisma`
   Current API: Business locations only
   Required API: Authenticated customer address CRUD
   Method: `GET/POST/PATCH/DELETE /api/addresses`
   Request: International address fields, country code, optional coordinates, and label
   Response: Address resource without secrets or payment data
   Authorization: Customer can access only their own addresses
   Database change: Address model related to User
   Priority: High

4. FAVORITES, REVIEWS, AND NOTIFICATIONS
   Backend file: New modules under `backend/src/` and `backend/prisma/schema.prisma`
   Current API: None
   Required API: Favorite product/business CRUD, review creation/listing, notification listing/read state
   Method: `POST/DELETE /api/favorites`, `GET/POST /api/reviews`, `GET/PATCH /api/notifications`
   Request: Resource ids, rating/comment, and notification read state
   Response: Owned resources with server-generated timestamps and moderation state
   Authorization: Authenticated ownership; reviews require completed order/reservation; admin moderation
   Database change: Favorite, Review, Notification, and moderation fields
   Priority: Medium

5. IMAGES, HOURS, AND BUSINESS DIRECTORY SEARCH
   Backend file: Business/product modules and `backend/prisma/schema.prisma`
   Current API: Business detail returns locations; products have no image fields
   Required API: Public business search, product/business image metadata, opening hours, and delivery/pickup capabilities
   Method: `GET /api/businesses/search`, image metadata CRUD, and business configuration mutations
   Request: Search location/category and image URL/order metadata
   Response: Public URLs, hours, fulfillment capabilities, and distance
   Authorization: Public reads for active resources; owner writes; storage credentials stay server-side
   Database change: ProductImage, BusinessImage, BusinessHour, and fulfillment configuration models
   Priority: Medium

6. DELIVERY, PAYMENTS, SUBSCRIPTIONS, AND ANALYTICS
   Backend file: New provider-oriented modules under `backend/src/`
   Current API: None
   Required API: Delivery quotes/bookings/tracking, payment sessions/status, subscription billing, and privacy-safe event ingestion
   Method: Provider-specific server endpoints behind generic platform contracts
   Request: Order/fulfillment references and provider-neutral options
   Response: Quote, booking, tracking, checkout URL/session, billing status, or accepted event
   Authorization: Order ownership and server-side provider credentials; never expose provider secrets
   Database change: Provider references, payment records, subscriptions, and delivery state
   Priority: Later

## Security follow-up

Login currently returns a JWT in JSON and the strategy reads the Authorization header. For production, add secure, short-lived HttpOnly cookie sessions with CSRF protection and refresh-token rotation, while preserving a versioned migration path for existing bearer clients. Restrict CORS origins by environment instead of `origin: true`.

## Scale follow-up

Nearby search currently loads up to 100 products and calculates distance in application code. Add pagination and a geospatial index/query strategy (PostGIS or a PostgreSQL-compatible spatial approach) before high-volume global rollout.