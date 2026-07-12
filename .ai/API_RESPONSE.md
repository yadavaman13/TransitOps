# API Response Logs

Generated automatically during integration test runs.

## Auth Module


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

### User Registration Success
- **Request**: `POST /api/auth/register`
- **Response Status**: `500`
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
    "message": "Failed query: insert into \"users\" (\"id\", \"name\", \"email\", \"password\", \"role\", \"email_verified\", \"is_active\", \"is_deleted\", \"deleted_at\", \"phone\", \"profile_image\", \"status\", \"created_at\", \"updated_at\") values (default, $1, $2, $3, $4, $5, $6, $7, default, default, default, default, default, default) returning \"id\", \"name\", \"email\", \"password\", \"role\", \"email_verified\", \"is_active\", \"is_deleted\", \"deleted_at\", \"phone\", \"profile_image\", \"status\", \"created_at\", \"updated_at\"\nparams: John Doe,john.doe@example.com,$2b$10$yPZBCH8BV5ydMTqXRUNYS.GTurNtCkK9EwYpK1jF7FlFl0560.RGG,USER,false,true,false",
    "success": false,
    "error": null
}
```

