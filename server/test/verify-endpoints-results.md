# Endpoint Verification Report

This report outlines the verified API endpoints, request details, HTTP responses, and confirmation of correct functionality against the TransitOps user schema and database check constraints.

| Module | API Endpoint Name | Method | Path | Status | Success |
|---|---|---|---|---|---|
| Vehicles | Register Vehicle | `POST` | `/api/vehicles` | `201` | ✅ Success |
| Vehicles | Get Vehicles | `GET` | `/api/vehicles` | `200` | ✅ Success |
| Vehicles | Vehicle Details | `GET` | `/api/vehicles/:id` | `200` | ✅ Success |
| Vehicles | Update Vehicle | `PATCH` | `/api/vehicles/:id` | `200` | ✅ Success |
| Vehicles | Available Vehicles | `GET` | `/api/vehicles/available` | `200` | ✅ Success |
| Vehicles | Update Status | `PATCH` | `/api/vehicles/:id/status` | `200` | ✅ Success |
| Vehicles | Restore Vehicle | `PATCH` | `/api/vehicles/:id/restore` | `200` | ✅ Success |
| Vehicles | Retire Vehicle | `PATCH` | `/api/vehicles/:id/retire` | `200` | ✅ Success |
| Vehicles | Update Odometer | `PATCH` | `/api/vehicles/:id/odometer` | `200` | ✅ Success |
| Drivers | Register Driver | `POST` | `/api/drivers` | `201` | ✅ Success |
| Drivers | Get Drivers | `GET` | `/api/drivers` | `200` | ✅ Success |
| Drivers | Driver Details | `GET` | `/api/drivers/:id` | `200` | ✅ Success |
| Drivers | Update Driver | `PATCH` | `/api/drivers/:id` | `200` | ✅ Success |
| Drivers | Available Drivers | `GET` | `/api/drivers/available` | `200` | ✅ Success |
| Drivers | Expiring Licenses | `GET` | `/api/drivers/expiring-license` | `200` | ✅ Success |
| Drivers | Update Status | `PATCH` | `/api/drivers/:id/status` | `200` | ✅ Success |
| Drivers | Activate Driver | `PATCH` | `/api/drivers/:id/activate` | `200` | ✅ Success |
| Drivers | Suspend Driver | `PATCH` | `/api/drivers/:id/suspend` | `200` | ✅ Success |
| Drivers | Update License | `PATCH` | `/api/drivers/:id/license` | `200` | ✅ Success |
| Drivers | Update Safety Score | `PATCH` | `/api/drivers/:id/safety-score` | `200` | ✅ Success |
| Trips | Create Trip | `POST` | `/api/trips` | `201` | ✅ Success |
| Trips | Get Trips | `GET` | `/api/trips` | `200` | ✅ Success |
| Trips | Trip Details | `GET` | `/api/trips/:id` | `200` | ✅ Success |
| Trips | Update Trip | `PATCH` | `/api/trips/:id` | `200` | ✅ Success |
| Trips | Assign Driver | `PATCH` | `/api/trips/:id/assign-driver` | `200` | ✅ Success |
| Trips | Assign Vehicle | `PATCH` | `/api/trips/:id/assign-vehicle` | `200` | ✅ Success |
| Trips | Update Cargo | `PATCH` | `/api/trips/:id/cargo` | `200` | ✅ Success |
| Trips | Update Distance | `PATCH` | `/api/trips/:id/distance` | `200` | ✅ Success |
| Trips | Dispatch Trip | `POST` | `/api/trips/:id/dispatch` | `200` | ✅ Success |
| Trips | Start Trip (Driver) | `POST` | `/api/trips/:id/start` | `200` | ✅ Success |
| Trips | Trip Timeline | `GET` | `/api/trips/:id/timeline` | `200` | ✅ Success |
| Trips | Complete Trip (Driver) | `POST` | `/api/trips/:id/complete` | `200` | ✅ Success |
| Trips | Cancel Trip | `POST` | `/api/trips/:id/cancel` | `200` | ✅ Success |
| Trips | Delete Trip | `DELETE` | `/api/trips/:id` | `200` | ✅ Success |
| Vehicles | Vehicle Trips | `GET` | `/api/vehicles/:id/trips` | `200` | ✅ Success |
| Vehicles | Vehicle Maintenance | `GET` | `/api/vehicles/:id/maintenance` | `200` | ✅ Success |
| Vehicles | Vehicle Fuel Logs | `GET` | `/api/vehicles/:id/fuel-logs` | `200` | ✅ Success |
| Vehicles | Vehicle Expenses | `GET` | `/api/vehicles/:id/expenses` | `200` | ✅ Success |
| Drivers | Driver Trips | `GET` | `/api/drivers/:id/trips` | `200` | ✅ Success |
| Dashboard | Dashboard Overview | `GET` | `/api/dashboard` | `200` | ✅ Success |
| Dashboard | Dashboard KPIs | `GET` | `/api/dashboard/kpis` | `200` | ✅ Success |
| Dashboard | Vehicle Summary | `GET` | `/api/dashboard/vehicle-summary` | `200` | ✅ Success |
| Dashboard | Driver Summary | `GET` | `/api/dashboard/driver-summary` | `200` | ✅ Success |
| Dashboard | Trip Summary | `GET` | `/api/dashboard/trip-summary` | `200` | ✅ Success |
| Dashboard | Recent Activities | `GET` | `/api/dashboard/recent-activities` | `200` | ✅ Success |

## Detailed Request/Response Payloads

### 1. [Vehicles] Register Vehicle
- **Endpoint:** `POST /api/vehicles`
- **Status Code:** `201` (Success)

**Request Body:**
```json
{
  "registrationNumber": "REG-1783832836997",
  "vehicleNumber": "V-1783832836997",
  "brand": "Tata",
  "model": "Prima 4028.S",
  "manufactureYear": 2022,
  "capacityKg": "15000.00",
  "fuelType": "Diesel",
  "currentOdometer": "1000.00",
  "purchaseDate": "2026-07-12T05:07:20.117Z",
  "insuranceExpiry": "2027-01-08T05:07:20.117Z",
  "pollutionExpiry": "2027-01-08T05:07:20.117Z"
}
```

**Response Body:**
```json
{
  "success": true,
  "message": "Vehicle registered successfully",
  "data": {
    "id": "8d52721f-2f14-4d10-ad80-9fba843359c0",
    "registrationNumber": "REG-1783832836997",
    "vehicleNumber": "V-1783832836997",
    "brand": "Tata",
    "model": "Prima 4028.S",
    "manufactureYear": 2022,
    "capacityKg": "15000.00",
    "fuelType": "Diesel",
    "currentOdometer": "1000.00",
    "status": "AVAILABLE",
    "purchaseDate": "2026-07-12T05:07:20.117Z",
    "insuranceExpiry": "2027-01-08T05:07:20.117Z",
    "pollutionExpiry": "2027-01-08T05:07:20.117Z",
    "createdAt": "2026-07-12T05:07:22.287Z",
    "updatedAt": "2026-07-12T05:07:22.287Z"
  }
}
```
---

### 2. [Vehicles] Get Vehicles
- **Endpoint:** `GET /api/vehicles`
- **Status Code:** `200` (Success)

