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
        "id": "fa98e453-a4cb-40b8-a109-578e53e3295c",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "role": "DRIVER",
        "isActive": true,
        "emailVerified": false,
        "createdAt": "2026-07-12T10:54:01.730Z",
        "updatedAt": "2026-07-12T10:54:01.730Z"
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
    "password": "password123",
    "role": "DRIVER"
}
```
- **Response Body**:
```json
{
    "message": "Login successful.",
    "success": true,
    "error": null,
    "user": {
        "id": "db1726d7-cf88-4c0f-9a45-9eb09201e4a1",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "role": "DRIVER",
        "isActive": true,
        "emailVerified": false,
        "createdAt": "2026-07-12T10:54:06.363Z",
        "updatedAt": "2026-07-12T10:54:06.363Z"
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
    "password": "wrongpassword",
    "role": "DRIVER"
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
        "id": "d6d0d0f3-7c2e-47e6-baa5-7dc2d6a6ec8b",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "role": "DRIVER",
        "phone": null,
        "profileImage": "https://ik.imagekit.io/2bzzjhgkg/defaul_profile_image.jpeg",
        "isActive": true,
        "emailVerified": false,
        "status": "ACTIVE",
        "createdAt": "2026-07-12T10:54:11.487Z",
        "updatedAt": "2026-07-12T10:54:11.487Z"
    },
    "data": {
        "user": {
            "id": "d6d0d0f3-7c2e-47e6-baa5-7dc2d6a6ec8b",
            "name": "John Doe",
            "email": "john.doe@example.com",
            "role": "DRIVER",
            "phone": null,
            "profileImage": "https://ik.imagekit.io/2bzzjhgkg/defaul_profile_image.jpeg",
            "isActive": true,
            "emailVerified": false,
            "status": "ACTIVE",
            "createdAt": "2026-07-12T10:54:11.487Z",
            "updatedAt": "2026-07-12T10:54:11.487Z"
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
                "id": "bec5d08e-6772-41b2-ac46-f5166d7a4c1f",
                "name": "Fleet Manager",
                "email": "admin@transitops.com",
                "role": "FLEET_MANAGER",
                "isActive": true,
                "isDeleted": false,
                "deletedAt": null,
                "emailVerified": true,
                "phone": "9812345670",
                "profileImage": "https://ik.imagekit.io/2bzzjhgkg/defaul_profile_image.jpeg",
                "status": "ACTIVE",
                "createdAt": "2026-07-12T10:02:41.479Z",
                "updatedAt": "2026-07-12T10:02:41.479Z"
            },
            {
                "id": "e330efa7-3db4-48bb-a000-31b6ef4bc6cd",
                "name": "Sunita Rao",
                "email": "sunita.rao@transitops.com",
                "role": "SAFETY_OFFICER",
                "isActive": true,
                "isDeleted": false,
                "deletedAt": null,
                "emailVerified": true,
                "phone": "9812345671",
                "profileImage": "https://ik.imagekit.io/2bzzjhgkg/defaul_profile_image.jpeg",
                "status": "ACTIVE",
                "createdAt": "2026-07-12T10:02:41.479Z",
                "updatedAt": "2026-07-12T10:02:41.479Z"
            },
            {
                "id": "7d18a63f-288b-4ce9-a744-9ad8506cb7a5",
                "name": "Anil Sharma",
                "email": "anil.sharma@transitops.com",
                "role": "FINANCIAL_ANALYST",
                "isActive": true,
                "isDeleted": false,
                "deletedAt": null,
                "emailVerified": true,
                "phone": "9812345672",
                "profileImage": "https://ik.imagekit.io/2bzzjhgkg/defaul_profile_image.jpeg",
                "status": "ACTIVE",
                "createdAt": "2026-07-12T10:02:41.479Z",
                "updatedAt": "2026-07-12T10:02:41.479Z"
            },
            {
                "id": "2cc0806b-590c-4af4-b8c0-3988d8ee16cf",
                "name": "Rajesh Kumar",
                "email": "rajesh.kumar@transitops.com",
                "role": "DRIVER",
                "isActive": true,
                "isDeleted": false,
                "deletedAt": null,
                "emailVerified": true,
                "phone": "9876543210",
                "profileImage": "https://ik.imagekit.io/2bzzjhgkg/defaul_profile_image.jpeg",
                "status": "ACTIVE",
                "createdAt": "2026-07-12T10:02:41.479Z",
                "updatedAt": "2026-07-12T10:02:41.479Z"
            },
            {
                "id": "236c8dbe-68c1-4265-acbf-93cd12e64ba6",
                "name": "Amit Patel",
                "email": "amit.patel@transitops.com",
                "role": "DRIVER",
                "isActive": true,
                "isDeleted": false,
                "deletedAt": null,
                "emailVerified": true,
                "phone": "9812345678",
                "profileImage": "https://ik.imagekit.io/2bzzjhgkg/defaul_profile_image.jpeg",
                "status": "ACTIVE",
                "createdAt": "2026-07-12T10:02:41.479Z",
                "updatedAt": "2026-07-12T10:02:41.479Z"
            },
            {
                "id": "e290ade7-5b32-44ba-97c5-80642f2c5c33",
                "name": "Vijay Singh",
                "email": "vijay.singh@transitops.com",
                "role": "DRIVER",
                "isActive": true,
                "isDeleted": false,
                "deletedAt": null,
                "emailVerified": true,
                "phone": "9945612378",
                "profileImage": "https://ik.imagekit.io/2bzzjhgkg/defaul_profile_image.jpeg",
                "status": "ACTIVE",
                "createdAt": "2026-07-12T10:02:41.479Z",
                "updatedAt": "2026-07-12T10:02:41.479Z"
            },
            {
                "id": "9c673c25-1f9b-4d14-95f8-e74c59ebf816",
                "name": "Sanjay Sharma",
                "email": "sanjay.sharma@transitops.com",
                "role": "DRIVER",
                "isActive": true,
                "isDeleted": false,
                "deletedAt": null,
                "emailVerified": true,
                "phone": "9789456123",
                "profileImage": "https://ik.imagekit.io/2bzzjhgkg/defaul_profile_image.jpeg",
                "status": "ACTIVE",
                "createdAt": "2026-07-12T10:02:41.479Z",
                "updatedAt": "2026-07-12T10:02:41.479Z"
            },
            {
                "id": "751fcb26-144e-4523-974a-cfa2ca776430",
                "name": "Aman Yadav",
                "email": "skyh53624@gmail.com",
                "role": "DRIVER",
                "isActive": true,
                "isDeleted": false,
                "deletedAt": null,
                "emailVerified": false,
                "phone": null,
                "profileImage": "https://ik.imagekit.io/2bzzjhgkg/defaul_profile_image.jpeg",
                "status": "ACTIVE",
                "createdAt": "2026-07-12T10:40:48.266Z",
                "updatedAt": "2026-07-12T10:40:48.266Z"
            },
            {
                "id": "b6a1e5b2-454e-434f-a477-03362f555378",
                "name": "Admin User",
                "email": "admin@example.com",
                "role": "FLEET_MANAGER",
                "isActive": true,
                "isDeleted": false,
                "deletedAt": null,
                "emailVerified": false,
                "phone": null,
                "profileImage": "https://ik.imagekit.io/2bzzjhgkg/defaul_profile_image.jpeg",
                "status": "ACTIVE",
                "createdAt": "2026-07-12T10:54:20.909Z",
                "updatedAt": "2026-07-12T10:54:20.909Z"
            },
            {
                "id": "f49b38b3-fba2-484d-8d10-b3d5ae17b98f",
                "name": "John Doe",
                "email": "john.doe@example.com",
                "role": "DRIVER",
                "isActive": true,
                "isDeleted": false,
                "deletedAt": null,
                "emailVerified": false,
                "phone": null,
                "profileImage": "https://ik.imagekit.io/2bzzjhgkg/defaul_profile_image.jpeg",
                "status": "ACTIVE",
                "createdAt": "2026-07-12T10:54:20.511Z",
                "updatedAt": "2026-07-12T10:54:20.511Z"
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
            "id": "b0cd0574-607c-4513-bc4b-6664ea257d39",
            "name": "John Updated",
            "email": "john.doe@example.com",
            "role": "DRIVER",
            "phone": null,
            "profileImage": "https://ik.imagekit.io/2bzzjhgkg/defaul_profile_image.jpeg",
            "isActive": true,
            "emailVerified": false,
            "status": "ACTIVE",
            "createdAt": "2026-07-12T10:54:23.776Z",
            "updatedAt": "2026-07-12T10:54:16.982Z"
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

