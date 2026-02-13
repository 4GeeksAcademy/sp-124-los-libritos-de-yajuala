"""add cantidad to provider_book

Revision ID: eb7360bd3161
Revises: 522b329bc25c
Create Date: 2026-02-12 15:52:01.830513

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'eb7360bd3161'
down_revision = '522b329bc25c'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('provider_book', schema=None) as batch_op:
        batch_op.add_column(sa.Column('cantidad', sa.Integer(), nullable=False, server_default='0'))


def downgrade():
    with op.batch_alter_table('provider_book', schema=None) as batch_op:
        batch_op.drop_column('cantidad')