**Response Body:**
```json
{
  "success": true,
  "message": "Vehicles retrieved successfully",
  "data": [
    {
      "id": "1633b8ef-07fd-4434-8b2f-07c08344d207",
      "registrationNumber": "MH-12-AB-4358",
      "vehicleNumber": "VN-4424",
      "brand": "Tata",
      "model": "Prima 4925.S PRO",
      "manufactureYear": 2022,
      "capacityKg": "25000.00",
      "fuelType": "Diesel",
      "currentOdometer": "15152.00",
      "status": "AVAILABLE",
      "purchaseDate": "2022-05-15T00:00:00.000Z",
      "insuranceExpiry": "2027-05-15T00:00:00.000Z",
      "pollutionExpiry": "2027-05-15T00:00:00.000Z",
      "createdAt": "2026-07-12T04:50:06.655Z",
      "updatedAt": "2026-07-12T04:50:42.314Z"
    },
    {
      "id": "f91ad326-b43c-4460-9797-efaf6570a870",
      "registrationNumber": "MH-12-AB-7486",
      "vehicleNumber": "VN-8294",
      "brand": "Tata",
      "model": "Prima 4925.S PRO",
      "manufactureYear": 2022,
      "capacityKg": "25000.00",
      "fuelType": "Diesel",
      "currentOdometer": "15000.00",
      "status": "AVAILABLE",
      "purchaseDate": "2022-05-15T00:00:00.000Z",
      "insuranceExpiry": "2027-05-15T00:00:00.000Z",
      "pollutionExpiry": "2027-05-15T00:00:00.000Z",
      "createdAt": "2026-07-12T04:53:31.934Z",
      "updatedAt": "2026-07-12T04:53:36.583Z"
    },
    {
      "id": "8d52721f-2f14-4d10-ad80-9fba843359c0",
      "registrationNumber": "REG-1783832836997",
      "vehicleNumber": "V-1783832836997",
      "brand": "Tata",
      "model": "Prima 4028.S",
      "manufactureYear": 2022,
      "capacityKg": "15000.00",
      "fuelType": "Diesel",
      "currentOdometer": "1000.00",
      "status": "AVAILABLE",
      "purchaseDate": "2026-07-12T05:07:20.117Z",
      "insuranceExpiry": "2027-01-08T05:07:20.117Z",
      "pollutionExpiry": "2027-01-08T05:07:20.117Z",
      "createdAt": "2026-07-12T05:07:22.287Z",
      "updatedAt": "2026-07-12T05:07:22.287Z"
    }
  ]
}
```
---

### 3. [Vehicles] Vehicle Details
- **Endpoint:** `GET /api/vehicles/:id`
- **Status Code:** `200` (Success)

**Response Body:**
```json
{
  "success": true,
  "message": "Vehicle details retrieved successfully",
  "data": {
    "id": "8d52721f-2f14-4d10-ad80-9fba843359c0",
    "registrationNumber": "REG-1783832836997",
    "vehicleNumber": "V-1783832836997",
    "brand": "Tata",
    "model": "Prima 4028.S",
    "manufactureYear": 2022,
    "capacityKg": "15000.00",
    "fuelType": "Diesel",
    "currentOdometer": "1000.00",
    "status": "AVAILABLE",
    "purchaseDate": "2026-07-12T05:07:20.117Z",
    "insuranceExpiry": "2027-01-08T05:07:20.117Z",
    "pollutionExpiry": "2027-01-08T05:07:20.117Z",
    "createdAt": "2026-07-12T05:07:22.287Z",
    "updatedAt": "2026-07-12T05:07:22.287Z"
  }
}
```
---

### 4. [Vehicles] Update Vehicle
- **Endpoint:** `PATCH /api/vehicles/:id`
- **Status Code:** `200` (Success)

**Request Body:**
```json
{
  "brand": "Tata Motors",
  "model": "Prima 4030.S"
}
```

**Response Body:**
```json
{
  "success": true,
  "message": "Vehicle updated successfully",
  "data": {
    "id": "8d52721f-2f14-4d10-ad80-9fba843359c0",
    "registrationNumber": "REG-1783832836997",
    "vehicleNumber": "V-1783832836997",
    "brand": "Tata Motors",
    "model": "Prima 4030.S",
    "manufactureYear": 2022,
    "capacityKg": "15000.00",
    "fuelType": "Diesel",
    "currentOdometer": "1000.00",
    "status": "AVAILABLE",
    "purchaseDate": "2026-07-12T05:07:20.117Z",
    "insuranceExpiry": "2027-01-08T05:07:20.117Z",
    "pollutionExpiry": "2027-01-08T05:07:20.117Z",
    "createdAt": "2026-07-12T05:07:22.287Z",
    "updatedAt": "2026-07-12T05:07:24.855Z"
  }
}
```
---

### 5. [Vehicles] Available Vehicles
- **Endpoint:** `GET /api/vehicles/available`
- **Status Code:** `200` (Success)

**Response Body:**
```json
{
  "success": true,
  "message": "Available vehicles retrieved successfully",
  "data": [
    {
      "id": "1633b8ef-07fd-4434-8b2f-07c08344d207",
      "registrationNumber": "MH-12-AB-4358",
      "vehicleNumber": "VN-4424",
      "brand": "Tata",
      "model": "Prima 4925.S PRO",
      "manufactureYear": 2022,
      "capacityKg": "25000.00",
      "fuelType": "Diesel",
      "currentOdometer": "15152.00",
      "status": "AVAILABLE",
      "purchaseDate": "2022-05-15T00:00:00.000Z",
      "insuranceExpiry": "2027-05-15T00:00:00.000Z",
      "pollutionExpiry": "2027-05-15T00:00:00.000Z",
      "createdAt": "2026-07-12T04:50:06.655Z",
      "updatedAt": "2026-07-12T04:50:42.314Z"
    },
    {
      "id": "f91ad326-b43c-4460-9797-efaf6570a870",
      "registrationNumber": "MH-12-AB-7486",
      "vehicleNumber": "VN-8294",
      "brand": "Tata",
      "model": "Prima 4925.S PRO",
      "manufactureYear": 2022,
      "capacityKg": "25000.00",
      "fuelType": "Diesel",
      "currentOdometer": "15000.00",
      "status": "AVAILABLE",
      "purchaseDate": "2022-05-15T00:00:00.000Z",
      "insuranceExpiry": "2027-05-15T00:00:00.000Z",
      "pollutionExpiry": "2027-05-15T00:00:00.000Z",
      "createdAt": "2026-07-12T04:53:31.934Z",
      "updatedAt": "2026-07-12T04:53:36.583Z"
    },
    {
      "id": "8d52721f-2f14-4d10-ad80-9fba843359c0",
      "registrationNumber": "REG-1783832836997",
      "vehicleNumber": "V-1783832836997",
      "brand": "Tata Motors",
      "model": "Prima 4030.S",
      "manufactureYear": 2022,
      "capacityKg": "15000.00",
      "fuelType": "Diesel",
      "currentOdometer": "1000.00",
      "status": "AVAILABLE",
      "purchaseDate": "2026-07-12T05:07:20.117Z",
      "insuranceExpiry": "2027-01-08T05:07:20.117Z",
      "pollutionExpiry": "2027-01-08T05:07:20.117Z",
      "createdAt": "2026-07-12T05:07:22.287Z",
      "updatedAt": "2026-07-12T05:07:24.855Z"
    }
  ]
}
```
---

### 6. [Vehicles] Update Status
- **Endpoint:** `PATCH /api/vehicles/:id/status`
- **Status Code:** `200` (Success)

**Request Body:**
```json
{
  "status": "MAINTENANCE"
}
```

**Response Body:**
```json
{
  "success": true,
  "message": "Vehicle status updated successfully",
  "data": {
    "id": "8d52721f-2f14-4d10-ad80-9fba843359c0",
    "registrationNumber": "REG-1783832836997",
    "vehicleNumber": "V-1783832836997",
    "brand": "Tata Motors",
    "model": "Prima 4030.S",
    "manufactureYear": 2022,
    "capacityKg": "15000.00",
    "fuelType": "Diesel",
    "currentOdometer": "1000.00",
    "status": "MAINTENANCE",
    "purchaseDate": "2026-07-12T05:07:20.117Z",
    "insuranceExpiry": "2027-01-08T05:07:20.117Z",
    "pollutionExpiry": "2027-01-08T05:07:20.117Z",
    "createdAt": "2026-07-12T05:07:22.287Z",
    "updatedAt": "2026-07-12T05:07:29.377Z"
  }
}
```
---

