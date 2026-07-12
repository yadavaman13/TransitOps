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
        "id": "03cde576-7f82-4566-9702-c7967a4346c0",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "role": "DRIVER",
        "isActive": true,
        "emailVerified": false,
        "createdAt": "2026-07-12T10:47:26.181Z",
        "updatedAt": "2026-07-12T10:47:26.181Z"
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
- **Response Status**: `400`
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
    "message": "Validation failed",
    "success": false,
    "error": null,
    "errors": [
        {
            "type": "field",
            "value": "",
            "msg": "Role is required",
            "path": "role",
            "location": "body"
        },
        {
            "type": "field",
            "value": "",
            "msg": "Role must be FLEET_MANAGER, DRIVER, SAFETY_OFFICER, or FINANCIAL_ANALYST",
            "path": "role",
            "location": "body"
        }
    ]
}
```

---

### User Login Failure (Wrong Password)
- **Request**: `POST /api/auth/login`
- **Response Status**: `400`
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
    "message": "Validation failed",
    "success": false,
    "error": null,
    "errors": [
        {
            "type": "field",
            "value": "",
            "msg": "Role is required",
            "path": "role",
            "location": "body"
        },
        {
            "type": "field",
            "value": "",
            "msg": "Role must be FLEET_MANAGER, DRIVER, SAFETY_OFFICER, or FINANCIAL_ANALYST",
            "path": "role",
            "location": "body"
        }
    ]
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

