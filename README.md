# Mini Project Manager

A small project management app. You sign up, create projects, and add tasks to them. Each task has a status (todo, in-progress, done) and a due date, and you can filter and sort the list.

It's a single Next.js app, so the frontend and the REST API run together. Data lives in MySQL on AWS RDS.

## Stack

- Next.js (App Router), React, TypeScript
- Redux Toolkit for state
- Next.js route handlers for the API
- MySQL on AWS RDS, through Sequelize
- JWT auth (stored in an httpOnly cookie)
- Tailwind CSS

## Running it locally

You need Node 20+ and a MySQL database on RDS.

1. Install dependencies

   ```bash
   npm install
   ```

2. Create an empty database on your RDS instance (for example `project_manager`). The instance has to be publicly accessible, and its security group needs to allow port 3306 from your IP.

3. Copy `.env.example` to `.env` and fill it in

   | Variable | What it is |
   | --- | --- |
   | `DB_HOST` | your RDS endpoint |
   | `DB_PORT` | usually `3306` |
   | `DB_NAME` | the database from step 2 |
   | `DB_USER`, `DB_PASSWORD` | database login |
   | `DB_SSL` | `true` by default, set to `false` if your instance doesn't use TLS |
   | `DB_SSL_CA_PATH` | optional, path to the RDS CA bundle if you want the certificate verified |
   | `JWT_SECRET` | any long random string |
   | `JWT_EXPIRES_DAYS` | how long a login lasts, default `7` |

4. Start it

   ```bash
   npm run dev
   ```

   Then open http://localhost:3000.

There's no migration step. The tables (`users`, `projects`, `tasks`) get created automatically the first time the app talks to the database. If you want to check the connection, open `/api/health`.

## API

Everything except signup, login and logout needs the login cookie.

| Method | Route | |
| --- | --- | --- |
| POST | `/api/auth/signup` | create an account |
| POST | `/api/auth/login` | log in |
| POST | `/api/auth/logout` | log out |
| GET | `/api/auth/me` | current user |
| GET, POST | `/api/projects` | list / create projects |
| GET, PATCH, DELETE | `/api/projects/:id` | one project |
| GET, POST | `/api/projects/:id/tasks` | list / create tasks |
| GET, PATCH, DELETE | `/api/projects/:id/tasks/:taskId` | one task |

Listing tasks takes `status` (`todo`, `in-progress`, `done` or `all`), `sortBy` (`createdAt`, `dueDate` or `status`) and `order` (`asc` or `desc`).

## Where I did things differently

I didn't follow the brief exactly, so here's what I changed and why.

- **Next.js for the backend as well.** The project is small, so I didn't set up a separate Express server. The API is built with Next.js route handlers instead. That keeps everything in one app, which is quicker to build and much easier to deploy.
- **MySQL instead of MongoDB.** I already had a SQL database on AWS RDS, so using it was the easiest and fastest option for me. I used Sequelize as the ORM.