### 7. [Vehicles] Restore Vehicle
- **Endpoint:** `PATCH /api/vehicles/:id/restore`
- **Status Code:** `200` (Success)

**Response Body:**
```json
{
  "success": true,
  "message": "Vehicle restored successfully",
  "data": {
    "id": "8d52721f-2f14-4d10-ad80-9fba843359c0",
    "registrationNumber": "REG-1783832836997",
    "vehicleNumber": "V-1783832836997",
    "brand": "Tata Motors",
    "model": "Prima 4030.S",
    "manufactureYear": 2022,
    "capacityKg": "15000.00",
    "fuelType": "Diesel",
    "currentOdometer": "1000.00",
    "status": "AVAILABLE",
    "purchaseDate": "2026-07-12T05:07:20.117Z",
    "insuranceExpiry": "2027-01-08T05:07:20.117Z",
    "pollutionExpiry": "2027-01-08T05:07:20.117Z",
    "createdAt": "2026-07-12T05:07:22.287Z",
    "updatedAt": "2026-07-12T05:07:30.302Z"
  }
}
```
---

### 8. [Vehicles] Retire Vehicle
- **Endpoint:** `PATCH /api/vehicles/:id/retire`
- **Status Code:** `200` (Success)

**Response Body:**
```json
{
  "success": true,
  "message": "Vehicle retired successfully",
  "data": {
    "id": "8d52721f-2f14-4d10-ad80-9fba843359c0",
    "registrationNumber": "REG-1783832836997",
    "vehicleNumber": "V-1783832836997",
    "brand": "Tata Motors",
    "model": "Prima 4030.S",
    "manufactureYear": 2022,
    "capacityKg": "15000.00",
    "fuelType": "Diesel",
    "currentOdometer": "1000.00",
    "status": "RETIRED",
    "purchaseDate": "2026-07-12T05:07:20.117Z",
    "insuranceExpiry": "2027-01-08T05:07:20.117Z",
    "pollutionExpiry": "2027-01-08T05:07:20.117Z",
    "createdAt": "2026-07-12T05:07:22.287Z",
    "updatedAt": "2026-07-12T05:07:31.440Z"
  }
}
```
---

### 9. [Vehicles] Update Odometer
- **Endpoint:** `PATCH /api/vehicles/:id/odometer`
- **Status Code:** `200` (Success)

**Request Body:**
```json
{
  "odometer": "1500.00"
}
```

**Response Body:**
```json
{
  "success": true,
  "message": "Vehicle odometer updated successfully",
  "data": {
    "id": "8d52721f-2f14-4d10-ad80-9fba843359c0",
    "registrationNumber": "REG-1783832836997",
    "vehicleNumber": "V-1783832836997",
    "brand": "Tata Motors",
    "model": "Prima 4030.S",
    "manufactureYear": 2022,
    "capacityKg": "15000.00",
    "fuelType": "Diesel",
    "currentOdometer": "1500.00",
    "status": "AVAILABLE",
    "purchaseDate": "2026-07-12T05:07:20.117Z",
    "insuranceExpiry": "2027-01-08T05:07:20.117Z",
    "pollutionExpiry": "2027-01-08T05:07:20.117Z",
    "createdAt": "2026-07-12T05:07:22.287Z",
    "updatedAt": "2026-07-12T05:07:34.225Z"
  }
}
```
---

### 10. [Drivers] Register Driver
- **Endpoint:** `POST /api/drivers`
- **Status Code:** `201` (Success)

**Request Body:**
```json
{
  "name": "Test Driver Reg 1783832836997",
  "email": "registered_driver_1783832836997@example.com",
  "phone": "9999888877",
  "licenseNumber": "LIC-REG-1783832836997",
  "licenseExpiry": "2026-10-20T05:07:34.709Z",
  "joiningDate": "2026-07-12T05:07:34.709Z",
  "emergencyContact": "9999888800",
  "bloodGroup": "B+",
  "experienceYears": 3
}
```

**Response Body:**
```json
{
  "success": true,
  "message": "Driver registered successfully",
  "data": {
    "driver": {
      "id": "8a222367-25de-478a-960c-832f64a472c2",
      "name": "Test Driver Reg 1783832836997",
      "email": "registered_driver_1783832836997@example.com",
      "role": "DRIVER",
      "createdAt": "2026-07-12T05:07:38.649Z",
      "profile": {
        "id": "d487f774-a63a-4dca-a116-6961e2d9df2e",
        "userId": "8a222367-25de-478a-960c-832f64a472c2",
        "licenseNumber": "LIC-REG-1783832836997",
        "licenseExpiry": "2026-10-20T05:07:34.709Z",
        "joiningDate": "2026-07-12T05:07:34.709Z",
        "phone": "9999888877",
        "emergencyContact": "9999888800",
        "bloodGroup": "B+",
        "safetyScore": "100.00",
        "experienceYears": 3,
        "availabilityStatus": "AVAILABLE",
        "createdAt": "2026-07-12T05:07:38.649Z",
        "updatedAt": "2026-07-12T05:07:38.649Z"
      }
    },
    "credentials": {
      "email": "registered_driver_1783832836997@example.com",
      "password": "TOPS@628463"
    }
  }
}
```
---

### 11. [Drivers] Get Drivers
- **Endpoint:** `GET /api/drivers`
- **Status Code:** `200` (Success)

**Response Body:**
```json
{
  "success": true,
  "message": "Drivers retrieved successfully",
  "data": [
    {
      "id": "1409f33a-1ff4-4869-944f-235196b59f32",
      "name": "Verification Driver",
      "email": "test_driver_1783832836997@example.com",
      "isActive": true,
      "isDeleted": false,
      "role": "DRIVER",
      "createdAt": "2026-07-12T05:07:20.873Z",
      "updatedAt": "2026-07-12T05:07:20.873Z",
      "driverProfileId": "998a7a6e-7055-408b-99ac-e71815da78bb",
      "licenseNumber": "LIC-1783832836997",
      "licenseExpiry": "2027-07-12T05:07:19.641Z",
      "joiningDate": "2026-07-12T05:07:19.641Z",
      "phone": "9876543210",
      "emergencyContact": "9876543211",
      "bloodGroup": "O+",
      "safetyScore": "100.00",
      "experienceYears": 5,
      "availabilityStatus": "AVAILABLE"
    },
    {
      "id": "8a222367-25de-478a-960c-832f64a472c2",
      "name": "Test Driver Reg 1783832836997",
      "email": "registered_driver_1783832836997@example.com",
      "isActive": true,
      "isDeleted": false,
      "role": "DRIVER",
      "createdAt": "2026-07-12T05:07:38.649Z",
      "updatedAt": "2026-07-12T05:07:38.649Z",
      "driverProfileId": "d487f774-a63a-4dca-a116-6961e2d9df2e",
      "licenseNumber": "LIC-REG-1783832836997",
      "licenseExpiry": "2026-10-20T05:07:34.709Z",
      "joiningDate": "2026-07-12T05:07:34.709Z",
      "phone": "9999888877",
      "emergencyContact": "9999888800",
      "bloodGroup": "B+",
      "safetyScore": "100.00",
      "experienceYears": 3,
      "availabilityStatus": "AVAILABLE"
    }
  ]
}
```
---

### 12. [Drivers] Driver Details
- **Endpoint:** `GET /api/drivers/:id`
- **Status Code:** `200` (Success)

