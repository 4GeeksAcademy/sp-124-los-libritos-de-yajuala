from alembic import op
import sqlalchemy as sa

revision = 'add_role_to_user_manual'
down_revision = '18d678b9e3a6'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('user', sa.Column('role', sa.String(length=20), server_default='client', nullable=False))

def downgrade():
    op.drop_column('user', 'role')
