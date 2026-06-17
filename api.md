# FitFlow Backend API

Base URL for local development:

```txt
http://localhost:8080
```

Status legend:

- `Implemented`: available in the current backend.
- `Planned`: API contract for upcoming backend work.

All authenticated endpoints require:

```txt
Authorization: Bearer ACCESS_TOKEN
```

Success response shape:

```json
{ "data": {} }
```

Error response shape:

```json
{ "error": { "code": "error_code", "message": "Human readable message" } }
```

Common status codes:

- `200`: request succeeded
- `201`: resource created
- `400`: invalid request body or validation failure
- `401`: missing or invalid auth
- `403`: authenticated but not allowed
- `404`: resource not found
- `409`: duplicate or conflicting resource
- `500`: server error

## Health

### GET /health

Status: `Implemented`

Returns API health.

Response `200`:

```json
{ "status": "ok" }
```

### GET /api/health

Status: `Implemented`

Returns API health under the API prefix.

Response `200`:

```json
{ "status": "ok" }
```

## Auth

The frontend must encrypt passwords with Web Crypto using RSA-OAEP and SHA-256. The backend never accepts raw `password` in register/login payloads.

Frontend environment variable:

```txt
NEXT_PUBLIC_AUTH_PASSWORD_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----...
```

Backend environment variable:

```txt
AUTH_PASSWORD_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...
```

### POST /api/auth/register

Status: `Implemented`

Request:

```json
{
  "name": "Brian",
  "email": "brian@example.com",
  "password_encrypted": "base64-rsa-oaep-ciphertext",
  "password_alg": "RSA-OAEP-SHA256"
}
```

Response `201`:

```json
{
  "data": {
    "access_token": "jwt",
    "refresh_token": "refresh-token",
    "user": {
      "id": "uuid",
      "name": "Brian",
      "email": "brian@example.com",
      "created_at": "2026-06-11T00:00:00Z"
    }
  }
}
```

### POST /api/auth/login

Status: `Implemented`

Request:

```json
{
  "email": "brian@example.com",
  "password_encrypted": "base64-rsa-oaep-ciphertext",
  "password_alg": "RSA-OAEP-SHA256"
}
```

Response `200` has the same shape as register.

### POST /api/auth/refresh

Status: `Implemented`

Request:

```json
{ "refresh_token": "refresh-token" }
```

Response `200` returns a new access token and rotated refresh token.

### POST /api/auth/logout

Status: `Implemented`

Request:

```json
{ "refresh_token": "refresh-token" }
```

Response `200`:

```json
{ "data": { "success": true } }
```

### GET /api/auth/me

Status: `Implemented`

Response `200`:

```json
{
  "data": {
    "id": "uuid",
    "name": "Brian",
    "email": "brian@example.com",
    "created_at": "2026-06-11T00:00:00Z"
  }
}
```

## Users

### GET /api/users/me

Status: `Planned`

Returns the current user profile. This can mirror `GET /api/auth/me` or replace it later.

Response `200`:

```json
{
  "data": {
    "id": "uuid",
    "name": "Brian",
    "email": "brian@example.com",
    "fitness_goal": "build_muscle",
    "height_cm": 175,
    "weight_kg": 78.5,
    "created_at": "2026-06-11T00:00:00Z",
    "updated_at": "2026-06-11T00:00:00Z"
  }
}
```

### PATCH /api/users/me

Status: `Planned`

Request:

```json
{
  "name": "Brian",
  "fitness_goal": "build_muscle",
  "height_cm": 175,
  "weight_kg": 78.5
}
```

Response `200` returns the updated profile.

## Habits

### GET /api/habits

Status: `Implemented`

Query params:

- `active`: optional boolean, defaults to `true`

Response `200`:

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Drink water",
      "description": "2L per day",
      "frequency": "daily",
      "target_count": 1,
      "is_active": true,
      "completed_today": false,
      "current_streak": 0,
      "created_at": "2026-06-11T00:00:00Z",
      "updated_at": "2026-06-11T00:00:00Z"
    }
  ]
}
```

### POST /api/habits

Status: `Implemented`

Request:

```json
{
  "name": "Drink water",
  "description": "2L per day",
  "frequency": "daily",
  "target_count": 1
}
```

Response `201` returns the created habit.

### GET /api/habits/{id}

Status: `Planned`

Response `200` returns one habit.

### PUT /api/habits/{id}

Status: `Planned`

Request:

```json
{
  "name": "Drink 2L water",
  "description": "Daily hydration target",
  "frequency": "daily",
  "target_count": 1,
  "is_active": true
}
```

Response `200` returns the updated habit.

### DELETE /api/habits/{id}

Status: `Planned`

Soft-deactivates or deletes the habit.

Response `200`:

```json
{ "data": { "success": true } }
```

### POST /api/habits/{id}/complete

Status: `Implemented`

Marks the habit complete for today.

Response `200`:

```json
{ "data": { "success": true } }
```

### DELETE /api/habits/{id}/complete

Status: `Implemented`

Removes today's completion log.

Response `200`:

```json
{ "data": { "success": true } }
```

### GET /api/habits/logs

Status: `Planned`

Query params:

- `from`: required date, for example `2026-06-01`
- `to`: required date, for example `2026-06-07`
- `habit_id`: optional UUID

Response `200`:

```json
{
  "data": [
    {
      "id": "uuid",
      "habit_id": "uuid",
      "log_date": "2026-06-15",
      "completed_count": 1,
      "is_completed": true,
      "created_at": "2026-06-15T00:00:00Z"
    }
  ]
}
```

## Workout Plans

### GET /api/workout-plans

Status: `Planned`

Response `200`:

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Pull Day",
      "description": "Back and biceps",
      "scheduled_day": "monday",
      "exercise_count": 5,
      "created_at": "2026-06-11T00:00:00Z",
      "updated_at": "2026-06-11T00:00:00Z"
    }
  ]
}
```

