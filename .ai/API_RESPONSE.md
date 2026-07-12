# API Response Logs

Generated automatically during integration test runs.

## Auth Module


### User Registration Success
- **Request**: `POST /api/auth/register`
- **Response Status**: `201`
- **Request Body**:
```json
{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "password123"
}
```
- **Response Body**:
```json
{
    "message": "User registered successfully",
    "success": true,
    "error": null,
    "user": {
        "id": "52128436-7b6b-4be4-aaa9-2271380d8db1",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "role": "DRIVER",
        "isActive": true,
        "emailVerified": false,
        "createdAt": "2026-07-12T07:43:10.744Z",
        "updatedAt": "2026-07-12T07:43:10.744Z"
    }
}
```

---

### User Registration Validation Failure
- **Request**: `POST /api/auth/register`
- **Response Status**: `400`
- **Request Body**:
```json
{
    "name": "",
    "email": "invalid-email",
    "password": "123"
}
```
- **Response Body**:
```json
{
    "message": "Validation failed",
    "success": false,
    "error": null,
    "errors": [
        {
            "type": "field",
            "value": "",
            "msg": "Name is required",
            "path": "name",
            "location": "body"
        },
        {
            "type": "field",
            "value": "invalid-email",
            "msg": "A valid email is required",
            "path": "email",
            "location": "body"
        },
        {
            "type": "field",
            "value": "123",
            "msg": "Password must be at least 6 characters long",
            "path": "password",
            "location": "body"
        }
    ]
}
```

---

### User Login Success
- **Request**: `POST /api/auth/login`
- **Response Status**: `200`
- **Request Body**:
```json
{
    "email": "john.doe@example.com",
    "password": "password123"
}
```
- **Response Body**:
```json
{
    "message": "Login successful.",
    "success": true,
    "error": null,
    "user": {
        "id": "2f233ec9-94e2-443e-b533-1c2bd1431bbb",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "role": "DRIVER",
        "isActive": true,
        "emailVerified": false,
        "createdAt": "2026-07-12T07:43:14.534Z",
        "updatedAt": "2026-07-12T07:43:14.534Z"
    }
}
```

---

### User Login Failure (Wrong Password)
- **Request**: `POST /api/auth/login`
- **Response Status**: `401`
- **Request Body**:
```json
{
    "email": "john.doe@example.com",
    "password": "wrongpassword"
}
```
- **Response Body**:
```json
{
    "message": "Invalid email or password.",
    "success": false,
    "error": null
}
```

---

### User Logout Success
- **Request**: `POST /api/auth/logout`
- **Response Status**: `200`

- **Response Body**:
```json
{
    "message": "Logout successful.",
    "success": true,
    "error": null
}
```

---

### Access Profile with Blacklisted Token
- **Request**: `GET /api/auth/me`
- **Response Status**: `401`

- **Response Body**:
```json
{
    "message": "Your session has expired or been logged out. Please log in again.",
    "success": false,
    "error": null
}
```

---

### Get Current User (Success)
- **Request**: `GET /api/auth/me`
- **Response Status**: `200`

- **Response Body**:
```json
{
    "message": "User retrieved successfully",
    "success": true,
    "error": null,
    "user": {
        "id": "d47213cf-d5de-4477-98c3-67c0571fcd94",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "role": "DRIVER",
        "isActive": true,
        "emailVerified": false,
        "phone": null,
        "profileImage": null,
        "status": "ACTIVE",
        "createdAt": "2026-07-12T07:43:26.471Z",
        "updatedAt": "2026-07-12T07:43:26.471Z"
    },
    "data": {
        "user": {
            "id": "d47213cf-d5de-4477-98c3-67c0571fcd94",
            "name": "John Doe",
            "email": "john.doe@example.com",
            "role": "DRIVER",
            "isActive": true,
            "emailVerified": false,
            "phone": null,
            "profileImage": null,
            "status": "ACTIVE",
            "createdAt": "2026-07-12T07:43:26.471Z",
            "updatedAt": "2026-07-12T07:43:26.471Z"
        }
    }
}
```

---

### Get Current User (Unauthenticated)
- **Request**: `GET /api/auth/me`
- **Response Status**: `401`

- **Response Body**:
```json
{
    "message": "You are not logged in. Please log in to gain access.",
    "success": false,
    "error": null
}
```

---

### List Users as User (RBAC Denied)
- **Request**: `GET /api/auth/users`
- **Response Status**: `403`

- **Response Body**:
```json
{
    "message": "You do not have permission to perform this action.",
    "success": false,
    "error": null
}
```

---

### List Users as Admin (Success)
- **Request**: `GET /api/auth/users`
- **Response Status**: `200`

