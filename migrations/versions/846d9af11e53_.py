from alembic import op
import sqlalchemy as sa


revision = '846d9af11e53'
down_revision = 'c6b9a46555cf'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('delivery') as batch_op:
        batch_op.add_column(sa.Column('nombre', sa.String(120), nullable=True))
        batch_op.add_column(sa.Column('apellido', sa.String(120), nullable=True))
        batch_op.add_column(sa.Column('identificacion', sa.String(50), nullable=True))
        batch_op.add_column(sa.Column('role', sa.String(20), nullable=True))

    op.execute("""
        UPDATE delivery
        SET nombre = 'pendiente',
            apellido = 'pendiente',
            identificacion = CONCAT('tmp_', id),
            role = 'delivery'
        WHERE nombre IS NULL
    """)

    with op.batch_alter_table('delivery') as batch_op:
        batch_op.alter_column('nombre', nullable=False)
        batch_op.alter_column('apellido', nullable=False)
        batch_op.alter_column('identificacion', nullable=False)
        batch_op.alter_column('role', nullable=False)
        batch_op.create_unique_constraint('uq_delivery_identificacion', ['identificacion'])


def downgrade():
    with op.batch_alter_table('delivery') as batch_op:
        batch_op.drop_constraint('uq_delivery_identificacion', type_='unique')
        batch_op.drop_column('role')
        batch_op.drop_column('identificacion')
        batch_op.drop_column('apellido')
        batch_op.drop_column('nombre')
