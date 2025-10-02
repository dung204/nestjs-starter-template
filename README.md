# NestJS Starter Template

A production-ready NestJS template for building modern RESTful APIs.
It provides a clean project structure, recommended libraries, and best practices for development, testing, and deployment.
This template is designed to help you quickly start new backend projects and streamline your workflow.

## 🚀 Key features

- 🚀 **Leveraging the [bunest](https://github.com/dung204/bunest) template** for a fast and efficient development experience with Bun runtime
- 🔒 **Authentication and Authorization** with JWT (JSON Web Token)
- 📂 **File Storage** with MinIO & Bun S3 API
- 🚀 **Deployment** with Docker Compose
- 🎨 **Code formatting & linting** with Biome
- 🧪 **Testing** with Bun Test API
- 🔄 **CI/CD workflows** with GitHub Actions (currently including testing workflow only)

## 🛠️ Prerequisites

You need to install all of these before continuing:

- [Bun](https://bun.sh/) 1.2.0 or higher
- [Git](https://git-scm.com/)
- [Visual Studio Code](https://code.visualstudio.com/) (highly recommended)
- [Docker & Docker Compose](https://docs.docker.com/get-docker/)

The following tools will be downloaded & started by Docker Compose.

- [MinIO](https://min.io/download)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Redis](https://redis.io/download)

## 🚀 Getting started

1. Clone the repository

```bash
git clone https://github.com/dung204/nestjs-starter-template.git
```

2. Change directory into the project folder

```bash
cd nestjs-starter-template
```

3. Prepare the environment variables by creating the `.env` file. You can copy the content from `.env.example` and modify it as needed.

4. Install the dependencies

```bash
bun install --frozen-lockfile
```

6. Start the application

```bash
bun start:dev
```

7. Open `http://localhost:${APP_PORT}/api/v1/docs` to see the OpenAPI documentation of this REST API, where `${APP_PORT}` is the port number defined in your `.env` file.

## 📦 Libraries (dependencies)

Core libraries:

- [Bun](https://bun.sh/): a fast all-in-one TypeScript/JavaScript toolkit that includes a runtime, package manager, and bundler
- [NestJS](https://nestjs.com/): progressive Node.js framework for building efficient, reliable, and scalable server-side applications
- [TypeORM](https://typeorm.io/): ORM for TypeScript and JavaScript
- [Passport](http://www.passportjs.org/): authentication middleware for Node.js
- [JWT](https://jwt.io/): JSON Web Token for authentication

---

Formatters & Linters & Misc. tools:

- [Biome](https://biomejs.dev/): an all-in-one code linter and formatter
- [lint-staged](https://github.com/okonet/lint-staged): run linters on pre-committed files
- [commitlint](https://commitlint.js.org/#/): lint commit messages
