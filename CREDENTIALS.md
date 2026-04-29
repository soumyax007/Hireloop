# HireLoop — Login Credentials

## 🎓 Demo Student Account
| Field    | Value                |
|----------|----------------------|
| Email    | student@sau.int      |
| Password | Student@123          |
| Role     | Student              |

## 🛡️ Master Admin Account (Placement Cell)
| Field    | Value                |
|----------|----------------------|
| Email    | admin@sau.int        |
| Password | Admin@SAU#2025       |
| Role     | Admin                |

---

## Notes
- These credentials work in **demo mode** (no backend required).
- In production, these users must exist in the database.
- The demo mode is handled in `AuthContext.jsx` with a DEMO_USERS map.
- Forgot Password OTP will be shown on screen in demo mode (console + yellow banner).
- To bypass OTP in testing, enter `000000` as the code.

## Forgot Password Flow (Demo)
1. Go to `/forgot-password`
2. Enter any email
3. The OTP code will appear in a yellow banner on screen
4. Enter the code → set new password

## Creating Real Admin in DB
```sql
-- After running migrations:
INSERT INTO users (id, email, "passwordHash", role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin@sau.int',
  '$2b$12$YOUR_BCRYPT_HASH_HERE',  -- bcrypt hash of Admin@SAU#2025
  'ADMIN', now(), now()
);
```
