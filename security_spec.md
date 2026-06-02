# Enterprise Security Specification & Threat Model
## Spice eCommerce: "Darun" (দারুণ মসলা)

This specification defines the strict Attribute-Based Access Control (ABAC) and security invariants for Firestore. It describes the data validation guards and details the "Dirty Dozen" spoofing payloads that must be rejected.

---

## 1. Data Invariants & Access Matrix

| Firestore Collection | Read Permission | Create Permission | Update Permission | Delete Permission |
| :--- | :--- | :--- | :--- | :--- |
| `/admins/{adminId}` | Admin only | None (Manual/Seed) | None | None |
| `/users/{userId}` | Authenticated Owner OR Admin | Authenticated Owner (Match UID) | Authenticated Owner (No role changes) OR Admin | Admin only |
| `/products/{productId}` | Public (Anyone) | Admin only | Admin only | Admin only |
| `/orders/{orderId}` | Authenticated Owner OR Admin | Authenticated User (Match userId) | Owner (Cancel only) OR Admin (Status updates) | Admin only |
| `/reviews/{reviewId}` | Public (approved only) OR Admin | Authenticated User | Admin only | Admin only |
| `/configs/{configId}` | Public (Anyone) | Admin only | Admin only | Admin only |

### Core Security Rules Primitives
- **Identity Integrity**: For user profile creation or modification, the written document fields MUST align with the caller's verified Firebase auth UID (`request.auth.uid`).
- **Strict Role Boundaries**: Users are forbidden from promoting themselves to system roles like `'admin'`.
- **Temporal Integrity**: `createdAt` and `updatedAt` timestamps are validated using standard `request.time`.
- **State Transition Guard**: Orders that reach a terminal status (`completed` or `cancelled`) cannot be modified further by standard customers or malicious inputs.

---

## 2. The "Dirty Dozen" Exploit Payloads

Below are twelve malicious payloads representing bypass attempts targeting typical validation gaps:

### Exploit 1: Customer Registering directly as Admin
*Target*: `/users/attacker_uid`
*Exploit*: Attempting to pass `role: "admin"` directly inside the customer registration.
```json
{
  "uid": "attacker_uid",
  "email": "attacker@exploit.com",
  "name": "Attacker",
  "role": "admin",
  "createdAt": "request.time"
}
```
*Expected Result*: **PERMISSION_DENIED** (only default `'customer'` role can be created, or user profile must match verified email list; role update protected).

### Exploit 2: PII Leak - User Harvesting Profiles
*Target*:`/users/victim_user_123`
*Exploit*: Attacker authenticated as `attacker_uid` tries to read the record of `victim_user_123` containing phone/address.
```json
GET /users/victim_user_123
```
*Expected Result*: **PERMISSION_DENIED**.

### Exploit 3: Bypass Query Filter (Insecure Listing)
*Target*: `/orders` (Querying all matching user records without specific filters)
*Exploit*: Attacker calls listing on `/orders` without specifying `userId == request.auth.uid`.
```json
QUERY /orders
```
*Expected Result*: **PERMISSION_DENIED** unless explicitly filtered by current user's UID.

### Exploit 4: Price Manipulation inside Order Creation
*Target*: `/orders/malicious_order_99`
*Exploit*: Customer places an order but injects `totalAmount: 1` BDT for products actually costing 5000 BDT.
```json
{
  "id": "malicious_order_99",
  "userId": "attacker_uid",
  "customerName": "Attacker",
  "phone": "01700000000",
  "address": "Dhaka, Bangladesh",
  "items": [{"productId": "turmeric", "name": "Turmeric", "price": 500, "quantity": 10}],
  "totalAmount": 1,
  "paymentMethod": "cod",
  "paymentStatus": "pending",
  "orderStatus": "pending",
  "trackingNumber": "TR-M9093284",
  "createdAt": "request.time"
}
```
*Expected Result*: Client-side verification prevents this, but to prevent DB spoofing, the order is locked to the UID, and only the admin can change status. Price mismatch is validated in backend or manual review.

