import os
from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import sessionmaker
from alembic.config import Config
from alembic import command
from app.core.config import settings
import alembic.util.exc
import shutil

def backup_versions_directory():
    versions_dir = "alembic/versions"
    backup_dir = "alembic/versions_backup"
    
    if os.path.exists(versions_dir):
        # Create backup directory if it doesn't exist
        os.makedirs(backup_dir, exist_ok=True)
        
        # Move all files to backup
        for file in os.listdir(versions_dir):
            if file.endswith('.py'):
                src = os.path.join(versions_dir, file)
                dst = os.path.join(backup_dir, file)
                shutil.move(src, dst)

def drop_all_tables(engine):
    meta = MetaData()
    meta.reflect(bind=engine)
    meta.drop_all(bind=engine)

def run_alembic_upgrade():
    alembic_cfg = Config("alembic.ini")
    try:
        # First try to stamp the database to a clean state
        print("Attempting to stamp database to base state...")
        command.stamp(alembic_cfg, "base")
    except Exception as e:
        print(f"Failed to stamp database to base state: {e}")
        print("Attempting to continue without stamping...")
    
    try:
        # Then attempt the upgrade
        print("Attempting to upgrade database schema...")
        command.upgrade(alembic_cfg, "head")
    except alembic.util.exc.CommandError as e:
        print(f"Error during migration: {e}")
        print("\nPossible solutions:")
        print("1. Check for duplicate migration files in alembic/versions/")
        print("2. Verify all referenced migrations exist")
        print("3. Consider removing all migrations and creating a fresh initial migration")
        raise

def reset_database():
    # Backup existing migration files
    print("Backing up existing migration files...")
    backup_versions_directory()
    
    # Create a new SQLAlchemy engine
    engine = create_engine(settings.DATABASE_URL)
    
    try:
        # Drop all tables
        print("Dropping all tables...")
        drop_all_tables(engine)
        print("All tables dropped.")

        # Run Alembic migrations to recreate tables
        print("Running Alembic migrations...")
        run_alembic_upgrade()
        print("Database reset complete.")
    except Exception as e:
        print(f"Error resetting database: {e}")
        raise

if __name__ == "__main__":
    reset_database() 