import os
import inspect
from flask_admin import Admin
from . import models
from .models import db
from flask_admin.contrib.sqla import ModelView
from flask_admin.theme import Bootstrap4Theme
from .models_books import Book
# from api.models import Delivery
from api.models_reviews import Review


class ReviewAdmin(ModelView):
    column_list = ("id", "id_cliente", "id_libro", "puntuacion", "comentario")
    form_columns = ("id_cliente", "id_libro", "puntuacion", "comentario")


def setup_admin(app):
    app.secret_key = os.environ.get('FLASK_APP_KEY', 'sample key')
    admin = Admin(app, name='4Geeks Admin',
                  theme=Bootstrap4Theme(swatch='cerulean'))

    # Dynamically add all models to the admin interface
    for name, obj in inspect.getmembers(models):
        # Verify that the object is a SQLAlchemy model before adding it to the admin.
        if inspect.isclass(obj) and issubclass(obj, db.Model):
            admin.add_view(ModelView(obj, db.session))


    # admin.add_view(ModelView(Delivery, db.session))
    admin.add_view(ReviewAdmin(Review, db.session))


