TSError: ⨯ Unable to compile TypeScript:
src/controller/userController.ts:32:77 - error TS18004: No value exists in scope for the shorthand property 'domain'. Either declare one or provide an initializer.

32             tenant = await Tenant.create({ name: companyName, plan: "free", domain })
                                                                               ~~~~~~

    at createTSError (D:\Scrap\MultiTenant\node_modules\ts-node\src\index.ts:859:12)
    at reportTSError (D:\Scrap\MultiTenant\node_modules\ts-node\src\index.ts:863:19)
    at getOutput (D:\Scrap\MultiTenant\node_modules\ts-node\src\index.ts:1077:36)
    at Object.compile (D:\Scrap\MultiTenant\node_modules\ts-node\src\index.ts:1433:41)
    at Module.m._compile (D:\Scrap\MultiTenant\node_modules\ts-node\src\index.ts:1617:30)
    at node:internal/modules/cjs/loader:1895:10
    at Object.require.extensions.<computed> [as .ts] (D:\Scrap\MultiTenant\node_modules\ts-node\src\index.ts:1621:12)
    at Module.load (node:internal/modules/cjs/loader:1465:32)
    at Function._load (node:internal/modules/cjs/loader:1282:12)
    at TracingChannel.traceSync (node:diagnostics_channel:322:14) {
  diagnosticCodes: [ 18004 ]


What it means:
Your Tenant collection has a unique index on the domain field: { domain: 1, unique: true }.

You're trying to insert a document without setting domain, so MongoDB is trying to insert domain: null.

Since null is considered a value, multiple documents with domain: null violate the uniqueness constraint.

✅ How to Fix It:
Option 1: Set a Unique domain Value When Creating the Tenant
Update your code to generate a unique domain when a new tenant is created:

ts
Copy
Edit
// Generate a basic domain using company name
const domain = `${companyName.toLowerCase().replace(/\s+/g, '-')}.example.com`;

tenant = await Tenant.create({
    name: companyName,
    plan: "free",
    domain
});
⚠️ Ensure that this domain format is unique or check if it already exists before inserting.

Option 2: Allow Multiple Null Values (Not Recommended for Unique Indexes)
You can remove the unique index or make it a sparse index to allow multiple documents with domain: null. But this may not align with your business rules.

To convert it to sparse (one null allowed):

bash
Copy
Edit
# Run this once in your Mongo shell or migration
db.tenants.dropIndex("domain_1")
db.tenants.createIndex({ domain: 1 }, { unique: true, sparse: true })
💡 Best Practice:
If domain is required for tenants, make sure to:

Include it at creation time.

Validate uniqueness before inserting.

Prevent null values for fields with unique indexes.

