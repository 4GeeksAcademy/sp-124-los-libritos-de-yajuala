import os
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from flask_admin.theme import Bootstrap4Theme

from api.models_reviews import Review
from api.models import (
    User, Provider, Book, Categorias, Categoria_Libro,
    Cart, CartBook, Delivery, ProviderBook, Address, db
)


class ReviewAdmin(ModelView):
    column_list = ("id", "id_cliente", "id_libro", "puntuacion", "comentario")
    form_columns = ("id_cliente", "id_libro", "puntuacion", "comentario")


class BookAdmin(ModelView):
    column_list = ("id", "titulo", "precio", "proveedores_list")

    def proveedores_list(self, obj):
        if not obj.proveedores:
            return "—"
        return ", ".join(pb.proveedor.nombre for pb in obj.proveedores)


def setup_admin(app):
  
    app.secret_key = os.environ.get('FLASK_APP_KEY', 'sample key')
    admin = Admin(app, name='4Geeks Admin',
                  theme=Bootstrap4Theme(swatch='cerulean'))
  
    for name, obj in inspect.getmembers(models):
        # Verify that the object is a SQLAlchemy model before adding it to the admin.
        if inspect.isclass(obj) and issubclass(obj, db.Model):
            admin.add_view(ModelView(obj, db.session))

    admin.add_view(ModelView(User, db.session))
    admin.add_view(ModelView(Provider, db.session))
    admin.add_view(ReviewAdmin(Review, db.session))
    admin.add_view(ModelView(Book, db.session))
    admin.add_view(BookAdmin(Book, db.session))

    admin.add_view(ModelView(Categorias, db.session))
    admin.add_view(ModelView(Categoria_Libro, db.session))
    admin.add_view(ModelView(Cart, db.session))
    admin.add_view(ModelView(CartBook, db.session))
    admin.add_view(ModelView(Delivery, db.session))
    admin.add_view(ModelView(ProviderBook, db.session))
    admin.add_view(ModelView(Address, db.session))
