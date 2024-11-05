import sys
import argparse
from sqlalchemy.orm import Session
from app.db.session import SessionLocal

# Import models in correct order
from app.models.tier import Tier  # Import Tier first
from app.models.user import User  # Then import User
from app.models.blog import BlogPost  # Then other models
from app.models.payment import Payment
from app.models.product import Product

def set_user_as_admin(email: str, db: Session) -> bool:
    """
    Set a user's role to admin based on their email address
    Returns True if successful, False if user not found
    """
    user = db.query(User).filter(User.email == email).first()
    print(user)
    if not user:
        return False
    
    user.role = "admin"
    db.commit()
    return True

def list_users(db: Session) -> None:
    """List all users and their roles"""
    users = db.query(User).all()
    print("\nUser List:")
    print("-" * 50)
    print(f"{'Email':<30} | {'Role':<10}")
    print("-" * 50)
    for user in users:
        print(f"{user.email:<30} | {user.role:<10}")

def main():
    parser = argparse.ArgumentParser(description='Manage user admin roles')
    parser.add_argument('--list', action='store_true', help='List all users')
    parser.add_argument('email', nargs='?', help='Email of the user to make admin')
    
    args = parser.parse_args()
    db = SessionLocal()
    
    try:
        if args.list:
            list_users(db)
            return

        if not args.email:
            parser.print_help()
            sys.exit(1)
            
        if set_user_as_admin(args.email, db):
            print(f"Successfully set user with email {args.email} as admin")
        else:
            print(f"No user found with email {args.email}")
            sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    main() 