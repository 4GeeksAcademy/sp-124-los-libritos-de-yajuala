"""add precio to book

Revision ID: 18d678b9e3a6
Revises: 967f37c0df42
Create Date: 2026-02-06 11:49:55.962605

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '18d678b9e3a6'
down_revision = '967f37c0df42'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('book', schema=None) as batch_op:
        batch_op.add_column(sa.Column('precio', sa.Float(), server_default=sa.text("0"), nullable=False))


    # ### end Alembic commands ###


def downgrade():
    with op.batch_alter_table('book', schema=None) as batch_op:
        batch_op.drop_column('precio')



    # ### end Alembic commands ###