**Response Body:**
```json
{
  "success": true,
  "message": "Driver details retrieved successfully",
  "data": {
    "id": "1409f33a-1ff4-4869-944f-235196b59f32",
    "name": "Verification Driver",
    "email": "test_driver_1783832836997@example.com",
    "isActive": true,
    "isDeleted": false,
    "role": "DRIVER",
    "createdAt": "2026-07-12T05:07:20.873Z",
    "updatedAt": "2026-07-12T05:07:20.873Z",
    "driverProfileId": "998a7a6e-7055-408b-99ac-e71815da78bb",
    "licenseNumber": "LIC-1783832836997",
    "licenseExpiry": "2027-07-12T05:07:19.641Z",
    "joiningDate": "2026-07-12T05:07:19.641Z",
    "phone": "9876543210",
    "emergencyContact": "9876543211",
    "bloodGroup": "O+",
    "safetyScore": "100.00",
    "experienceYears": 5,
    "availabilityStatus": "AVAILABLE"
  }
}
```
---

### 13. [Drivers] Update Driver
- **Endpoint:** `PATCH /api/drivers/:id`
- **Status Code:** `200` (Success)

**Request Body:**
```json
{
  "name": "Verification Driver Updated",
  "phone": "9876543222"
}
```

**Response Body:**
```json
{
  "success": true,
  "message": "Driver updated successfully",
  "data": {
    "id": "1409f33a-1ff4-4869-944f-235196b59f32",
    "name": "Verification Driver Updated",
    "email": "test_driver_1783832836997@example.com",
    "isActive": true,
    "isDeleted": false,
    "role": "DRIVER",
    "createdAt": "2026-07-12T05:07:20.873Z",
    "updatedAt": "2026-07-12T05:07:41.244Z",
    "driverProfileId": "998a7a6e-7055-408b-99ac-e71815da78bb",
    "licenseNumber": "LIC-1783832836997",
    "licenseExpiry": "2027-07-12T05:07:19.641Z",
    "joiningDate": "2026-07-12T05:07:19.641Z",
    "phone": "9876543222",
    "emergencyContact": "9876543211",
    "bloodGroup": "O+",
    "safetyScore": "100.00",
    "experienceYears": 5,
    "availabilityStatus": "AVAILABLE"
  }
}
```
---

### 14. [Drivers] Available Drivers
- **Endpoint:** `GET /api/drivers/available`
- **Status Code:** `200` (Success)

**Response Body:**
```json
{
  "success": true,
  "message": "Available drivers retrieved successfully",
  "data": [
    {
      "id": "1409f33a-1ff4-4869-944f-235196b59f32",
      "name": "Verification Driver Updated",
      "email": "test_driver_1783832836997@example.com",
      "isActive": true,
      "isDeleted": false,
      "role": "DRIVER",
      "driverProfileId": "998a7a6e-7055-408b-99ac-e71815da78bb",
      "licenseNumber": "LIC-1783832836997",
      "licenseExpiry": "2027-07-12T05:07:19.641Z",
      "availabilityStatus": "AVAILABLE"
    },
    {
      "id": "8a222367-25de-478a-960c-832f64a472c2",
      "name": "Test Driver Reg 1783832836997",
      "email": "registered_driver_1783832836997@example.com",
      "isActive": true,
      "isDeleted": false,
      "role": "DRIVER",
      "driverProfileId": "d487f774-a63a-4dca-a116-6961e2d9df2e",
      "licenseNumber": "LIC-REG-1783832836997",
      "licenseExpiry": "2026-10-20T05:07:34.709Z",
      "availabilityStatus": "AVAILABLE"
    }
  ]
}
```
---

### 15. [Drivers] Expiring Licenses
- **Endpoint:** `GET /api/drivers/expiring-license`
- **Status Code:** `200` (Success)

**Response Body:**
```json
{
  "success": true,
  "message": "Drivers with expiring licenses retrieved successfully",
  "data": []
}
```
---

### 16. [Drivers] Update Status
- **Endpoint:** `PATCH /api/drivers/:id/status`
- **Status Code:** `200` (Success)

**Request Body:**
```json
{
  "status": "ON_LEAVE"
}
```

**Response Body:**
```json
{
  "success": true,
  "message": "Driver status updated successfully",
  "data": {
    "id": "998a7a6e-7055-408b-99ac-e71815da78bb",
    "userId": "1409f33a-1ff4-4869-944f-235196b59f32",
    "licenseNumber": "LIC-1783832836997",
    "licenseExpiry": "2027-07-12T05:07:19.641Z",
    "joiningDate": "2026-07-12T05:07:19.641Z",
    "phone": "9876543222",
    "emergencyContact": "9876543211",
    "bloodGroup": "O+",
    "safetyScore": "100.00",
    "experienceYears": 5,
    "availabilityStatus": "ON_LEAVE",
    "createdAt": "2026-07-12T05:07:21.333Z",
    "updatedAt": "2026-07-12T05:07:44.619Z"
  }
}
```
---

### 17. [Drivers] Activate Driver
- **Endpoint:** `PATCH /api/drivers/:id/activate`
- **Status Code:** `200` (Success)

**Response Body:**
```json
{
  "success": true,
  "message": "Driver activated successfully",
  "data": {
    "id": "998a7a6e-7055-408b-99ac-e71815da78bb",
    "userId": "1409f33a-1ff4-4869-944f-235196b59f32",
    "licenseNumber": "LIC-1783832836997",
    "licenseExpiry": "2027-07-12T05:07:19.641Z",
    "joiningDate": "2026-07-12T05:07:19.641Z",
    "phone": "9876543222",
    "emergencyContact": "9876543211",
    "bloodGroup": "O+",
    "safetyScore": "100.00",
    "experienceYears": 5,
    "availabilityStatus": "AVAILABLE",
    "createdAt": "2026-07-12T05:07:21.333Z",
    "updatedAt": "2026-07-12T05:07:45.647Z"
  }
}
```
---

### 18. [Drivers] Suspend Driver
- **Endpoint:** `PATCH /api/drivers/:id/suspend`
- **Status Code:** `200` (Success)

**Response Body:**
```json
{
  "success": true,
  "message": "Driver suspended successfully",
  "data": {
    "id": "998a7a6e-7055-408b-99ac-e71815da78bb",
    "userId": "1409f33a-1ff4-4869-944f-235196b59f32",
    "licenseNumber": "LIC-1783832836997",
    "licenseExpiry": "2027-07-12T05:07:19.641Z",
    "joiningDate": "2026-07-12T05:07:19.641Z",
    "phone": "9876543222",
    "emergencyContact": "9876543211",
    "bloodGroup": "O+",
    "safetyScore": "100.00",
    "experienceYears": 5,
    "availabilityStatus": "SUSPENDED",
    "createdAt": "2026-07-12T05:07:21.333Z",
    "updatedAt": "2026-07-12T05:07:46.659Z"
  }
}
```
---

### 19. [Drivers] Update License
- **Endpoint:** `PATCH /api/drivers/:id/license`
- **Status Code:** `200` (Success)

**Request Body:**
```json
{
  "licenseNumber": "LIC-NEW-1783832836997",
  "licenseExpiry": "2027-01-28T05:07:47.964Z"
}
```

**Response Body:**
```json
{
  "success": true,
  "message": "Driver license updated successfully",
  "data": {
    "id": "998a7a6e-7055-408b-99ac-e71815da78bb",
    "userId": "1409f33a-1ff4-4869-944f-235196b59f32",
    "licenseNumber": "LIC-NEW-1783832836997",
    "licenseExpiry": "2027-01-28T05:07:47.964Z",
    "joiningDate": "2026-07-12T05:07:19.641Z",
    "phone": "9876543222",
    "emergencyContact": "9876543211",
    "bloodGroup": "O+",
    "safetyScore": "100.00",
    "experienceYears": 5,
    "availabilityStatus": "AVAILABLE",
    "createdAt": "2026-07-12T05:07:21.333Z",
    "updatedAt": "2026-07-12T05:07:49.139Z"
  }
}
```
---

### 20. [Drivers] Update Safety Score
- **Endpoint:** `PATCH /api/drivers/:id/safety-score`
- **Status Code:** `200` (Success)

**Request Body:**
```json
{
  "safetyScore": "92.50"
}
```

