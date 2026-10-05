# Booking Policy Frontend Handoff

Backend support for planned store holidays and daily booking capacity.
All calendar dates use `YYYY-MM-DD` and are interpreted as Indian calendar dates.

## Admin Console

### Read settings

`GET /api/admin-settings`

The response now includes:

```json
{
  "storeClosures": [
    {
      "date": "2026-11-08",
      "title": "Closed for Diwali",
      "message": "Our workshop is closed for Diwali. Please select another date."
    }
  ],
  "bookingPolicy": {
    "dailyOrderLimit": 20,
    "limitMessage": "All mechanic slots are full for this date. Please choose another date."
  }
}
```

`dailyOrderLimit: null` means unlimited bookings.

### Save holidays and limit

`PUT /api/admin-settings/booking-policy`

Requires the existing admin authentication. The body replaces the complete closure list when `storeClosures` is supplied:

```json
{
  "storeClosures": [
    {
      "date": "2026-10-20",
      "title": "Closed for Dussehra",
      "message": "We are closed for Dussehra. Please book before or after this date."
    },
    {
      "date": "2026-11-08",
      "title": "Closed for Diwali",
      "message": "Our workshop is closed for Diwali."
    }
  ],
  "dailyOrderLimit": 20,
  "limitMessage": "All mechanic slots are full for this date. Please choose another date."
}
```

The console should provide:

- A date picker and add/remove controls for future closure dates.
- Editable title and customer-facing message per closure.
- A positive integer daily limit, or an empty value for unlimited.
- A limit-reached message.
- A warning when saving replaces the existing closure list.

## User App

### Check one date

`GET /api/admin-settings/booking-availability?date=2026-11-08`

Call this when a user selects a date and again immediately before submitting if desired. Do not rely only on this response; order submission remains authoritative.

Available response:

```json
{
  "success": true,
  "date": "2026-11-08",
  "available": true,
  "code": null,
  "message": null,
  "count": 4,
  "limit": 20
}
```

Closed response:

```json
{
  "success": true,
  "date": "2026-11-08",
  "available": false,
  "code": "STORE_CLOSED",
  "title": "Closed for Diwali",
  "message": "Our workshop is closed for Diwali.",
  "count": 4,
  "limit": 20
}
```

Full response:

```json
{
  "success": true,
  "date": "2026-11-09",
  "available": false,
  "code": "DAILY_LIMIT_REACHED",
  "title": "Bookings full",
  "message": "All mechanic slots are full for this date.",
  "count": 20,
  "limit": 20
}
```

### Booking submission errors

The existing `POST /api/admin/order/userorder` endpoint returns:

- `409` with `code: "STORE_CLOSED"` when the selected date is an admin closure.
- `409` with `code: "DAILY_LIMIT_REACHED"` when the daily limit was reached by another booking.
- `400` with `code: "INVALID_DATE"` for an invalid date.

Show the returned `message` below the date field or in the booking error area, keep the form values, and ask the user to select another date. Do not show a generic payment or network error for these codes.

The same policy is enforced when rescheduling:

- `PUT /api/admin/order/user-reschedule/:id`
- `PUT /api/admin/order/reschedule/:id`

The user app should refresh date availability after a failed reschedule and after returning to the booking screen.

## Suggested UI behavior

1. Disable dates reported as unavailable when the calendar supports disabled dates.
2. If the calendar cannot disable individual dates, allow selection and show the returned message immediately below the date picker.
3. Do not block the whole booking screen for one closed date.
4. Always handle the final `409` response because another customer may take the last available booking between availability check and submit.
5. Display `count` and `limit` only if the product wants to communicate remaining capacity; they are included for admin/debugging and are not required for booking.
