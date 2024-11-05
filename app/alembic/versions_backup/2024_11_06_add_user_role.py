"""Add user role

Revision ID: 2024_11_06_add_user_role
Revises: 2024_11_05_add_tier_subscribers_association
Create Date: 2024-11-06 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '2024_11_06_add_user_role'
down_revision = '2024_11_05_add_tier_subscribers_association'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column('users', sa.Column('role', sa.String(), nullable=False, server_default='user'))

def downgrade() -> None:
    op.drop_column('users', 'role') 