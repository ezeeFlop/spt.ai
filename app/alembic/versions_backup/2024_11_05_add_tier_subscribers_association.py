"""Add tier-subscribers association table

Revision ID: 2024_11_05_add_tier_subscribers_association
Revises: 2024_11_05_add_tier_product_association
Create Date: 2024-11-05 11:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '2024_11_05_add_tier_subscribers_association'
down_revision = '2024_11_05_add_tier_product_association'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table(
        'tier_subscribers',
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), primary_key=True),
        sa.Column('tier_id', sa.Integer(), sa.ForeignKey('tiers.id'), primary_key=True)
    )

def downgrade() -> None:
    op.drop_table('tier_subscribers') 