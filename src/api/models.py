from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from werkzeug.security import generate_password_hash, check_password_hash


db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "user"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    lastname: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(200), nullable=False)

    role: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        server_default="client"
    )

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "lastname": self.lastname,
            "email": self.email,
            "role": self.role,
        }


class Delivery(db.Model):
    __tablename__ = "delivery"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(120), nullable=False)
    apellido = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    identificacion = db.Column(db.String(50), unique=True, nullable=False)
    role = db.Column(db.String(20), nullable=False, default="delivery")
    password = db.Column(db.String(200), nullable=False)

    def set_password(self, password):
        self.password = password

    def check_password(self, password):
        return self.password == password

    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "apellido": self.apellido,
            "email": self.email,
            "identificacion": self.identificacion,
            "role": self.role
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
        index=True,
        unique=True
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
        db.ForeignKey("categorias.id"),
        primary_key=True
    )

    libro_id = db.Column(
        db.Integer,
        db.ForeignKey("book.id"),
        primary_key=True
    )

    categoria = db.relationship(
        "Categorias",
        backref=db.backref("categoria_libros", cascade="all, delete-orphan")
    )

    libro = db.relationship(
        "Book",
        backref=db.backref("categoria_libros", cascade="all, delete-orphan")
    )

    def serialize(self):
        return {
            "categoria_id": self.categoria_id,
            "libro_id": self.libro_id
        }


class Cart(db.Model):
    __tablename__ = "carts"

    id = db.Column(db.Integer, primary_key=True)

    id_cliente = db.Column(
        db.Integer,
        db.ForeignKey("user.id"),
        nullable=False
    )

    fecha = db.Column(
        db.DateTime,
        nullable=False,
        default=db.func.now()
    )

    monto_total = db.Column(
        db.Float,
        nullable=False,
        default=0.0
    )

    estado = db.Column(
        db.String(50),
        nullable=False,
        default="pendiente"
    )

    cliente = db.relationship("User", backref="carritos")

    def serialize(self):
        return {
            "id": self.id,
            "id_cliente": self.id_cliente,
            "fecha": self.fecha.isoformat(),
            "monto_total": self.monto_total,
            "estado": self.estado
        }


class CartBook(db.Model):
    __tablename__ = "cart_books"

    id = db.Column(db.Integer, primary_key=True)

    id_carrito = db.Column(
        db.Integer,
        db.ForeignKey("carts.id"),
        nullable=False
    )

    id_libro = db.Column(
        db.Integer,
        db.ForeignKey("book.id"),
        nullable=False
    )

    cantidad = db.Column(
        db.Integer,
        nullable=False,
        default=1
    )

    precio = db.Column(
        db.Float,
        nullable=False
    )

    descuento = db.Column(
        db.Float,
        nullable=False,
        default=0.0
    )

    carrito = db.relationship("Cart", backref="items")
    libro = db.relationship("Book")

    def serialize(self):
        return {
            "id": self.id,
            "id_carrito": self.id_carrito,
            "id_libro": self.id_libro,
            "cantidad": self.cantidad,
            "precio": self.precio,
            "descuento": self.descuento,
            "libro": self.libro.serialize() if self.libro else None
        }
