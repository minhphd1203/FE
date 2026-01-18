# Bicycle Marketplace FE

Website kết nối mua bán xe đạp thể thao cũ với UI/UX tương tự Chợ Tốt.

## 🚀 Tech Stack

### Core
- **React 19.1.0** - UI Library
- **TypeScript 5.8.3** - Type Safety
- **Vite 6.3.5** - Build Tool & Dev Server
- **Nx 21.3.2** - Monorepo Management

### State Management
- **Redux Toolkit 2.9.0** - Global State
- **React Query 5.90.2** - Server State & Caching
- **React Hook Form 7.63.0** - Form State

### Routing & UI
- **React Router 7.7.0** - Client Routing
- **Tailwind CSS 4.1.11** - Styling
- **Radix UI** - Headless Components
- **Lucide React** - Icons
- **shadcn/ui** - UI Components

### Forms & Validation
- **Zod 4.1.11** - Schema Validation
- **@hookform/resolvers** - Form Integration

### API & Auth
- **Axios 1.12.2** - HTTP Client
- **Firebase 12.3.0** - Backend Services
- **JWT** - Token Authentication

### Dev Tools
- **ESLint 9.31.0** - Linting
- **Prettier 3.6.2** - Code Formatting
- **Vitest 3.2.4** - Unit Testing
- **Cypress 14.5.2** - E2E Testing
- **Husky 9.1.7** - Git Hooks
- **lint-staged** - Pre-commit Linting

## 📁 Project Structure

```
bicycle-marketplace-fe/
├── apps/
│   ├── fe-react-web/         # Main React app
│   │   └── src/
│   │       ├── apis/         # API clients
│   │       ├── app/          # App entry & dashboard
│   │       ├── components/   # UI components
│   │       │   ├── chart/
│   │       │   ├── chat/
│   │       │   ├── dialog/
│   │       │   ├── form/
│   │       │   ├── layout/
│   │       │   └── ui/
│   │       ├── guards/       # Route guards
│   │       ├── hooks/        # Custom hooks
│   │       ├── pages/        # Page components
│   │       │   ├── admin/
│   │       │   ├── auth/
│   │       │   ├── customer/
│   │       │   └── seller/
│   │       ├── providers/    # Context providers
│   │       ├── redux/        # Redux store
│   │       ├── routes/       # Route configs
│   │       ├── schema/       # Zod schemas
│   │       ├── types/        # TypeScript types
│   │       └── lib/          # Utilities
│   └── mock/                 # Mock API server
└── Config files              # Nx, ESLint, Prettier, etc.
```

## 🛠️ Setup

### Prerequisites
- Node.js 18+
- pnpm 10.15.1+

### Installation

```bash
# Install dependencies
pnpm install

# Setup Husky
pnpm prepare
```

## Run tasks

To run the dev server for your app, use:

```sh
pnpm dev
# or
npx nx serve fe-react-web
```

To create a production bundle:

```sh
pnpm build
# or
npx nx build fe-react-web
```

To see all available targets to run for a project, run:

```sh
npx nx show project fe-react-web
```

These targets are either [inferred automatically](https://nx.dev/concepts/inferred-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) or defined in the `project.json` or `package.json` files.

[More about running tasks in the docs &raquo;](https://nx.dev/features/run-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Add new projects

While you could add new projects to your workspace manually, you might want to leverage [Nx plugins](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) and their [code generation](https://nx.dev/features/generate-code?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) feature.

Use the plugin's generator to create new projects.

To generate a new application, use:

```sh
npx nx g @nx/react:app demo
```

To generate a new library, use:

```sh
npx nx g @nx/react:lib mylib
```

You can use `npx nx list` to get a list of installed plugins. Then, run `npx nx list <plugin-name>` to learn about more specific capabilities of a particular plugin. Alternatively, [install Nx Console](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) to browse plugins and generators in your IDE.

[Learn more about Nx plugins &raquo;](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) | [Browse the plugin registry &raquo;](https://nx.dev/plugin-registry?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Set up CI!

### Step 1

To connect to Nx Cloud, run the following command:

```sh
npx nx connect
```

Connecting to Nx Cloud ensures a [fast and scalable CI](https://nx.dev/ci/intro/why-nx-cloud?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) pipeline. It includes features such as:

- [Remote caching](https://nx.dev/ci/features/remote-cache?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task distribution across multiple machines](https://nx.dev/ci/features/distribute-task-execution?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Automated e2e test splitting](https://nx.dev/ci/features/split-e2e-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task flakiness detection and rerunning](https://nx.dev/ci/features/flaky-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

### Step 2

Use the following command to configure a CI workflow for your workspace:

```sh
npx nx g ci-workflow
```

[Learn more about Nx on CI](https://nx.dev/ci/intro/ci-with-nx#ready-get-started-with-your-provider?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Useful links

Learn more:

- [Learn more about this workspace setup](https://nx.dev/getting-started/tutorials/react-monorepo-tutorial?utm_source=nx_project&amp;utm_medium=readme&amp;utm_campaign=nx_projects)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

And join the Nx community:
- [Discord](https://go.nx.dev/community)
- [Follow us on X](https://twitter.com/nxdevtools) or [LinkedIn](https://www.linkedin.com/company/nrwl)
- [Our Youtube channel](https://www.youtube.com/@nxdevtools)
- [Our blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