- **Response Body**:
```json
{
    "message": "Users retrieved successfully",
    "success": true,
    "error": null,
    "data": {
        "users": [
            {
                "id": "b9ad8558-d708-4ff1-8a70-77a0a3f04bf9",
                "name": "Fleet Manager",
                "email": "admin@transitops.com",
                "role": "FLEET_MANAGER",
                "isActive": true,
                "isDeleted": false,
                "deletedAt": null,
                "emailVerified": true,
                "phone": "9812345670",
                "profileImage": null,
                "status": "ACTIVE",
                "createdAt": "2026-07-12T06:12:41.535Z",
                "updatedAt": "2026-07-12T06:12:41.535Z"
            },
            {
                "id": "96f8e149-1462-4b7f-934b-73e9234cbb08",
                "name": "Sarah Connor",
                "email": "sarah.connor@transitops.com",
                "role": "SAFETY_OFFICER",
                "isActive": true,
                "isDeleted": false,
                "deletedAt": null,
                "emailVerified": true,
                "phone": "9812345671",
                "profileImage": null,
                "status": "ACTIVE",
                "createdAt": "2026-07-12T06:12:41.535Z",
                "updatedAt": "2026-07-12T06:12:41.535Z"
            },
            {
                "id": "8df46816-cf79-4200-ba23-27c781204e21",
                "name": "David Kowalski",
                "email": "david.kowalski@transitops.com",
                "role": "FINANCIAL_ANALYST",
                "isActive": true,
                "isDeleted": false,
                "deletedAt": null,
                "emailVerified": true,
                "phone": "9812345672",
                "profileImage": null,
                "status": "ACTIVE",
                "createdAt": "2026-07-12T06:12:41.535Z",
                "updatedAt": "2026-07-12T06:12:41.535Z"
            },
            {
                "id": "3db8f141-cf69-4290-b06f-5ba4632d7371",
                "name": "Robert Miller",
                "email": "robert.miller@transitops.com",
                "role": "DRIVER",
                "isActive": true,
                "isDeleted": false,
                "deletedAt": null,
                "emailVerified": true,
                "phone": "9876543210",
                "profileImage": null,
                "status": "ACTIVE",
                "createdAt": "2026-07-12T06:12:41.535Z",
                "updatedAt": "2026-07-12T06:12:41.535Z"
            },
            {
                "id": "318b7b74-4d8b-4122-80ec-fb7f6b70b80e",
                "name": "John Doe",
                "email": "john.doe@transitops.com",
                "role": "DRIVER",
                "isActive": true,
                "isDeleted": false,
                "deletedAt": null,
                "emailVerified": true,
                "phone": "9812345678",
                "profileImage": null,
                "status": "ACTIVE",
                "createdAt": "2026-07-12T06:12:41.535Z",
                "updatedAt": "2026-07-12T06:12:41.535Z"
            },
            {
                "id": "53bba155-ceb6-4f4a-aaaa-1244836a0e27",
                "name": "Carlos Santoro",
                "email": "carlos.santoro@transitops.com",
                "role": "DRIVER",
                "isActive": true,
                "isDeleted": false,
                "deletedAt": null,
                "emailVerified": true,
                "phone": "9945612378",
                "profileImage": null,
                "status": "ACTIVE",
                "createdAt": "2026-07-12T06:12:41.535Z",
                "updatedAt": "2026-07-12T06:12:41.535Z"
            },
            {
                "id": "d80070ed-0538-4efc-b0f8-6c9c818c8ef9",
                "name": "Alex Wong",
                "email": "alex.wong@transitops.com",
                "role": "DRIVER",
                "isActive": true,
                "isDeleted": false,
                "deletedAt": null,
                "emailVerified": true,
                "phone": "9789456123",
                "profileImage": null,
                "status": "ACTIVE",
                "createdAt": "2026-07-12T06:12:41.535Z",
                "updatedAt": "2026-07-12T06:12:41.535Z"
            },
            {
                "id": "a3eec3d3-e4f9-45d7-a6f6-9a316f6d673c",
                "name": "John Doe",
                "email": "john.doe@example.com",
                "role": "DRIVER",
                "isActive": true,
                "isDeleted": false,
                "deletedAt": null,
                "emailVerified": false,
                "phone": null,
                "profileImage": null,
                "status": "ACTIVE",
                "createdAt": "2026-07-12T07:43:40.576Z",
                "updatedAt": "2026-07-12T07:43:40.576Z"
            },
            {
                "id": "557f0aba-74d1-434d-9fe6-726aaaed476d",
                "name": "Admin User",
                "email": "admin@example.com",
                "role": "FLEET_MANAGER",
                "isActive": true,
                "isDeleted": false,
                "deletedAt": null,
                "emailVerified": false,
                "phone": null,
                "profileImage": null,
                "status": "ACTIVE",
                "createdAt": "2026-07-12T07:43:41.161Z",
                "updatedAt": "2026-07-12T07:43:41.161Z"
            }
        ]
    }
}
```

---

### Update Profile Name
- **Request**: `PATCH /api/auth/profile`
- **Response Status**: `200`
- **Request Body**:
```json
{
    "name": "John Updated"
}
```
- **Response Body**:
```json
{
    "message": "Profile updated successfully",
    "success": true,
    "error": null,
    "data": {
        "user": {
            "id": "57c968a6-7c4b-4d31-9d09-e39478441dfa",
            "name": "John Updated",
            "email": "john.doe@example.com",
            "role": "DRIVER",
            "isActive": true,
            "emailVerified": false,
            "phone": null,
            "profileImage": null,
            "status": "ACTIVE",
            "createdAt": "2026-07-12T07:43:44.688Z",
            "updatedAt": "2026-07-12T07:43:38.297Z"
        }
    }
}
```

---

### Change Password
- **Request**: `PATCH /api/auth/change-password`
- **Response Status**: `200`
- **Request Body**:
```json
{
    "currentPassword": "password123",
    "newPassword": "newpassword123"
}
```
- **Response Body**:
```json
{
    "message": "Password changed successfully",
    "success": true,
    "error": null
}
```

---

### Self Soft-Delete Account
- **Request**: `DELETE /api/auth/account`
- **Response Status**: `200`

- **Response Body**:
```json
{
    "message": "Account deleted successfully",
    "success": true,
    "error": null
}
```

---

### Login Attempt as Deleted User
- **Request**: `POST /api/auth/login`
- **Response Status**: `401`
- **Request Body**:
```json
{
    "email": "john.doe@example.com",
    "password": "password123"
}
```
- **Response Body**:
```json
{
    "message": "Invalid email or password.",
    "success": false,
    "error": null
}
```