### POST /api/workout-plans

Status: `Planned`

Request:

```json
{
  "name": "Pull Day",
  "description": "Back and biceps",
  "scheduled_day": "monday"
}
```

Response `201` returns the created workout plan.

### GET /api/workout-plans/{id}

Status: `Planned`

Response `200`:

```json
{
  "data": {
    "id": "uuid",
    "name": "Pull Day",
    "description": "Back and biceps",
    "scheduled_day": "monday",
    "exercises": [
      {
        "id": "uuid",
        "name": "Dumbbell curl",
        "muscle_group": "biceps",
        "target_sets": 3,
        "target_reps": 10,
        "target_weight_kg": 10,
        "rest_seconds": 60,
        "order_index": 1
      }
    ],
    "created_at": "2026-06-11T00:00:00Z",
    "updated_at": "2026-06-11T00:00:00Z"
  }
}
```

### PUT /api/workout-plans/{id}

Status: `Planned`

Request:

```json
{
  "name": "Pull Day",
  "description": "Back, biceps, rear delts",
  "scheduled_day": "monday"
}
```

Response `200` returns the updated workout plan.

### DELETE /api/workout-plans/{id}

Status: `Planned`

Deletes the workout plan and its planned exercises. Historical workout sessions remain because set logs store exercise snapshots.

Response `200`:

```json
{ "data": { "success": true } }
```

### GET /api/workout-plans/today

Status: `Planned`

Returns workout plans scheduled for the current day.

Response `200` returns a list of workout plans.

## Exercises

### POST /api/workout-plans/{id}/exercises

Status: `Planned`

Request:

```json
{
  "name": "Dumbbell curl",
  "muscle_group": "biceps",
  "target_sets": 3,
  "target_reps": 10,
  "target_weight_kg": 10,
  "rest_seconds": 60,
  "order_index": 1
}
```

Response `201` returns the created exercise.

### PUT /api/exercises/{id}

Status: `Planned`

Request:

```json
{
  "name": "Dumbbell curl",
  "muscle_group": "biceps",
  "target_sets": 3,
  "target_reps": 12,
  "target_weight_kg": 12.5,
  "rest_seconds": 75,
  "order_index": 1
}
```

Response `200` returns the updated exercise.

### DELETE /api/exercises/{id}

Status: `Planned`

Deletes the planned exercise. Historical set logs keep `exercise_name` as a snapshot.

Response `200`:

```json
{ "data": { "success": true } }
```

## Workout Sessions

### POST /api/workout-sessions/start

Status: `Planned`

Request:

```json
{
  "workout_plan_id": "uuid",
  "notes": "Felt strong today"
}
```

Response `201`:

```json
{
  "data": {
    "id": "uuid",
    "workout_plan_id": "uuid",
    "started_at": "2026-06-15T08:00:00Z",
    "finished_at": null,
    "status": "in_progress",
    "notes": "Felt strong today"
  }
}
```

### GET /api/workout-sessions

Status: `Planned`

Query params:

- `from`: optional date
- `to`: optional date
- `status`: optional, one of `in_progress`, `finished`, `cancelled`

Response `200` returns workout session summaries.

### GET /api/workout-sessions/{id}

Status: `Planned`

Response `200`:

```json
{
  "data": {
    "id": "uuid",
    "workout_plan_id": "uuid",
    "workout_plan_name": "Pull Day",
    "started_at": "2026-06-15T08:00:00Z",
    "finished_at": "2026-06-15T09:00:00Z",
    "status": "finished",
    "notes": "Felt strong today",
    "sets": [
      {
        "id": "uuid",
        "exercise_id": "uuid",
        "exercise_name": "Dumbbell curl",
        "set_number": 1,
        "reps": 10,
        "weight_kg": 10,
        "completed": true,
        "created_at": "2026-06-15T08:10:00Z"
      }
    ]
  }
}
```

### POST /api/workout-sessions/{id}/sets

