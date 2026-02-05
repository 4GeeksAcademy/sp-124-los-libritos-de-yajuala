from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column



db = SQLAlchemy()


class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    lastname: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(
        Boolean(), default=True, nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "lastname": self.lastname,
            "email": self.email,
        }


class Provider(db.Model):
    __tablename__ = "providers"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    nombre = db.Column(
        db.String(150),
        nullable=False,
        index=True
    )

    email = db.Column(
        db.String(150),
        unique=True,
        nullable=True,
        index=True
    )

    telefono = db.Column(
        db.String(20),
        nullable=True
    )

    password = db.Column(
        db.String(300),
        nullable=False
    )

    documento = db.Column(
        db.String(20),
        unique=True,
        nullable=False,
        index=True
    )

    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "email": self.email,
            "telefono": self.telefono,
            "password": self.password,
            "documento": self.documento
        }


class Categorias(db.Model):
    __tablename__ = "categorias"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    nombre = db.Column(
        db.String(150),
        nullable=False,
        index=True
    )

    descripcion = db.Column(
        db.String(350),
        nullable=False,
        index=True
    )

    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "descripcion": self.descripcion
        }


class Categoria_Libro(db.Model):
    __tablename__ = "categoria_libro"

    categoria_id = db.Column(
        db.Integer,
        db.ForeignKey('categorias.id'),
        primary_key=True  # Marcamos como PK
    )

    libro_id = db.Column(
        db.Integer,
        db.ForeignKey('book.id'),
        primary_key=True  # Marcamos como PK
    )

    categoria = db.relationship("Categorias", backref="relaciones")
    libro = db.relationship("Book", backref="relaciones")

    def serialize(self):
        return {
            "categoria_id": self.categoria_id,
            "libro_id": self.libro_id
        }