**Response Body:**
```json
{
  "success": true,
  "message": "Driver safety score updated successfully",
  "data": {
    "id": "998a7a6e-7055-408b-99ac-e71815da78bb",
    "userId": "1409f33a-1ff4-4869-944f-235196b59f32",
    "licenseNumber": "LIC-NEW-1783832836997",
    "licenseExpiry": "2027-01-28T05:07:47.964Z",
    "joiningDate": "2026-07-12T05:07:19.641Z",
    "phone": "9876543222",
    "emergencyContact": "9876543211",
    "bloodGroup": "O+",
    "safetyScore": "92.50",
    "experienceYears": 5,
    "availabilityStatus": "AVAILABLE",
    "createdAt": "2026-07-12T05:07:21.333Z",
    "updatedAt": "2026-07-12T05:07:50.169Z"
  }
}
```
---

### 21. [Trips] Create Trip
- **Endpoint:** `POST /api/trips`
- **Status Code:** `201` (Success)

**Request Body:**
```json
{
  "vehicleId": "8d52721f-2f14-4d10-ad80-9fba843359c0",
  "driverId": "1409f33a-1ff4-4869-944f-235196b59f32",
  "source": "Mumbai Warehouse A",
  "destination": "Pune Distribution Center",
  "cargoName": "Electronic Goods",
  "cargoWeight": "5000.00",
  "distanceKm": "150.00",
  "plannedStart": "2026-07-13T05:07:50.456Z",
  "plannedEnd": "2026-08-11T05:07:50.458Z",
  "remarks": "Fragile cargo, drive safely"
}
```

**Response Body:**
```json
{
  "success": true,
  "message": "Trip created successfully",
  "data": {
    "id": "24d09b12-7bb2-4d89-98c8-fcc2bfc36caa",
    "tripNumber": "TRP-57540",
    "vehicleId": "8d52721f-2f14-4d10-ad80-9fba843359c0",
    "driverId": "1409f33a-1ff4-4869-944f-235196b59f32",
    "createdBy": "2fe1c48d-b4b1-4703-b751-95ed1d61b2af",
    "source": "Mumbai Warehouse A",
    "destination": "Pune Distribution Center",
    "cargoName": "Electronic Goods",
    "cargoWeight": "5000.00",
    "distanceKm": "150.00",
    "plannedStart": "2026-07-13T05:07:50.456Z",
    "plannedEnd": "2026-08-11T05:07:50.458Z",
    "actualStart": null,
    "actualEnd": null,
    "status": "DRAFT",
    "remarks": "Fragile cargo, drive safely",
    "createdAt": "2026-07-12T05:07:52.997Z",
    "updatedAt": "2026-07-12T05:07:52.997Z"
  }
}
```
---

### 22. [Trips] Get Trips
- **Endpoint:** `GET /api/trips`
- **Status Code:** `200` (Success)

**Response Body:**
```json
{
  "success": true,
  "message": "Trips retrieved successfully",
  "data": [
    {
      "id": "24d09b12-7bb2-4d89-98c8-fcc2bfc36caa",
      "tripNumber": "TRP-57540",
      "vehicleId": "8d52721f-2f14-4d10-ad80-9fba843359c0",
      "driverId": "1409f33a-1ff4-4869-944f-235196b59f32",
      "createdBy": "2fe1c48d-b4b1-4703-b751-95ed1d61b2af",
      "source": "Mumbai Warehouse A",
      "destination": "Pune Distribution Center",
      "cargoName": "Electronic Goods",
      "cargoWeight": "5000.00",
      "distanceKm": "150.00",
      "plannedStart": "2026-07-13T05:07:50.456Z",
      "plannedEnd": "2026-08-11T05:07:50.458Z",
      "actualStart": null,
      "actualEnd": null,
      "status": "DRAFT",
      "remarks": "Fragile cargo, drive safely",
      "createdAt": "2026-07-12T05:07:52.997Z",
      "updatedAt": "2026-07-12T05:07:52.997Z",
      "vehicle": {
        "registrationNumber": "REG-1783832836997",
        "brand": "Tata Motors",
        "model": "Prima 4030.S"
      },
      "driver": {
        "id": "1409f33a-1ff4-4869-944f-235196b59f32",
        "name": "Verification Driver Updated",
        "email": "test_driver_1783832836997@example.com"
      }
    }
  ]
}
```
---

### 23. [Trips] Trip Details
- **Endpoint:** `GET /api/trips/:id`
- **Status Code:** `200` (Success)

**Response Body:**
```json
{
  "success": true,
  "message": "Trip details retrieved successfully",
  "data": {
    "id": "24d09b12-7bb2-4d89-98c8-fcc2bfc36caa",
    "tripNumber": "TRP-57540",
    "vehicleId": "8d52721f-2f14-4d10-ad80-9fba843359c0",
    "driverId": "1409f33a-1ff4-4869-944f-235196b59f32",
    "createdBy": "2fe1c48d-b4b1-4703-b751-95ed1d61b2af",
    "source": "Mumbai Warehouse A",
    "destination": "Pune Distribution Center",
    "cargoName": "Electronic Goods",
    "cargoWeight": "5000.00",
    "distanceKm": "150.00",
    "plannedStart": "2026-07-13T05:07:50.456Z",
    "plannedEnd": "2026-08-11T05:07:50.458Z",
    "actualStart": null,
    "actualEnd": null,
    "status": "DRAFT",
    "remarks": "Fragile cargo, drive safely",
    "createdAt": "2026-07-12T05:07:52.997Z",
    "updatedAt": "2026-07-12T05:07:52.997Z",
    "vehicle": {
      "registrationNumber": "REG-1783832836997",
      "brand": "Tata Motors",
      "model": "Prima 4030.S",
      "capacityKg": "15000.00",
      "currentOdometer": "1500.00"
    },
    "driver": {
      "id": "1409f33a-1ff4-4869-944f-235196b59f32",
      "name": "Verification Driver Updated",
      "email": "test_driver_1783832836997@example.com"
    },
    "creator": {
      "id": "2fe1c48d-b4b1-4703-b751-95ed1d61b2af",
      "name": "Verification Manager",
      "email": "test_manager_1783832836997@example.com"
    }
  }
}
```
---

### 24. [Trips] Update Trip
- **Endpoint:** `PATCH /api/trips/:id`
- **Status Code:** `200` (Success)

**Request Body:**
```json
{
  "source": "Mumbai Warehouse B",
  "remarks": "Fragile electronics"
}
```

**Response Body:**
```json
{
  "success": true,
  "message": "Trip updated successfully",
  "data": {
    "id": "24d09b12-7bb2-4d89-98c8-fcc2bfc36caa",
    "tripNumber": "TRP-57540",
    "vehicleId": "8d52721f-2f14-4d10-ad80-9fba843359c0",
    "driverId": "1409f33a-1ff4-4869-944f-235196b59f32",
    "createdBy": "2fe1c48d-b4b1-4703-b751-95ed1d61b2af",
    "source": "Mumbai Warehouse B",
    "destination": "Pune Distribution Center",
    "cargoName": "Electronic Goods",
    "cargoWeight": "5000.00",
    "distanceKm": "150.00",
    "plannedStart": "2026-07-13T05:07:50.456Z",
    "plannedEnd": "2026-08-11T05:07:50.458Z",
    "actualStart": null,
    "actualEnd": null,
    "status": "DRAFT",
    "remarks": "Fragile electronics",
    "createdAt": "2026-07-12T05:07:52.997Z",
    "updatedAt": "2026-07-12T05:07:53.864Z"
  }
}
```
---

### 25. [Trips] Assign Driver
- **Endpoint:** `PATCH /api/trips/:id/assign-driver`
- **Status Code:** `200` (Success)

**Request Body:**
```json
{
  "driverId": "8a222367-25de-478a-960c-832f64a472c2"
}
```

