"""merge branches

Revision ID: bc9a064a514a
Revises: 0f20f7e9c9f6, add_role_to_user_manual
Create Date: 2026-02-06 22:55:30.643245

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'bc9a064a514a'
down_revision = ('0f20f7e9c9f6', 'add_role_to_user_manual')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