### Exploit 5: Customer hijacking another User's Order
*Target*: `/orders/order_of_victim_456`
*Exploit*: Attacker writes a fake order to a new ID but sets the `userId` to `victim_user_123`.
```json
{
  "id": "order_of_victim_456",
  "userId": "victim_user_123",
  "customerName": "Victim",
  "phone": "01711111111",
  "address": "Sylhet",
  "items": [],
  "totalAmount": 150,
  "paymentMethod": "cod",
  "paymentStatus": "pending",
  "orderStatus": "pending",
  "trackingNumber": "TR-999238",
  "createdAt": "request.time"
}
```
*Expected Result*: **PERMISSION_DENIED** (the `userId` field in the incoming order must strictly equal `request.auth.uid`).

### Exploit 6: Unauthorized Product Injection
*Target*: `/products/fake_chili`
*Exploit*: Attacker tries to create a custom product with cheap pricing.
```json
{
  "id": "fake_chili",
  "name": "ক্ষতিকর মরিচ গুঁড়ো",
  "price": 5,
  "stock": 10000,
  "image": "https://attacker.com/image.jpg",
  "category": "powder",
  "createdAt": "request.time"
}
```
*Expected Result*: **PERMISSION_DENIED** (write permissions are restricted exclusively to administrators registered in `/admins`).

### Exploit 7: SQL/NoSQL Injection inside Product ID Path
*Target*: `/products/some-malicious;path_id-with_long_payload`
*Exploit*: Poisoning path ID with extremely long configurations or special parameters.
```json
POST /products/inject-payload_and_characters_that_should_be_denied_due_to_regex_standards
```
*Expected Result*: **PERMISSION_DENIED** due to exact regex and size bounds checking (e.g. `isValidId`).

### Exploit 8: Bypassing Review Auto-Approval
*Target*: `/reviews/fake_review`
*Exploit*: Attacker tries to submit a 5-star review and set `status: "approved"` directly, bypassing admin review.
```json
{
  "id": "fake_review",
  "productId": "turmeric",
  "userId": "attacker_uid",
  "userName": "Attacker",
  "rating": 5,
  "comment": "Nice!",
  "status": "approved",
  "createdAt": "request.time"
}
```
*Expected Result*: **PERMISSION_DENIED** (Normal users can only submit with status `pending`. Approval can only be modified by admins).

### Exploit 9: Bypassing Temporal Validation
*Target*: `/orders/order_temp_123`
*Exploit*: Attacker attempts to forge historical records by specifying a past timestamp `createdAt: Timestamp("2010-01-01T00:00:00Z")`.
```json
{
  "id": "order_temp_123",
  "userId": "attacker_uid",
  "customerName": "Attacker",
  "phone": "01722222222",
  "address": "Chattogram",
  "items": [],
  "totalAmount": 100,
  "paymentMethod": "cod",
  "paymentStatus": "pending",
  "orderStatus": "pending",
  "trackingNumber": "TR-12345",
  "createdAt": "Timestamp('2025-05-24T00:00:00Z')",
  "updatedAt": "Timestamp('2025-05-24T00:00:00Z')"
}
```
*Expected Result*: **PERMISSION_DENIED** (timings are checked against `request.time`).

### Exploit 10: Deny-Of-Wallet Injection
*Target*: `/reviews/r_123`
*Exploit*: Attacker sends comment reviews containing huge 5MB text block to deplete storage.
```json
{
  "comment": "[5MB of white spaces/garbage text]"
}
```
*Expected Result*: **PERMISSION_DENIED** (comment string size must be protected: `.size() <= 1000`).

### Exploit 11: Hijacking Website configurations
*Target*: `/configs/homepage`
*Exploit*: Normal shopper attempts to change website banner slider links to route to a phishing page.
```json
{
  "banners": [
    { "image": "http://phishing-site.com/exploit.jpg", "title": "Buy spices" }
  ]
}
```
*Expected Result*: **PERMISSION_DENIED** (non-admin writes to configs are completely blocked).

### Exploit 12: Terminal Order Status Bypass
*Target*: `/orders/order_completed_99`
*Exploit*: Customer attempts to change status of an already `completed` or `processed` order back to `pending` or edit the price.
```json
{
  "orderStatus": "pending",
  "totalAmount": 100
}
```
*Expected Result*: **PERMISSION_DENIED** (terminal order state triggers lock on modification unless caller is an admin).

---

## 3. Recommended Tests

All tests under `/firestore.rules.test.ts` will verify permissions using standard mock database rules matching the matrix above. Testing validates correct access blockings.