**Response Body:**
```json
{
  "success": true,
  "message": "Driver assigned to trip successfully",
  "data": {
    "id": "24d09b12-7bb2-4d89-98c8-fcc2bfc36caa",
    "tripNumber": "TRP-57540",
    "vehicleId": "8d52721f-2f14-4d10-ad80-9fba843359c0",
    "driverId": "8a222367-25de-478a-960c-832f64a472c2",
    "createdBy": "2fe1c48d-b4b1-4703-b751-95ed1d61b2af",
    "source": "Mumbai Warehouse B",
    "destination": "Pune Distribution Center",
    "cargoName": "Electronic Goods",
    "cargoWeight": "5000.00",
    "distanceKm": "150.00",
    "plannedStart": "2026-07-13T05:07:50.456Z",
    "plannedEnd": "2026-08-11T05:07:50.458Z",
    "actualStart": null,
    "actualEnd": null,
    "status": "DRAFT",
    "remarks": "Fragile electronics",
    "createdAt": "2026-07-12T05:07:52.997Z",
    "updatedAt": "2026-07-12T05:07:55.281Z"
  }
}
```
---

### 26. [Trips] Assign Vehicle
- **Endpoint:** `PATCH /api/trips/:id/assign-vehicle`
- **Status Code:** `200` (Success)

**Request Body:**
```json
{
  "vehicleId": "8d52721f-2f14-4d10-ad80-9fba843359c0"
}
```

**Response Body:**
```json
{
  "success": true,
  "message": "Vehicle assigned to trip successfully",
  "data": {
    "id": "24d09b12-7bb2-4d89-98c8-fcc2bfc36caa",
    "tripNumber": "TRP-57540",
    "vehicleId": "8d52721f-2f14-4d10-ad80-9fba843359c0",
    "driverId": "1409f33a-1ff4-4869-944f-235196b59f32",
    "createdBy": "2fe1c48d-b4b1-4703-b751-95ed1d61b2af",
    "source": "Mumbai Warehouse B",
    "destination": "Pune Distribution Center",
    "cargoName": "Electronic Goods",
    "cargoWeight": "5000.00",
    "distanceKm": "150.00",
    "plannedStart": "2026-07-13T05:07:50.456Z",
    "plannedEnd": "2026-08-11T05:07:50.458Z",
    "actualStart": null,
    "actualEnd": null,
    "status": "DRAFT",
    "remarks": "Fragile electronics",
    "createdAt": "2026-07-12T05:07:52.997Z",
    "updatedAt": "2026-07-12T05:07:58.130Z"
  }
}
```
---

### 27. [Trips] Update Cargo
- **Endpoint:** `PATCH /api/trips/:id/cargo`
- **Status Code:** `200` (Success)

**Request Body:**
```json
{
  "cargoName": "High-Value Electronics",
  "cargoWeight": "4500.00"
}
```

**Response Body:**
```json
{
  "success": true,
  "message": "Cargo details updated successfully",
  "data": {
    "id": "24d09b12-7bb2-4d89-98c8-fcc2bfc36caa",
    "tripNumber": "TRP-57540",
    "vehicleId": "8d52721f-2f14-4d10-ad80-9fba843359c0",
    "driverId": "1409f33a-1ff4-4869-944f-235196b59f32",
    "createdBy": "2fe1c48d-b4b1-4703-b751-95ed1d61b2af",
    "source": "Mumbai Warehouse B",
    "destination": "Pune Distribution Center",
    "cargoName": "High-Value Electronics",
    "cargoWeight": "4500.00",
    "distanceKm": "150.00",
    "plannedStart": "2026-07-13T05:07:50.456Z",
    "plannedEnd": "2026-08-11T05:07:50.458Z",
    "actualStart": null,
    "actualEnd": null,
    "status": "DRAFT",
    "remarks": "Fragile electronics",
    "createdAt": "2026-07-12T05:07:52.997Z",
    "updatedAt": "2026-07-12T05:07:59.691Z"
  }
}
```
---

### 28. [Trips] Update Distance
- **Endpoint:** `PATCH /api/trips/:id/distance`
- **Status Code:** `200` (Success)

**Request Body:**
```json
{
  "distanceKm": "160.00"
}
```

**Response Body:**
```json
{
  "success": true,
  "message": "Distance details updated successfully",
  "data": {
    "id": "24d09b12-7bb2-4d89-98c8-fcc2bfc36caa",
    "tripNumber": "TRP-57540",
    "vehicleId": "8d52721f-2f14-4d10-ad80-9fba843359c0",
    "driverId": "1409f33a-1ff4-4869-944f-235196b59f32",
    "createdBy": "2fe1c48d-b4b1-4703-b751-95ed1d61b2af",
    "source": "Mumbai Warehouse B",
    "destination": "Pune Distribution Center",
    "cargoName": "High-Value Electronics",
    "cargoWeight": "4500.00",
    "distanceKm": "160.00",
    "plannedStart": "2026-07-13T05:07:50.456Z",
    "plannedEnd": "2026-08-11T05:07:50.458Z",
    "actualStart": null,
    "actualEnd": null,
    "status": "DRAFT",
    "remarks": "Fragile electronics",
    "createdAt": "2026-07-12T05:07:52.997Z",
    "updatedAt": "2026-07-12T05:08:00.899Z"
  }
}
```
---

### 29. [Trips] Dispatch Trip
- **Endpoint:** `POST /api/trips/:id/dispatch`
- **Status Code:** `200` (Success)

**Response Body:**
```json
{
  "success": true,
  "message": "Trip dispatched successfully",
  "data": {
    "id": "24d09b12-7bb2-4d89-98c8-fcc2bfc36caa",
    "tripNumber": "TRP-57540",
    "vehicleId": "8d52721f-2f14-4d10-ad80-9fba843359c0",
    "driverId": "1409f33a-1ff4-4869-944f-235196b59f32",
    "createdBy": "2fe1c48d-b4b1-4703-b751-95ed1d61b2af",
    "source": "Mumbai Warehouse B",
    "destination": "Pune Distribution Center",
    "cargoName": "High-Value Electronics",
    "cargoWeight": "4500.00",
    "distanceKm": "160.00",
    "plannedStart": "2026-07-13T05:07:50.456Z",
    "plannedEnd": "2026-08-11T05:07:50.458Z",
    "actualStart": null,
    "actualEnd": null,
    "status": "DISPATCHED",
    "remarks": "Fragile electronics",
    "createdAt": "2026-07-12T05:07:52.997Z",
    "updatedAt": "2026-07-12T05:08:02.891Z"
  }
}
```
---

### 30. [Trips] Start Trip (Driver)
- **Endpoint:** `POST /api/trips/:id/start`
- **Status Code:** `200` (Success)

**Response Body:**
```json
{
  "success": true,
  "message": "Trip started successfully",
  "data": {
    "id": "24d09b12-7bb2-4d89-98c8-fcc2bfc36caa",
    "tripNumber": "TRP-57540",
    "vehicleId": "8d52721f-2f14-4d10-ad80-9fba843359c0",
    "driverId": "1409f33a-1ff4-4869-944f-235196b59f32",
    "createdBy": "2fe1c48d-b4b1-4703-b751-95ed1d61b2af",
    "source": "Mumbai Warehouse B",
    "destination": "Pune Distribution Center",
    "cargoName": "High-Value Electronics",
    "cargoWeight": "4500.00",
    "distanceKm": "160.00",
    "plannedStart": "2026-07-13T05:07:50.456Z",
    "plannedEnd": "2026-08-11T05:07:50.458Z",
    "actualStart": "2026-07-12T05:08:04.923Z",
    "actualEnd": null,
    "status": "STARTED",
    "remarks": "Fragile electronics",
    "createdAt": "2026-07-12T05:07:52.997Z",
    "updatedAt": "2026-07-12T05:08:04.923Z"
  }
}
```
---

