## Running the Project with Docker

This project provides a Docker setup for running the Next.js application in a containerized environment. The configuration uses Node.js version `22.13.1-slim` and exposes port `3000` for the web service.

### Requirements
- **Docker** and **Docker Compose** installed on your system.
- The project uses Node.js `22.13.1-slim` as specified in the Dockerfile.
- All dependencies are installed via `npm ci` during the build process.

### Environment Variables
- The application can be configured using environment variables defined in `.env` and `.env.local` files at the project root.
- If you need to pass environment variables to the container, uncomment the `env_file: ./.env` line in `docker-compose.yml`.

### Build and Run Instructions
1. **Build and start the application:**
   ```sh
   docker compose up --build
   ```
   This will build the Docker image for the Next.js app and start the service on port `3000`.

2. **Access the application:**
   Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

### Ports
- **3000**: The Next.js application is exposed on this port.

### Special Configuration
- The Docker setup creates a non-root user (`appuser`) for running the application, improving security.
- The build process uses cache mounts for faster dependency installation.
- If you add a database (e.g., PostgreSQL), update `docker-compose.yml` accordingly and uncomment the relevant sections.

### Notes
- If you modify environment variables, rebuild the containers to apply changes.
- For production deployments, ensure your `.env` files are properly configured and secure.

---

*This section was updated to reflect the latest Docker-based setup for running the project.*
