# Contributing to EduStream

Thank you for your interest in contributing! This guide will help you get started.

## Code of Conduct

By participating, you agree to uphold our [Code of Conduct](CODE_OF_CONDUCT.md).

## How to Contribute

### Reporting Bugs

Before filing a bug report:
- Check the [existing issues](https://github.com/yadavplusshubham/EdustreamCo/issues) to avoid duplicates
- Make sure you can reproduce the issue on the latest `main`

Use the [bug report template](https://github.com/yadavplusshubham/EdustreamCo/issues/new?template=bug_report.md) and include:
- A clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Your environment (OS, Node.js version, browser, etc.)

### Suggesting Features

Use the [feature request template](https://github.com/yadavplusshubham/EdustreamCo/issues/new?template=feature_request.md). Explain the problem you're solving — not just the solution you have in mind.

### Submitting a Pull Request

1. **Fork** the repository and create your branch from `main`:
   ```bash
   git checkout -b feat/your-feature
   # or
   git checkout -b fix/your-bugfix
   ```

2. **Set up the development environment** (see [README.md](README.md#quick-start-local-development))

3. **Make your changes**, keeping these principles in mind:
   - Keep PRs focused — one concern per PR
   - Don't add features or refactors beyond what was asked
   - Follow existing code style (no linter config = match the surrounding code)
   - Don't add unnecessary comments or documentation to unchanged code

4. **Test your changes** manually before submitting

5. **Commit** using [Conventional Commits](https://www.conventionalcommits.org):
   ```
   feat: add playlist import validation
   fix: resolve CORS error on admin login
   docs: update deployment instructions
   chore: bump next.js to 15.1
   ```

6. **Push** and open a Pull Request against `main`

7. Fill in the PR template completely

### PR Review Process

- All PRs require at least one review before merging
- Maintainers may request changes — please respond within 7 days
- Once approved, a maintainer will merge your PR

## Development Setup

See the [Quick Start](README.md#quick-start-local-development) section in the README.

### Project Structure

```
backend/       FastAPI API server
frontend-next/ Next.js 15 app (SSR)
nginx/         Nginx config snippets
```

### Key Conventions

- **Frontend**: `'use client'` on all interactive components; server components for SSR/metadata only
- **Backend**: FastAPI routers, Pydantic models for all request/response bodies
- **Commits**: Conventional Commits format
- **Env vars**: Never commit `.env` files; always provide a `.env.example`

## Questions?

Open a [Discussion](https://github.com/yadavplusshubham/EdustreamCo/discussions) — not an issue — for general questions.