### 31. [Trips] Trip Timeline
- **Endpoint:** `GET /api/trips/:id/timeline`
- **Status Code:** `200` (Success)

**Response Body:**
```json
{
  "success": true,
  "message": "Trip timeline retrieved successfully",
  "data": {
    "trip": {
      "id": "24d09b12-7bb2-4d89-98c8-fcc2bfc36caa",
      "tripNumber": "TRP-57540",
      "vehicleId": "8d52721f-2f14-4d10-ad80-9fba843359c0",
      "driverId": "1409f33a-1ff4-4869-944f-235196b59f32",
      "createdBy": "2fe1c48d-b4b1-4703-b751-95ed1d61b2af",
      "source": "Mumbai Warehouse B",
      "destination": "Pune Distribution Center",
      "cargoName": "High-Value Electronics",
      "cargoWeight": "4500.00",
      "distanceKm": "160.00",
      "plannedStart": "2026-07-13T05:07:50.456Z",
      "plannedEnd": "2026-08-11T05:07:50.458Z",
      "actualStart": "2026-07-12T05:08:04.923Z",
      "actualEnd": null,
      "status": "STARTED",
      "remarks": "Fragile electronics",
      "createdAt": "2026-07-12T05:07:52.997Z",
      "updatedAt": "2026-07-12T05:08:04.923Z",
      "vehicle": {
        "registrationNumber": "REG-1783832836997",
        "brand": "Tata Motors",
        "model": "Prima 4030.S",
        "capacityKg": "15000.00",
        "currentOdometer": "1500.00"
      },
      "driver": {
        "id": "1409f33a-1ff4-4869-944f-235196b59f32",
        "name": "Verification Driver Updated",
        "email": "test_driver_1783832836997@example.com"
      },
      "creator": {
        "id": "2fe1c48d-b4b1-4703-b751-95ed1d61b2af",
        "name": "Verification Manager",
        "email": "test_manager_1783832836997@example.com"
      }
    },
    "fuelLogs": [
      {
        "id": "964d14f5-735b-433f-8541-6d034f63795f",
        "tripId": "24d09b12-7bb2-4d89-98c8-fcc2bfc36caa",
        "vehicleId": "8d52721f-2f14-4d10-ad80-9fba843359c0",
        "driverId": "1409f33a-1ff4-4869-944f-235196b59f32",
        "litres": "45.00",
        "pricePerLitre": "95.00",
        "totalCost": "4275.00",
        "stationName": "Shell Mumbai",
        "odometer": "1600.00",
        "createdAt": "2026-07-12T05:08:06.728Z"
      }
    ],
    "expenses": [
      {
        "id": "02598287-46cd-47ed-ad06-b6b4fb0a64e3",
        "tripId": "24d09b12-7bb2-4d89-98c8-fcc2bfc36caa",
        "vehicleId": "8d52721f-2f14-4d10-ad80-9fba843359c0",
        "category": "Toll",
        "amount": "400.00",
        "description": "Mumbai-Pune Expressway toll",
        "receipt": null,
        "createdBy": "2fe1c48d-b4b1-4703-b751-95ed1d61b2af",
        "createdAt": "2026-07-12T05:08:07.021Z",
        "updatedAt": "2026-07-12T05:08:07.021Z"
      }
    ]
  }
}
```
---

### 32. [Trips] Complete Trip (Driver)
- **Endpoint:** `POST /api/trips/:id/complete`
- **Status Code:** `200` (Success)

**Request Body:**
```json
{
  "actualDistance": "165.00",
  "remarks": "Delivered successfully with minor traffic delay"
}
```

**Response Body:**
```json
{
  "success": true,
  "message": "Trip completed successfully",
  "data": {
    "id": "24d09b12-7bb2-4d89-98c8-fcc2bfc36caa",
    "tripNumber": "TRP-57540",
    "vehicleId": "8d52721f-2f14-4d10-ad80-9fba843359c0",
    "driverId": "1409f33a-1ff4-4869-944f-235196b59f32",
    "createdBy": "2fe1c48d-b4b1-4703-b751-95ed1d61b2af",
    "source": "Mumbai Warehouse B",
    "destination": "Pune Distribution Center",
    "cargoName": "High-Value Electronics",
    "cargoWeight": "4500.00",
    "distanceKm": "165.00",
    "plannedStart": "2026-07-13T05:07:50.456Z",
    "plannedEnd": "2026-08-11T05:07:50.458Z",
    "actualStart": "2026-07-12T05:08:04.923Z",
    "actualEnd": "2026-07-12T05:08:08.284Z",
    "status": "COMPLETED",
    "remarks": "Delivered successfully with minor traffic delay",
    "createdAt": "2026-07-12T05:07:52.997Z",
    "updatedAt": "2026-07-12T05:08:08.573Z"
  }
}
```
---

### 33. [Trips] Cancel Trip
- **Endpoint:** `POST /api/trips/:id/cancel`
- **Status Code:** `200` (Success)

**Response Body:**
```json
{
  "success": true,
  "message": "Trip cancelled successfully",
  "data": {
    "id": "1e6ab752-8ff7-4c76-b2e6-f03fccdb1471",
    "tripNumber": "TRP-74722",
    "vehicleId": "8d52721f-2f14-4d10-ad80-9fba843359c0",
    "driverId": "1409f33a-1ff4-4869-944f-235196b59f32",
    "createdBy": "2fe1c48d-b4b1-4703-b751-95ed1d61b2af",
    "source": "Mumbai Warehouse A",
    "destination": "Pune Distribution Center",
    "cargoName": "Electronic Goods",
    "cargoWeight": "2000.00",
    "distanceKm": "150.00",
    "plannedStart": "2026-07-13T05:08:09.821Z",
    "plannedEnd": "2026-08-11T05:08:09.821Z",
    "actualStart": null,
    "actualEnd": null,
    "status": "CANCELLED",
    "remarks": null,
    "createdAt": "2026-07-12T05:08:12.379Z",
    "updatedAt": "2026-07-12T05:08:12.090Z"
  }
}
```
---

### 34. [Trips] Delete Trip
- **Endpoint:** `DELETE /api/trips/:id`
- **Status Code:** `200` (Success)

**Response Body:**
```json
{
  "success": true,
  "message": "Trip deleted successfully",
  "data": null
}
```
---

### 35. [Vehicles] Vehicle Trips
- **Endpoint:** `GET /api/vehicles/:id/trips`
- **Status Code:** `200` (Success)

**Response Body:**
```json
{
  "success": true,
  "message": "Vehicle trips retrieved successfully",
  "data": [
    {
      "id": "24d09b12-7bb2-4d89-98c8-fcc2bfc36caa",
      "tripNumber": "TRP-57540",
      "vehicleId": "8d52721f-2f14-4d10-ad80-9fba843359c0",
      "driverId": "1409f33a-1ff4-4869-944f-235196b59f32",
      "createdBy": "2fe1c48d-b4b1-4703-b751-95ed1d61b2af",
      "source": "Mumbai Warehouse B",
      "destination": "Pune Distribution Center",
      "cargoName": "High-Value Electronics",
      "cargoWeight": "4500.00",
      "distanceKm": "165.00",
      "plannedStart": "2026-07-13T05:07:50.456Z",
      "plannedEnd": "2026-08-11T05:07:50.458Z",
      "actualStart": "2026-07-12T05:08:04.923Z",
      "actualEnd": "2026-07-12T05:08:08.284Z",
      "status": "COMPLETED",
      "remarks": "Delivered successfully with minor traffic delay",
      "createdAt": "2026-07-12T05:07:52.997Z",
      "updatedAt": "2026-07-12T05:08:08.573Z"
    }
  ]
}
```
---

### 36. [Vehicles] Vehicle Maintenance
- **Endpoint:** `GET /api/vehicles/:id/maintenance`
- **Status Code:** `200` (Success)

