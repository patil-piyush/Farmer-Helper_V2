# Known Bugs / Quirks (observed, not fixed)

- **Frontend Dockerfile**: runs `npm run build` then serves via `npm run dev --host`.
  The build step is redundant since dev mode uses source files, not the `dist/` bundle.
  The commented-out `serve` block at the bottom was likely the intended prod approach.

- **Backend CORS origin hardcoded**: `server.js` line 24 has the EC2 IP `16.192.130.100`
  hardcoded. If the instance is re-created with a new IP, CORS will block requests.
  Should be an env var.

- **`models/User.js` uses Mongoose but app uses DynamoDB**: The User model file
  imports mongoose and defines a schema, but the auth controller talks to DynamoDB
  directly. The mongoose model appears unused / dead code.

- **Both `bcrypt` and `bcryptjs` in backend deps**: package.json lists both
  `bcrypt` (native) and `bcryptjs` (pure JS). The controller imports `bcryptjs`.
  The native `bcrypt` package is unused and adds build complexity (needs native compilation).

- **ML service SG open to 0.0.0.0/0**: Port 5001 is exposed publicly in the
  security group, but only the backend calls it. Could be restricted to internal
  traffic only.

- **docker-compose.yml has no healthchecks or restart policy**: Containers won't
  auto-recover on crash. `docker-compose.prod.yml` adds `restart: unless-stopped`
  but not healthchecks.

- **S3 object source path uses relative `../../`**: In `terraform/main.tf` lines
  121-122, the source path for model uploads assumes a specific directory layout
  relative to the terraform dir. Fragile if the repo is cloned elsewhere.

- **ml_services `.env` in `.gitignore` but compose passes AWS creds from root `.env`**:
  The `ml_services/.env` file exists locally but isn't used by docker-compose. Compose
  injects AWS creds via `environment:` from the root `.env`. The local `.env` is only
  used during standalone `python app.py` development.
