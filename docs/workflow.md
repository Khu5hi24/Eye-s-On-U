# Request Lifecycle Workflow Guide

This document traces the complete end-to-end request-response lifecycle of **Eye's On U**, detailing how user actions in the browser travel to the backend database and back to the client interface.

---

## The Request Lifecycle

```text
  [ User Interface ]
         |
         | 1. Interacts (e.g., clicks "Complete Task")
         v
  [ React Component ]
         |
         | 2. Triggers Action
         v
  [ Zustand Store ]
         |
         | 3. Invocates API Service Wrapper
         v
  [ Axios API Client ]
         |
         | 4. Attaches JWT Token (Request Interceptor)
         v
  [ Network / HTTP ]
         |
         | 5. Transmits Payload
         v
  [ Express app.ts ]
         |
         | 6. Applies Rate Limiter & Helmet Headers
         v
  [ protect Middleware ]
         |
         | 7. Validates Bearer Token & retrieves User object
         v
  [ Express Routes ]
         |
         | 8. Matches endpoint (e.g. PATCH /tasks/:id/status)
         v
  [ Controller Handler ]
         |
         | 9. Performs Role checks & validation logic
         v
  [ Mongoose Schema ]
         |
         | 10. Runs queries on MongoDB database
         v
  [ Database Write ]
         |
         | 11. Commits transaction
         v
  [ HTTP JSON Response ]
         |
         | 12. Sends HTTP status & JSON payload
         v
  [ Axios Client ]
         |
         | 13. Receives & processes data (Response Interceptor)
         v
  [ Zustand Store ]
         |
         | 14. Updates State tree
         v
  [ React Components ]
         |
         | 15. Re-renders UI (Charts, Heatmap, and Task list update)
         v
  [ User Interface ]
```

---

## Detailed Step-by-Step Breakdown

To illustrate the lifecycle, we will trace the action of an **employee marking a task as completed**:

### Step 1: User Action in Browser
* The user views the Task details in [TasksList.tsx](../frontend/src/components/TasksList.tsx) and clicks the "Complete" checkbox.
* The React component triggers its state event handler, calling the Zustand task store action.

### Step 2: Store Invocation
* Inside [taskStore.ts](../frontend/src/store/taskStore.ts), the `updateTask(id, { status: 'completed' })` method is invoked.
* Since the update contains only a status modification, the store routes the action to `dashboardService.updateTaskStatus(id, 'completed')`.

### Step 3: Axios Transmission
* The API wrapper in [dashboard.service.ts](../frontend/src/services/dashboard.service.ts) triggers the Axios call:
  ```typescript
  updateTaskStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status })
  ```
* The request interceptor in [axios.ts](../frontend/src/lib/axios.ts) retrieves the `accessToken` from `localStorage` and appends it to the header:
  ```http
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
* The request travels over the network to the backend API port (`5000`).

### Step 4: Backend Middleware Stack
* The server in [app.ts](../backend/src/app.ts) receives the request:
  1. **Helmet** checks that standard headers are satisfied.
  2. **Rate Limiting** checks the client IP request quota.
  3. **Body Parser** parses the incoming JSON body.
* The request enters [auth.middleware.ts](../backend/src/middlewares/auth.middleware.ts):
  - Decodes the token using the secret key.
  - Fetches the caller's database profile.
  - Mounts the profile object onto `req.user`.

### Step 5: Routing & Controller Action
* The server matches the path `/api/tasks/:id/status` inside [task.routes.ts](../backend/src/routes/task.routes.ts) and routes to `updateTaskStatus` in [task.controller.ts](../backend/src/controllers/task.controller.ts).
* The controller extracts the parameter status and coordinates access:
  * Since the user is an employee, the database query filters by `assignedTo: req.user._id` to ensure employees can only modify their own tasks.
* Mongoose executes the update query against the MongoDB instance.

### Step 6: Database Write & Response
* MongoDB updates the task status to `completed` and returns the revised document.
* The controller responds with a `200 OK` status and the JSON payload:
  ```json
  { "success": true, "data": { "id": "task-id", "status": "completed", ... } }
  ```

### Step 7: Client Store & View Update
* The frontend Axios response interceptor intercepts the response.
* The Zustand task store receives the updated document, replaces the item in the local `tasks` array, and triggers recalculations:
  * Generates updated dashboard metrics.
  * Re-renders the [DashboardCharts.tsx](../frontend/src/components/DashboardCharts.tsx) pie and bar charts.
  * Re-renders [ProductivityHeatmap.tsx](../frontend/src/components/ProductivityHeatmap.tsx) cells and increments streaks.
* The UI elements update, and a success message appears via the [toast store](../frontend/src/store/toastStore.ts).

---

## Cross-References
* See [Architecture Specifications](./architecture.md) for structural design.
* See [Database Schema](./database.md) to review relationships.
* See [API reference](./api.md) for endpoint URLs.
