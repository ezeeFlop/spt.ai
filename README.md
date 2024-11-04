# Sponge-Theory.ai

Sponge-Theory.ai is a cutting-edge SaaS portal designed to revolutionize the way individuals and organizations absorb, retain, and apply knowledge. Our platform leverages advanced AI algorithms to optimize learning processes, making information retention as effortless as a sponge absorbing water.

[Edit in StackBlitz next generation editor ⚡️](https://stackblitz.com/~/github.com/ezeeFlop/spt.ai)

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Usage](#usage)
- [Backend API](#backend-api)
- [Contributing](#contributing)
- [License](#license)

## Features

- **AI-Powered Learning Paths**: Customized learning journeys tailored to individual learning styles and goals.
- **Interactive Knowledge Maps**: Visualize complex topics and their interconnections.
- **Spaced Repetition System**: Optimize information retention through scientifically-proven review schedules.
- **Collaborative Learning Spaces**: Create and join study groups for shared learning experiences.
- **Progress Analytics**: Track learning progress with detailed insights and recommendations.
- **Multi-Platform Support**: Access your learning materials anytime, anywhere, on any device.
- **Integration with Popular Learning Resources**: Seamlessly import content from various educational platforms.

## Tech Stack

### Frontend
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3
- **Routing**: React Router DOM 6
- **Authentication**: Clerk
- **Payment Processing**: Stripe.js
- **Icons**: Lucide React
- **Linting and Formatting**: ESLint, Prettier

### Backend
- **Framework**: FastAPI
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Authentication**: Clerk
- **Payment Processing**: Stripe
- **API Documentation**: Swagger UI (via FastAPI)

## Getting Started

To get started with Sponge-Theory.ai, you'll need Node.js (version 14 or later) and npm installed on your machine for the frontend, and Python 3.8+ for the backend.

## Installation

### Frontend

1. Clone the repository:
   ```
   git clone https://github.com/ezeeFlop/spt.ai.git
   cd spt.ai
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the necessary environment variables (refer to `.env.example` for required variables).

### Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment and activate it:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
   ```

3. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Set up the `.env` file in the backend directory with the following variables:
   ```
   PROJECT_NAME="Sponge-Theory.ai API"
   API_V1_STR="/api/v1"
   POSTGRES_SERVER=localhost
   POSTGRES_USER=your_postgres_user
   POSTGRES_PASSWORD=your_postgres_password
   POSTGRES_DB=sponge_theory_db
   CLERK_SECRET_KEY=your_clerk_secret_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```

5. Set up the database:
   ```
   alembic upgrade head
   ```

## Usage

### Frontend

1. Start the development server with hot-reloading:
   ```
   npm run dev
   ```

2. Build for production:
   ```
   npm run build
   ```

3. Locally preview production build:
   ```
   npm run preview
   ```

4. Lint the project:
   ```
   npm run lint
   ```

### Backend

1. Start the backend server:
   ```
   uvicorn main:app --reload
   ```

The API will be available at `http://localhost:8000`. You can access the interactive API documentation at `http://localhost:8000/docs`.

## Backend API

The backend API is built with FastAPI and provides the following endpoints:

- `/api/v1/users`: User management
- `/api/v1/products`: Product management
- `/api/v1/payments`: Payment processing

For detailed API documentation, refer to the Swagger UI at `/docs` when the backend application is running.

### Database Migrations

This project uses Alembic for database migrations. Here are the key commands:

1. Create a new migration:
   ```
   export PYTHONPATH="/Users/cve/GITHUB/spt/spt.ai:$PYTHONPATH"
   cd app
   alembic revision --autogenerate -m "Description of the change"
   ```

2. Apply migrations:
   ```
   alembic upgrade head
   ```

3. Rollback migrations:
   ```
   alembic downgrade -1
   ```

## Contributing

We welcome contributions to Sponge-Theory.ai! Please follow these steps to contribute:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit them: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Submit a pull request

Please ensure your code adheres to our coding standards and includes appropriate tests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

For more information, visit our [official website](https://www.sponge-theory.ai) or contact our support team at support@sponge-theory.ai.

Happy learning with Sponge-Theory.ai! 🧽🧠