**Response Body:**
```json
{
  "success": true,
  "message": "Vehicle maintenance logs retrieved successfully",
  "data": []
}
```
---

### 37. [Vehicles] Vehicle Fuel Logs
- **Endpoint:** `GET /api/vehicles/:id/fuel-logs`
- **Status Code:** `200` (Success)

**Response Body:**
```json
{
  "success": true,
  "message": "Vehicle fuel logs retrieved successfully",
  "data": [
    {
      "id": "964d14f5-735b-433f-8541-6d034f63795f",
      "tripId": "24d09b12-7bb2-4d89-98c8-fcc2bfc36caa",
      "vehicleId": "8d52721f-2f14-4d10-ad80-9fba843359c0",
      "driverId": "1409f33a-1ff4-4869-944f-235196b59f32",
      "litres": "45.00",
      "pricePerLitre": "95.00",
      "totalCost": "4275.00",
      "stationName": "Shell Mumbai",
      "odometer": "1600.00",
      "createdAt": "2026-07-12T05:08:06.728Z"
    }
  ]
}
```
---

### 38. [Vehicles] Vehicle Expenses
- **Endpoint:** `GET /api/vehicles/:id/expenses`
- **Status Code:** `200` (Success)

**Response Body:**
```json
{
  "success": true,
  "message": "Vehicle expenses retrieved successfully",
  "data": [
    {
      "id": "02598287-46cd-47ed-ad06-b6b4fb0a64e3",
      "tripId": "24d09b12-7bb2-4d89-98c8-fcc2bfc36caa",
      "vehicleId": "8d52721f-2f14-4d10-ad80-9fba843359c0",
      "category": "Toll",
      "amount": "400.00",
      "description": "Mumbai-Pune Expressway toll",
      "receipt": null,
      "createdBy": "2fe1c48d-b4b1-4703-b751-95ed1d61b2af",
      "createdAt": "2026-07-12T05:08:07.021Z",
      "updatedAt": "2026-07-12T05:08:07.021Z"
    }
  ]
}
```
---

### 39. [Drivers] Driver Trips
- **Endpoint:** `GET /api/drivers/:id/trips`
- **Status Code:** `200` (Success)

**Response Body:**
```json
{
  "success": true,
  "message": "Driver trips retrieved successfully",
  "data": [
    {
      "id": "24d09b12-7bb2-4d89-98c8-fcc2bfc36caa",
      "tripNumber": "TRP-57540",
      "vehicleId": "8d52721f-2f14-4d10-ad80-9fba843359c0",
      "driverId": "1409f33a-1ff4-4869-944f-235196b59f32",
      "createdBy": "2fe1c48d-b4b1-4703-b751-95ed1d61b2af",
      "source": "Mumbai Warehouse B",
      "destination": "Pune Distribution Center",
      "cargoName": "High-Value Electronics",
      "cargoWeight": "4500.00",
      "distanceKm": "165.00",
      "plannedStart": "2026-07-13T05:07:50.456Z",
      "plannedEnd": "2026-08-11T05:07:50.458Z",
      "actualStart": "2026-07-12T05:08:04.923Z",
      "actualEnd": "2026-07-12T05:08:08.284Z",
      "status": "COMPLETED",
      "remarks": "Delivered successfully with minor traffic delay",
      "createdAt": "2026-07-12T05:07:52.997Z",
      "updatedAt": "2026-07-12T05:08:08.573Z"
    }
  ]
}
```
---

### 40. [Dashboard] Dashboard Overview
- **Endpoint:** `GET /api/dashboard`
- **Status Code:** `200` (Success)

**Response Body:**
```json
{
  "success": true,
  "message": "Dashboard overview retrieved successfully",
  "data": {
    "kpis": {
      "totalVehicles": 3,
      "availableVehicles": 3,
      "totalDrivers": 2,
      "activeTrips": 0,
      "vehiclesInMaintenance": 0,
      "totalFuelCost": 4275,
      "totalExpenses": 400
    },
    "vehicleSummary": {
      "AVAILABLE": 3,
      "ON_TRIP": 0,
      "MAINTENANCE": 0,
      "RETIRED": 0
    },
    "driverSummary": {
      "AVAILABLE": 2,
      "ON_TRIP": 0,
      "ON_LEAVE": 0,
      "SUSPENDED": 0
    },
    "tripSummary": {
      "DRAFT": 0,
      "DISPATCHED": 0,
      "STARTED": 0,
      "COMPLETED": 1,
      "CANCELLED": 0
    },
    "recentActivities": {
      "trips": [
        {
          "id": "24d09b12-7bb2-4d89-98c8-fcc2bfc36caa",
          "tripNumber": "TRP-57540",
          "source": "Mumbai Warehouse B",
          "destination": "Pune Distribution Center",
          "status": "COMPLETED",
          "createdAt": "2026-07-12T05:07:52.997Z"
        }
      ],
      "fuelLogs": [
        {
          "id": "964d14f5-735b-433f-8541-6d034f63795f",
          "stationName": "Shell Mumbai",
          "totalCost": "4275.00",
          "createdAt": "2026-07-12T05:08:06.728Z"
        }
      ]
    }
  }
}
```
---

### 41. [Dashboard] Dashboard KPIs
- **Endpoint:** `GET /api/dashboard/kpis`
- **Status Code:** `200` (Success)

**Response Body:**
```json
{
  "success": true,
  "message": "Dashboard KPIs retrieved successfully",
  "data": {
    "totalVehicles": 3,
    "availableVehicles": 3,
    "totalDrivers": 2,
    "activeTrips": 0,
    "vehiclesInMaintenance": 0,
    "totalFuelCost": 4275,
    "totalExpenses": 400
  }
}
```
---

### 42. [Dashboard] Vehicle Summary
- **Endpoint:** `GET /api/dashboard/vehicle-summary`
- **Status Code:** `200` (Success)

**Response Body:**
```json
{
  "success": true,
  "message": "Vehicle status summary retrieved successfully",
  "data": {
    "AVAILABLE": 3,
    "ON_TRIP": 0,
    "MAINTENANCE": 0,
    "RETIRED": 0
  }
}
```
---

### 43. [Dashboard] Driver Summary
- **Endpoint:** `GET /api/dashboard/driver-summary`
- **Status Code:** `200` (Success)

**Response Body:**
```json
{
  "success": true,
  "message": "Driver availability summary retrieved successfully",
  "data": {
    "AVAILABLE": 2,
    "ON_TRIP": 0,
    "ON_LEAVE": 0,
    "SUSPENDED": 0
  }
}
```
---

### 44. [Dashboard] Trip Summary
- **Endpoint:** `GET /api/dashboard/trip-summary`
- **Status Code:** `200` (Success)

**Response Body:**
```json
{
  "success": true,
  "message": "Trip status summary retrieved successfully",
  "data": {
    "DRAFT": 0,
    "DISPATCHED": 0,
    "STARTED": 0,
    "COMPLETED": 1,
    "CANCELLED": 0
  }
}
```
---

### 45. [Dashboard] Recent Activities
- **Endpoint:** `GET /api/dashboard/recent-activities`
- **Status Code:** `200` (Success)

**Response Body:**
```json
{
  "success": true,
  "message": "Recent activities retrieved successfully",
  "data": {
    "trips": [
      {
        "id": "24d09b12-7bb2-4d89-98c8-fcc2bfc36caa",
        "tripNumber": "TRP-57540",
        "source": "Mumbai Warehouse B",
        "destination": "Pune Distribution Center",
        "status": "COMPLETED",
        "createdAt": "2026-07-12T05:07:52.997Z"
      }
    ],
    "fuelLogs": [
      {
        "id": "964d14f5-735b-433f-8541-6d034f63795f",
        "stationName": "Shell Mumbai",
        "totalCost": "4275.00",
        "createdAt": "2026-07-12T05:08:06.728Z"
      }
    ]
  }
}
```
---
