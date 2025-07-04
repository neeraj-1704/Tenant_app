# Tenant_app

Data flow 

You're asking the right question, Neeraj! Let's walk through an **advanced data flow for a Multi-Tenant SaaS application** using **MongoDB**, **Node.js**, and **Express**.

---

## 🎯 Goal:

Design a secure, isolated, and scalable **Multi-Tenant CRM** with roles, RBAC, tenant filtering, and modular code.

---

## 🏗️ Architecture Components (MongoDB)

* **Tenant**: Represents a company (organization).
* **User**: Belongs to a `tenantId`, has a role (`admin`, `sales`, etc.).
* **Customer / Lead / Task / Note**: Owned by a tenant.
* **Auth**: Login, JWT, and middleware for tenant & role protection.

---

## ⚙️ Advanced Data Flow

### ✅ 1. **Tenant Registration Flow**

```mermaid
flowchart TD
    A[Super Admin Registers Company] --> B[Create Tenant]
    B --> C[Create First Admin User]
    C --> D[Return JWT with tenantId + role]
```

### ✅ 2. **User Login Flow**

```mermaid
flowchart TD
    A[User submits email/password] --> B[Find User by email + tenantId]
    B --> C[Verify password]
    C --> D[Return JWT with tenantId + role + userId]
```

> 💡 JWT Payload:

```json
{
  "userId": "xxx",
  "tenantId": "yyy",
  "role": "admin"
}
```

---

### ✅ 3. **CRUD API Flow (Tenant Isolated)**

```ts
// Customer Controller
const customers = await Customer.find({ tenantId: req.user.tenantId });
```

**Every model (Customer, Lead, etc.) must include `tenantId`**:

```ts
tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true }
```

> 💡 Middleware:

```ts
req.user = { tenantId, role, userId } // from decoded JWT
```

---

### ✅ 4. **Role-Based Access Control (RBAC)**

```ts
function requireRole(roles: string[]) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}
```

Example:

```ts
router.post("/customers", requireRole(["admin", "sales"]), createCustomer);
```

---

### ✅ 5. **Data Insertion Flow**

```mermaid
flowchart TD
    A[Frontend: Form Submit] --> B[POST /api/customers]
    B --> C[Zod + JWT Middleware]
    C --> D[Inject tenantId from JWT]
    D --> E[Mongoose creates customer with tenantId]
```

---

### ✅ 6. **Data Fetching Flow (Multi-Tenant Filter)**

```ts
// Always filter by tenant
const customers = await Customer.find({ tenantId: req.user.tenantId });
```

### 🔐 Data Isolation:

Even if someone tampers with a request, middleware ensures they **only access their own tenant's data**.

---

## 🧠 Example File Structure

```
/models
  - Tenant.model.ts
  - User.model.ts
  - Customer.model.ts
/validators
  - user.schema.ts
  - customer.schema.ts
/middleware
  - auth.ts        // JWT + tenantId injection
  - rbac.ts        // Role-based access check
/controllers
  - user.controller.ts
  - customer.controller.ts
/routes
  - user.routes.ts
  - customer.routes.ts
/utils
  - jwt.ts
```

---

## 📦 Extra Advanced Ideas

| Feature                    | How                                                      |
| -------------------------- | -------------------------------------------------------- |
| Tenant limits (free/pro)   | Add `plan` to `Tenant` and check before creating records |
| Audit logs                 | Log `createdBy`, `updatedBy` with timestamps             |
| Soft delete                | Use `isDeleted: true` instead of hard delete             |
| Multi-tenancy by subdomain | Extract tenant from subdomain (e.g. `acme.crm.com`)      |
| Billing support            | Link Stripe customer ID to `Tenant`                      |

---

Would you like:

* 🌐 Full JWT + Middleware setup?
* 🧪 Postman collection for all APIs?
* 💾 Sample MongoDB dump for testing?

Let’s build this like a production-ready SaaS app. You're doing amazing 🔥
