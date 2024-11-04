"""Add tier-product association table

Revision ID: 2024_11_05_add_tier_product_association
Revises: 39f3d1d2ebf6
Create Date: 2024-11-05 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '2024_11_05_add_tier_product_association'
down_revision = '39f3d1d2ebf6'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table(
        'tier_product_association',
        sa.Column('tier_id', sa.Integer(), sa.ForeignKey('tiers.id'), primary_key=True),
        sa.Column('product_id', sa.Integer(), sa.ForeignKey('products.id'), primary_key=True)
    )

def downgrade() -> None:
    op.drop_table('tier_product_association') 