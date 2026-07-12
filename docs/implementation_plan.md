# TransitOps Backend — Core Modules Implementation Plan

Build the remaining 8 core backend modules of the TransitOps ERP, integrating them into the existing Drizzle ORM schema and mounting them on Express.

---

## Proposed Changes

### 1. Module 2 — Driver Management

#### [NEW] `dao/driver.dao.js`
*   `createDriverProfile(data)`
*   `getDriverProfileByUserId(userId)`
*   `getDriverProfileById(id)`
*   `updateDriverProfile(id, updates)`
*   `listDrivers({ limit, offset, includeDeleted })`

#### [NEW] `modules/drivers/controllers/driver.controller.js`
*   `create` → POST `/api/drivers` (Fleet Manager only)
    *   Generates a secure user credential in the `users` table and links it to a new `driver_profile` record.
*   `update` → PATCH `/api/drivers/:id` (Fleet Manager/Driver update)
*   `deleteDriver` → DELETE `/api/drivers/:id`
    *   Verifies driver has no active trips before soft-deleting (`isDeleted: true`).
*   `getProfile` → GET `/api/drivers/:id`
*   `list` → GET `/api/drivers` (Fleet Manager, Safety Officer, Finance)

#### [NEW] `modules/drivers/validators/driver.validator.js`
*   Validation for `licenseExpiry` (> Today), `email` (unique), phone, and required fields.

---

### 2. Module 3 — Vehicle Management

#### [NEW] `dao/vehicle.dao.js`
*   `createVehicle(data)`
*   `getVehicleById(id)`
*   `updateVehicle(id, updates)`
*   `deleteVehicle(id)`
*   `listVehicles({ limit, offset })`

#### [NEW] `modules/vehicles/controllers/vehicle.controller.js`
*   `create` → POST `/api/vehicles` (Fleet Manager only)
*   `update` → PATCH `/api/vehicles/:id`
*   `deleteVehicle` → DELETE `/api/vehicles/:id`
    *   Blocks deletion if vehicle has active trips or pending maintenance.
*   `details` → GET `/api/vehicles/:id`
    *   Returns vehicle details along with history summaries of trips, fuel logs, maintenance, and expenses.
*   `list` → GET `/api/vehicles`

---

### 3. Module 4 — Trip Management ⭐ (Core Module)

#### [NEW] `dao/trip.dao.js`
*   `createTrip(data)`
*   `getTripById(id)`
*   `updateTrip(id, updates)`
*   `listTrips({ limit, offset, driverId, status })`

#### [NEW] `modules/trips/controllers/trip.controller.js`
*   `create` → POST `/api/trips` (Fleet Manager only)
    *   Validates vehicle status is `AVAILABLE`.
    *   Validates driver status is `AVAILABLE` and license is valid (`licenseExpiry` > today).
    *   Validates cargo weight does not exceed vehicle capacity.
    *   Saves trip in `DRAFT` status.
*   `dispatch` → POST `/api/trips/:id/dispatch` (Fleet Manager only)
    *   Updates Trip → `DISPATCHED`.
    *   Updates Vehicle → `ON_TRIP`.
    *   Updates Driver Availability → `ON_TRIP`.
*   `complete` → POST `/api/trips/:id/complete` (Driver only)
    *   Inputs: `actualDistance`, `actualEndTime`, `remarks`.
    *   Updates Trip → `COMPLETED`.
    *   Updates Vehicle → `AVAILABLE` and increments its `currentOdometer` by `actualDistance`.
    *   Updates Driver Availability → `AVAILABLE`.
*   `cancel` → POST `/api/trips/:id/cancel` (Fleet Manager only)
    *   Allowed only if trip status is `DRAFT`. Sets status to `CANCELLED`.
*   `list` → GET `/api/trips`
    *   Drivers can only view their own assigned trips; Managers/Analysts see all.

---

### 4. Module 5 — Fuel Management

#### [NEW] `dao/fuel.dao.js`
*   `createFuelLog(data)`
*   `listFuelLogs({ vehicleId, tripId, driverId, limit, offset })`

#### [NEW] `modules/fuel/controllers/fuel.controller.js`
*   `create` → POST `/api/fuel-logs` (Driver only)
    *   Checks if the target trip is in `DISPATCHED` status.
    *   Calculates `totalCost = litres * pricePerLitre`.
*   `list` → GET `/api/fuel-logs`

---

### 5. Module 6 — Maintenance Management

#### [NEW] `dao/maintenance.dao.js`
*   `createRecord(data)`
*   `getRecordById(id)`
*   `updateRecord(id, updates)`
*   `listRecords({ vehicleId, status })`

#### [NEW] `modules/maintenance/controllers/maintenance.controller.js`
*   `create` → POST `/api/maintenance` (Fleet Manager only)
    *   Updates vehicle status to `MAINTENANCE` (making it unavailable for trips).
*   `complete` → POST `/api/maintenance/:id/complete` (Fleet Manager only)
    *   Inputs: `completedDate`, `cost` (actual), `remarks`.
    *   Updates Maintenance → `COMPLETED`.
    *   Updates Vehicle → `AVAILABLE`.
*   `list` → GET `/api/maintenance`

---

### 6. Module 7 — Expense Management

#### [NEW] `dao/expense.dao.js`
*   `createExpense(data)`
*   `listExpenses({ tripId, vehicleId, limit, offset })`

#### [NEW] `modules/expenses/controllers/expense.controller.js`
*   `create` → POST `/api/expenses` (Finance Analyst only)
*   `list` → GET `/api/expenses`

---

### 7. Module 8 — Dashboard & Analytics

#### [NEW] `modules/dashboard/controllers/dashboard.controller.js`
*   `getDashboard` → GET `/api/dashboard`
    *   Splits logic based on `req.user.role`:
        *   `FLEET_MANAGER` → Fleet size, active trips, upcoming maintenance, fuel costs.
        *   `DRIVER` → Assigned trips, completed trips, total fuel logged.
        *   `SAFETY_OFFICER` → Expiring licenses, vehicles in shop, upcoming service schedules.
        *   `FINANCIAL_ANALYST` → Total spend, expense category breakdowns, fuel cost charts.

---

### 8. Module 9 — Reports

#### [NEW] `modules/reports/controllers/report.controller.js`
*   `exportFleetReport` → GET `/api/reports/fleet`
*   `exportFinanceReport` → GET `/api/reports/finance`

---

### 9. Application Routing Integration

#### [MODIFY] [app.js](file:///d:/odoo/odoo-virtual/TransitOps/server/src/app.js)
Mount the remaining module routers:
```javascript
app.use('/api/drivers', driverRouter);
app.use('/api/vehicles', vehicleRouter);
app.use('/api/trips', tripRouter);
app.use('/api/fuel-logs', fuelRouter);
app.use('/api/maintenance', maintenanceRouter);
app.use('/api/expenses', expenseRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/reports', reportRouter);
```

---

## Verification Plan

### Automated Tests
*   Run validation test:
    ```bash
    npm run dev
    ```
*   Verify that the Express server starts and binds database queries without any exceptions.

### Manual Verification
*   Use REST client to register a driver → verify login → create vehicle → dispatch trip → complete trip → check vehicle odometer increment.
