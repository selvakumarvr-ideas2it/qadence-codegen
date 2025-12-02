# I2I QA Platform

A modern React application built with TypeScript, Vite, and TailwindCSS for quality assurance workflows.

## 🛠️ Tech Stack

- **React 19.1.0** - Frontend framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and development server
- **TailwindCSS 4.1.11** - Utility-first CSS framework
- **ESLint** - Code linting and quality
- **Prettier** - Code formatting

## 🔧 VSCode Extensions

For the best development experience, install the following VSCode extensions:

### Required Extensions

- **Prettier - Code formatter** (`esbenp.prettier-vscode`) - Auto-formats code on save
- **ESLint** (`dbaeumer.vscode-eslint`) - Provides linting support
- **TypeScript Hero** (optional) - Enhanced TypeScript support

## 🌍 Environment Configuration

Currently, this project does not require any environment variables. All configurations are handled through the build process.

If you need to add environment variables in the future:

1. Create a `.env.local` file in the root directory
2. Add your variables with the `VITE_` prefix (e.g., `VITE_API_URL=https://api.example.com`)
3. Access them in your code using `import.meta.env.VITE_API_URL`

## 🚀 Getting Started

### Prerequisites

- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd i2i-qa-platform
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

### Development

1. **Start the development server:**

   ```bash
   npm run dev
   ```

   This will start the Vite development server, typically at `http://localhost:5173`

2. **Access the application:**
   Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`)

### Available Scripts

- `npm run dev` - Start the development server with hot reload
- `npm run build` - Build the project for production
- `npm run lint` - Run ESLint to check for code issues
- `npm run preview` - Preview the production build locally

### Building for Production

1. **Create a production build:**

   ```bash
   npm run build
   ```

2. **Preview the production build:**
   ```bash
   npm run preview
   ```

The built files will be in the `dist` directory.

## 📝 Code Style & Formatting

This project uses:

- **Prettier** for code formatting (configured in `.prettierrc`)
- **ESLint** for code linting (configured in `eslint.config.js`)
- **VSCode settings** (`.vscode/settings.json`) for consistent editor behavior

Code is automatically formatted on save when using VSCode with the recommended extensions.

## 🏗️ Project Structure

```
i2i-qa-platform/
├── public/              # Static assets
├── src/                 # Source code
│   ├── components/      # Feature-specific components
│   │   ├── auth/        # Authentication related components
│   │   │   ├── LoginForm.tsx
│   │   │   └── SignupForm.tsx
│   │   └── dashboard/   # Dashboard related components
│   │       └── ...
│   │
│   ├── components/shared/  # Reusable UI components
│   │   ├── buttons/      # Button components
│   │   │   ├── Button.tsx
│   │   │   └── IconButton.tsx
│   │   ├── forms/        # Form components
│   │   │   ├── Input.tsx
│   │   │   └── Select.tsx
│   │   ├── layout/       # Layout components
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   └── ui/           # Other UI components
│   │       ├── Card.tsx
│   │       └── Modal.tsx
│   │
│   ├── pages/            # Page components
│   │   ├── auth/         # Authentication pages
│   │   │   ├── Login.tsx
│   │   │   └── Signup.tsx
│   │   ├── dashboard/    # Dashboard pages
│   │   │   └── Dashboard.tsx
│   │   └── Home.tsx      # Home page
│   │
│   ├── routes/           # Route configurations
│   │   ├── ProtectedRoute.tsx
│   │   ├── PublicRoute.tsx
│   │   └── routes.ts     # Route definitions
│   │
│   ├── services/         # API and other services
│   │   ├── api/          # API related services
│   │   │   ├── auth.ts   # Authentication API calls
│   │   │   └── user.ts   # User related API calls
│   │   └── storage/      # Storage services
│   │       └── localStorage.ts
│   │
│   ├── utils/            # Utility functions
│   │   ├── auth.ts       # Authentication utilities
│   │   ├── format.ts     # Formatting utilities
│   │   └── validation.ts # Validation utilities
│   │
│   ├── assets/          # Static assets (images, icons)
│   ├── styles/          # Global styles
│   │   └── globals.css
│   ├── App.tsx          # Main App component
│   └── main.tsx         # Entry point
│
├── .vscode/             # VSCode configuration
├── package.json         # Dependencies and scripts
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # TailwindCSS configuration
├── tsconfig.json        # TypeScript configuration
└── README.md           # Project documentation
```

### 📁 Directory Structure Explanation

- **`components/`**: Feature-specific components
  - Organized by feature/module
  - Each component has its own directory with related files

- **`components/shared/`**: Reusable UI components
  - Common components used across multiple features
  - Organized by component type (buttons, forms, etc.)

- **`pages/`**: Page components
  - Each page is a route in the application
  - Organized by feature/module

- **`routes/`**: Route configurations
  - Route definitions and guards
  - Navigation logic

- **`services/`**: Services
  - API calls and external service integrations
  - Data management services

- **`utils/`**: Utility functions
  - Helper functions and common utilities
  - Shared business logic

## 🤝 Contributing

1. Follow the existing code style and formatting
2. Run `npm run lint` before committing
3. Ensure all TypeScript types are properly defined
4. Use TailwindCSS for styling (avoid custom CSS when possible)

## 📄 License

This project is licensed under the MIT License.