Status: `Planned`

Request:

```json
{
  "exercise_id": "uuid",
  "exercise_name": "Dumbbell curl",
  "set_number": 1,
  "reps": 10,
  "weight_kg": 10,
  "completed": true
}
```

Response `201` returns the created set log.

### PUT /api/workout-sessions/{id}/finish

Status: `Planned`

Request:

```json
{
  "notes": "Finished all sets"
}
```

Response `200` returns the finished session.

### DELETE /api/workout-sessions/{id}

Status: `Planned`

Deletes the workout session and its set logs.

Response `200`:

```json
{ "data": { "success": true } }
```

## Body Measurements

The database table is `body_measurement_logs`. It replaces the earlier `body_weight_logs` naming.

### GET /api/body-measurements

Status: `Planned`

Query params:

- `from`: optional date
- `to`: optional date

Response `200`:

```json
{
  "data": [
    {
      "id": "uuid",
      "weight_kg": 78.5,
      "bmi": 25.63,
      "body_fat_percentage": 18.5,
      "neck_cm": 38,
      "shoulder_cm": 116,
      "chest_cm": 100,
      "waist_cm": 84,
      "belly_cm": 88,
      "hips_cm": 96,
      "left_bicep_cm": 34,
      "right_bicep_cm": 34,
      "left_forearm_cm": 29,
      "right_forearm_cm": 29,
      "left_thigh_cm": 56,
      "right_thigh_cm": 56,
      "left_calf_cm": 38,
      "right_calf_cm": 38,
      "notes": "Morning measurement",
      "log_date": "2026-06-15",
      "created_at": "2026-06-15T00:00:00Z",
      "updated_at": "2026-06-15T00:00:00Z"
    }
  ]
}
```

### POST /api/body-measurements

Status: `Planned`

Request:

```json
{
  "weight_kg": 78.5,
  "bmi": 25.63,
  "body_fat_percentage": 18.5,
  "neck_cm": 38,
  "shoulder_cm": 116,
  "chest_cm": 100,
  "waist_cm": 84,
  "belly_cm": 88,
  "hips_cm": 96,
  "left_bicep_cm": 34,
  "right_bicep_cm": 34,
  "left_forearm_cm": 29,
  "right_forearm_cm": 29,
  "left_thigh_cm": 56,
  "right_thigh_cm": 56,
  "left_calf_cm": 38,
  "right_calf_cm": 38,
  "notes": "Morning measurement",
  "log_date": "2026-06-15"
}
```

Response `201` returns the created measurement.

### GET /api/body-measurements/{id}

Status: `Planned`

Response `200` returns one measurement.

### PUT /api/body-measurements/{id}

Status: `Planned`

Request accepts the same fields as create.

Response `200` returns the updated measurement.

### DELETE /api/body-measurements/{id}

Status: `Planned`

Response `200`:

```json
{ "data": { "success": true } }
```

## Progress And Dashboard

### GET /api/dashboard

Status: `Planned`

Response `200`:

```json
{
  "data": {
    "date": "2026-06-15",
    "habits": {
      "total": 5,
      "completed": 3,
      "completion_rate": 60
    },
    "workouts": {
      "completed_this_week": 4,
      "current_streak": 3,
      "scheduled_today": {
        "id": "uuid",
        "name": "Pull Day"
      }
    },
    "body": {
      "latest_weight_kg": 78.5,
      "weight_change_30_days": -1.5,
      "latest_body_fat_percentage": 18.5
    }
  }
}
```

### GET /api/progress/habits

Status: `Planned`

Query params:

- `from`: required date
- `to`: required date

Response `200` returns habit completion chart data.

### GET /api/progress/workouts

Status: `Planned`

Query params:

- `from`: required date
- `to`: required date

Response `200` returns workout count and duration chart data.

### GET /api/progress/body-measurements

Status: `Planned`

Query params:

- `from`: required date
- `to`: required date
- `metric`: optional, for example `weight_kg`, `bmi`, `body_fat_percentage`, `waist_cm`

Response `200` returns body measurement chart data.

### GET /api/progress/exercises

Status: `Planned`

Query params:

- `exercise_name`: optional string
- `exercise_id`: optional UUID
- `from`: optional date
- `to`: optional date

Response `200` returns exercise progression data.

## Database Entity Mapping

Endpoint groups map to database tables like this:

- Auth and users: `users`, `refresh_sessions`
- Habits: `habits`, `habit_logs`
- Workout plans: `workout_plans`, `exercises`
- Workout sessions: `workout_sessions`, `workout_set_logs`
- Body measurements: `body_measurement_logs`

## Notes For Frontend

- Use `access_token` as the Bearer token for protected endpoints.
- Do not send raw passwords; send only `password_encrypted` and `password_alg`.
- Keep `refresh_token` out of logs and client-side analytics.
- Treat planned endpoint shapes as the target contract until backend implementation catches up.
