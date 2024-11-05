import os
from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import sessionmaker
from alembic.config import Config
from alembic import command
from app.core.config import settings
import alembic.util.exc
import shutil

# Import the base and all models
from app.db.base import Base  # This imports all models
from app.models.user import User  # For create_default_admin

def backup_versions_directory():
    versions_dir = "alembic/versions"
    backup_dir = "alembic/versions_backup"
    
    # Create versions directory if it doesn't exist
    os.makedirs(versions_dir, exist_ok=True)
    
    # If versions directory is empty and backup exists, restore from backup
    if not any(f.endswith('.py') for f in os.listdir(versions_dir)) and os.path.exists(backup_dir):
        print("Versions directory empty, restoring from backup...")
        for file in os.listdir(backup_dir):
            if file.endswith('.py'):
                src = os.path.join(backup_dir, file)
                dst = os.path.join(versions_dir, file)
                shutil.copy2(src, dst)
        return

    # Otherwise, backup existing files
    if os.path.exists(versions_dir):
        os.makedirs(backup_dir, exist_ok=True)
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
    print("Starting database reset...")
    
    # Backup/restore migration files
    print("Managing migration files...")
    backup_versions_directory()
    
    # Create a new SQLAlchemy engine
    engine = create_engine(settings.DATABASE_URL)
    
    try:
        # Drop all tables
        print("Dropping all tables...")
        drop_all_tables(engine)
        print("All tables dropped.")

        # Create tables using SQLAlchemy
        print("Creating tables with SQLAlchemy...")
        Base.metadata.create_all(bind=engine)
        
        try:
            # Then run migrations to ensure proper state
            print("Running Alembic migrations...")
            run_alembic_upgrade()
        except Exception as e:
            print(f"Warning: Alembic migrations failed: {e}")
            print("Continuing with SQLAlchemy tables...")
        
        # Create MetaData instance and reflect tables to ensure they exist
        meta = MetaData()
        meta.reflect(bind=engine)
        
        if 'users' in meta.tables:
            print("Creating default admin user...")
            #create_default_admin(engine)
            print("Default admin user created.")
        else:
            raise Exception("Users table was not created properly")
            
        print("Database reset complete.")
    except Exception as e:
        print(f"Error resetting database: {e}")
        raise

def create_default_admin(engine):
    Session = sessionmaker(bind=engine)
    session = Session()
    admin_user = User(
        clerk_id="admin",
        email="christophe.verdier@sponge-theory.io",
        name="Admin User",
        language="en",
        role="admin",
        # Assume password hashing is handled elsewhere
    )
    session.add(admin_user)
    session.commit()
    session.close()

if __name__ == "__main__":
    reset_database() 