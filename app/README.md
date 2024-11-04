# Sponge-Theory.ai Backend API

## Database Migrations

This project uses Alembic for database migrations. Here are the key commands:

1. Initialize Alembic (only needed once):   ```
   alembic init alembic   ```

2. Create a new migration:   ```
   alembic revision --autogenerate -m "Description of the change"   ```

3. Apply migrations:   ```
   alembic upgrade head   ```

4. Rollback migrations:   ```
   alembic downgrade -1   ```

For more information on using Alembic, refer to the [Alembic documentation](https://alembic.sqlalchemy.org/en/latest/).


## Start uvicorn server (API)

```
source ./app/.venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```


