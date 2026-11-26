# Task Manager

A small task manager with two independent applications:

- `backend/` is a Java 21 Spring Boot REST API backed by PostgreSQL.
- `frontend/` is a Next.js and TypeScript web app. Its API route handlers proxy requests to Spring Boot, so the browser only calls the Next.js app.

The applications run directly on your computer; this project does not use containers.

## Prerequisites

- Java 21
- Maven 3.6.3 or newer
- Node.js 20.9 or newer and npm
- PostgreSQL installed and running

## Configure PostgreSQL

Create a local database and user. For example, open `psql` as a PostgreSQL administrator and run:

```sql
CREATE USER task_user WITH PASSWORD 'task_password';
CREATE DATABASE task_manager OWNER task_user;
```

The backend uses these local defaults:

| Environment variable | Default |
| --- | --- |
| `DB_URL` | `jdbc:postgresql://localhost:5432/task_manager` |
| `DB_USERNAME` | `task_user` |
| `DB_PASSWORD` | `task_password` |
| `PORT` | `8080` |

Set different values in your shell before starting the backend, or copy `backend/.env.example` as a reference. Spring Boot does not load `.env` files automatically. The JPA setting `ddl-auto=update` creates or updates the `tasks` table on startup.

## Start the backend

From the `backend/` directory, run:

```bash
mvn spring-boot:run
```

The REST API is available at `http://localhost:8080/api/tasks` by default.

## Start the frontend

In a second terminal, from the `frontend/` directory:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The frontend defaults to a backend at `http://localhost:8080`.

To use a different backend address, set `BACKEND_URL` in the environment before starting Next.js, or create `frontend/.env.local`:

```dotenv
BACKEND_URL=http://localhost:8080
```

`BACKEND_URL` is read only by the server-side Next.js route handlers. Do not prefix it with `NEXT_PUBLIC_`. Browser requests go to the frontend's `/api/tasks` routes; those handlers forward requests to Spring Boot.

## REST API

Tasks have `id`, `title`, `description`, `completed`, and `createdAt` fields. `title` is required (up to 200 characters); `description` is optional (up to 2000 characters). A new task defaults to incomplete.

```text
GET    /api/tasks       List tasks, newest first
GET    /api/tasks/{id}  Get one task
POST   /api/tasks       Create a task
PUT    /api/tasks/{id}  Replace a task's title, description, and completed status
PATCH  /api/tasks/{id}/completion  Update only a task's completed status
DELETE /api/tasks/{id}  Delete a task
```

Example requests against the backend directly:

```bash
curl http://localhost:8080/api/tasks

curl -X POST http://localhost:8080/api/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"Plan the week","description":"Review priorities","completed":false}'

curl -X PUT http://localhost:8080/api/tasks/1 \
  -H 'Content-Type: application/json' \
  -d '{"title":"Plan the week","description":"Review priorities","completed":true}'

curl -X PATCH http://localhost:8080/api/tasks/1/completion \
  -H 'Content-Type: application/json' \
  -d '{"completed":true}'

curl -i -X DELETE http://localhost:8080/api/tasks/1
```

The frontend proxy can also be checked at `http://localhost:3000/api/tasks` while both applications are running.

## Run backend tests

From `backend/`, run:

```bash
mvn test
```

The controller tests use mocked repository calls and do not require a running PostgreSQL database.
