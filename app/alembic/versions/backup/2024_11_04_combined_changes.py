"""combined changes for user language and blog posts

Revision ID: 2024_11_04_combined_changes
Revises: 06734443f49e
Create Date: 2024-11-04 11:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '2024_11_04_combined_changes'
down_revision: Union[str, None] = '06734443f49e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Add language column to users
    op.add_column('users', sa.Column('language', sa.String(length=10), nullable=True))
    op.execute("UPDATE users SET language = 'en' WHERE language IS NULL")
    op.alter_column('users', 'language',
                    existing_type=sa.String(length=10),
                    nullable=False)

    # Create blog_posts table
    op.create_table(
        'blog_posts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('slug', sa.String(length=255), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('description', sa.String(length=500), nullable=False),
        sa.Column('image_url', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), 
                 server_onupdate=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('author_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['author_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    op.create_index(op.f('ix_blog_posts_slug'), 'blog_posts', ['slug'], unique=True)
    op.create_index(op.f('ix_blog_posts_title'), 'blog_posts', ['title'], unique=False)
    op.create_index(op.f('ix_blog_posts_created_at'), 'blog_posts', ['created_at'], unique=False)

def downgrade() -> None:
    # Drop blog_posts table and indexes
    op.drop_index(op.f('ix_blog_posts_created_at'), table_name='blog_posts')
    op.drop_index(op.f('ix_blog_posts_title'), table_name='blog_posts')
    op.drop_index(op.f('ix_blog_posts_slug'), table_name='blog_posts')
    op.drop_table('blog_posts')
    
    # Drop language column from users
    op.drop_column('users', 'language') 