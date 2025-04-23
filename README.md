# Express Playground

This repository serves as a playground to demonstrate how an Express.js application can be structured for enhanced testability. Key practices include separating concerns (e.g., routes, controllers, services), using dependency injection, and leveraging testing frameworks like Vitest for unit and integration tests.

## Setting Up The Project

#### Prerequisites

- Node.js
- npm
- pnpm

You can check your Node.js and npm versions by running:

```bash
node --version
npm --version
pnpm --version
```

#### 1. Install Dependencies (if not done already through CLI):

```bash
pnpm i
```

#### 3. Setup environment variables:

**copy the `.env.example` file to a new file called `.env`.**

```bash
# Windows
copy .env.example .env

# Mac
cp .env.example .env
```

#### 4. Run Development Server

Finally, run the development server:

```bash
pnpm dev
```

Now you can open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Running Tests

#### Vitest

To run the unit tests with Vitest, run the following command:

```bash
pnpm test
```

## Available Scripts

| Script               | Description                                                                    |
| -------------------- | ------------------------------------------------------------------------------ |
| `pnpm dev`           | Starts the Express development server. Automatically rebuilds on code changes. |
| `pnpm start`         | Runs the previously built application in production mode.                      |
| `pnpm test`          | Runs unit tests with Vitest.                                                   |
| `pnpm test:coverage` | Runs Vitest with coverage enabled.                                             |
| `pnpm lint`          | Runs ESLint to identify and automatically fix linting issues.                  |
| `pnpm format`        | Uses Prettier to format your code according to your project’s style rules.     |
| `pnpm typecheck`     | Runs the TypeScript compiler (`tsc`) in noEmit mode to check for type errors.  |
