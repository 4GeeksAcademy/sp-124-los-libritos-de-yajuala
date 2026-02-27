from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from werkzeug.security import generate_password_hash, check_password_hash


db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "user"

    id = db.Column(db.Integer, primary_key=True) 
    name = db.Column(db.String(120), nullable=False)
    lastname = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="cliente")

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
    name = db.Column(db.String(120), nullable=False)
    lastname = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    identificacion = db.Column(db.String(50), unique=True, nullable=False)
    role = db.Column(db.String(20), nullable=False, default="delivery")
    password = db.Column(db.String(255), nullable=False)
    is_approved = db.Column(db.Boolean, nullable=False, default=False)

    def set_password(self, raw_password): 
        self.password = generate_password_hash(raw_password) 
        
    def check_password(self, raw_password): 
        return check_password_hash(self.password, raw_password)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "lastname": self.lastname,
            "email": self.email,
            "identificacion": self.identificacion,
            "role": self.role,
            "is_approved": self.is_approved
        }


class Provider(db.Model):
    __tablename__ = "provider"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    name = db.Column(
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

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "telefono": self.telefono,
            "documento": self.documento
        }

    def __repr__(self):
        return f'{self.name}'


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
        db.ForeignKey("user.id", ondelete="CASCADE"),
        nullable=False
    )

    fecha = db.Column(db.DateTime, nullable=False, default=db.func.now())
    monto_total = db.Column(db.Float, nullable=False, default=0.0)
    estado = db.Column(db.String(50), nullable=False, default="pendiente")

    cliente = db.relationship(
        "User",
        backref=db.backref("carritos", cascade="all, delete")
    )

    items = db.relationship(
        "CartBook",
        backref=db.backref("carrito", cascade="all, delete"),
        cascade="all, delete"
    )

    def serialize(self):
        return {
            "id": self.id,
            "id_cliente": self.id_cliente,
            "fecha": self.fecha.isoformat(),
            "monto_total": self.monto_total,
            "estado": self.estado,
            "items": [item.serialize() for item in self.items]
        }


class CartBook(db.Model):
    __tablename__ = "cart_books"

    id = db.Column(db.Integer, primary_key=True)

    id_carrito = db.Column(
        db.Integer,
        db.ForeignKey("carts.id", ondelete="CASCADE"),
        nullable=False
    )

    id_libro = db.Column(
        db.Integer,
        db.ForeignKey("book.id"),
        nullable=False
    )

    provider_book_id = db.Column(
        db.Integer,
        db.ForeignKey("provider_book.id"),
        nullable=False
    )

    cantidad = db.Column(db.Integer, nullable=False, default=1)
    precio = db.Column(db.Float, nullable=False)
    descuento = db.Column(db.Float, nullable=False, default=0.0)

    libro = db.relationship("Book")
    provider_book = db.relationship("ProviderBook")

    def serialize(self):
        return {
            "id": self.id,
            "id_carrito": self.id_carrito,
            "id_libro": self.id_libro,
            "provider_book_id": self.provider_book_id,
            "cantidad": self.cantidad,
            "precio": self.precio,
            "descuento": self.descuento,
            "libro": self.libro.serialize() if self.libro else None
        }


# MODELO ADDRESS
class Address(db.Model):
    __tablename__ = "addresses"

    id = db.Column(db.Integer, primary_key=True)

    id_usuario = db.Column(
        db.Integer,
        db.ForeignKey("user.id", ondelete="CASCADE"),
        nullable=False
    )

    nombre = db.Column(db.String(120), nullable=False)
    direccion = db.Column(db.String(255), nullable=False)
    ciudad = db.Column(db.String(120), nullable=False)
    provincia = db.Column(db.String(120), nullable=False)
    codigo_postal = db.Column(db.String(20), nullable=False)
    telefono = db.Column(db.String(20), nullable=True)
    latitud = db.Column(db.Float, nullable=True)
    longitud = db.Column(db.Float, nullable=True)

    usuario = db.relationship(
        "User",
        backref=db.backref("direcciones", cascade="all, delete")
    )

    def serialize(self):
        return {
            "id": self.id,
            "id_usuario": self.id_usuario,
            "nombre": self.nombre,
            "direccion": self.direccion,
            "ciudad": self.ciudad,
            "provincia": self.provincia,
            "codigo_postal": self.codigo_postal,
            "telefono": self.telefono,
            "latitud": self.latitud,
            "longitud": self.longitud
        }


# MODELO PROVIDERBOOK
class ProviderBook(db.Model):
    __tablename__ = "provider_book"

    id = db.Column(db.Integer, primary_key=True)

    id_proveedor = db.Column(
        db.Integer,
        db.ForeignKey("provider.id"),
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
        default=0
    )

    proveedor = db.relationship("Provider")
    libro = db.relationship(
        "Book",
        backref=db.backref("proveedores", cascade="all, delete-orphan")
    )

    def serialize(self):
        return {
            "id": self.id,
            "id_proveedor": self.id_proveedor,
            "id_libro": self.id_libro,
            "cantidad": self.cantidad,
            "libro": self.libro.serialize() if self.libro else None
        }


class Book(db.Model):
    __tablename__ = "book"

    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(200), nullable=False)
    autor = db.Column(db.String(200), nullable=False)
    isbn = db.Column(db.String(120), unique=True, nullable=False)
    descripcion = db.Column(db.Text, nullable=True)
    portada = db.Column(db.String(300), nullable=True)
    categorias = db.Column(db.String(300), nullable=True)
    fecha_publicacion = db.Column(db.String(20), nullable=True)
    precio = db.Column(db.Float, nullable=False, default=0)

    def serialize(self):
        return {
            "id": self.id,
            "titulo": self.titulo,
            "autor": self.autor,
            "isbn": self.isbn,
            "descripcion": self.descripcion,
            "portada": self.portada,
            "categorias": self.categorias,
            "fecha_publicacion": self.fecha_publicacion,
            "precio": self.precio,
            "proveedores": [
                {
                    "provider_book_id": pb.id,
                    "provider_id": pb.proveedor.id,
                    "name": pb.proveedor.name,
                    "email": pb.proveedor.email,
                    "cantidad": pb.cantidad
                }
                for pb in self.proveedores
            ]
        }


# Shipment - para delivery layla


class Shipment(db.Model):
    __tablename__ = "shipments"

    id = db.Column(db.Integer, primary_key=True)

    cart_id = db.Column(
        db.Integer,
        db.ForeignKey("carts.id"),
        nullable=False,
        unique=True
    )

    address_id = db.Column(
        db.Integer,
        db.ForeignKey("addresses.id"),
        nullable=False
    )

    delivery_id = db.Column(
        db.Integer,
        db.ForeignKey("delivery.id"),
        nullable=True
    )

    status = db.Column(
        db.String(30),
        nullable=False,
        default="unassigned"
    )

    created_at = db.Column(db.DateTime, nullable=False, default=db.func.now())
    updated_at = db.Column(db.DateTime, nullable=False,
                           default=db.func.now(), onupdate=db.func.now())

    cart = db.relationship("Cart")
    address = db.relationship("Address")
    delivery = db.relationship("Delivery")

    def serialize(self):
        return {
            "id": self.id,
            "cart_id": self.cart_id,
            "address_id": self.address_id,
            "delivery_id": self.delivery_id,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class UserBookPreference(db.Model):
    __tablename__ = "user_book_preferences"

    id = db.Column(db.Integer, primary_key=True)

    id_usuario = db.Column(
        db.Integer,
        db.ForeignKey("user.id", ondelete="CASCADE"),
        nullable=False
    )

    id_libro = db.Column(
        db.Integer,
        db.ForeignKey("book.id", ondelete="CASCADE"),
        nullable=False
    )

    preference = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now(), nullable=False)
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now(), nullable=False)

    usuario = db.relationship("User", backref=db.backref("book_preferences", cascade="all, delete"))
    libro = db.relationship("Book", backref=db.backref("user_preferences", cascade="all, delete"))

    __table_args__ = (
        db.UniqueConstraint("id_usuario", "id_libro", name="uq_user_book_preference"),
    )

    def serialize(self):
     return {
        "id": self.id,
        "id_usuario": self.id_usuario,
        "id_libro": self.id_libro,
        "preference": self.preference,
        "created_at": self.created_at.isoformat() if self.created_at else None,
        "updated_at": self.updated_at.isoformat() if self.updated_at else None,
    }

class UserCategoryPreference(db.Model):
    __tablename__ = "user_category_preferences"

    id = db.Column(db.Integer, primary_key=True)

    id_usuario = db.Column(
        db.Integer,
        db.ForeignKey("user.id", ondelete="CASCADE"),
        nullable=False
    )

    id_categoria = db.Column(
        db.Integer,
        db.ForeignKey("categorias.id", ondelete="CASCADE"),
        nullable=False
    )

    preference = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now(), nullable=False)
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now(), nullable=False)

    usuario = db.relationship("User", backref=db.backref("category_preferences", cascade="all, delete"))
    categoria = db.relationship("Categorias", backref=db.backref("user_preferences", cascade="all, delete"))

    __table_args__ = (
        db.UniqueConstraint("id_usuario", "id_categoria", name="uq_user_category_preference"),
    )

    def serialize(self):
        return {
            "id": self.id,
            "id_usuario": self.id_usuario,
            "id_categoria": self.id_categoria,
            "preference": self.preference,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
    }

class Author(db.Model):
    __tablename__ = "author"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(200), nullable=False, unique=True, index=True)

    created_at = db.Column(db.DateTime, server_default=db.func.now(), nullable=False)
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now(), nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
    }

class UserAuthorPreference(db.Model):
    __tablename__ = "user_author_preferences"

    id = db.Column(db.Integer, primary_key=True)

    id_usuario = db.Column(
        db.Integer,
        db.ForeignKey("user.id", ondelete="CASCADE"),
        nullable=False
    )

    id_autor = db.Column(
        db.Integer,
        db.ForeignKey("author.id", ondelete="CASCADE"),
        nullable=False
    )

    preference = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now(), nullable=False)
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now(), nullable=False)

    usuario = db.relationship("User", backref=db.backref("author_preferences", cascade="all, delete"))
    autor = db.relationship("Author", backref=db.backref("user_preferences", cascade="all, delete"))

    __table_args__ = (
        db.UniqueConstraint("id_usuario", "id_autor", name="uq_user_author_preference"),
    )

    def serialize(self):
        return {
            "id": self.id,
            "id_usuario": self.id_usuario,
            "id_autor": self.id_autor,
            "preference": self.preference,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
    }

class ChatConversation(db.Model):
    __tablename__ = "chat_conversations"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("user.id", ondelete="CASCADE"),
        nullable=False
    )

    title = db.Column(db.String(255), nullable=True)

    created_at = db.Column(db.DateTime, server_default=db.func.now(), nullable=False)
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now(), nullable=False)

    user = db.relationship("User", backref=db.backref("chat_conversations", cascade="all, delete"))

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

class ChatMessage(db.Model):
    __tablename__ = "chat_messages"

    id = db.Column(db.Integer, primary_key=True)

    conversation_id = db.Column(
        db.Integer,
        db.ForeignKey("chat_conversations.id", ondelete="CASCADE"),
        nullable=False
    )

    sender = db.Column(db.String(20), nullable=False)  # "user" o "bot"
    content = db.Column(db.Text, nullable=False)

    created_at = db.Column(db.DateTime, server_default=db.func.now(), nullable=False)

    conversation = db.relationship("ChatConversation", backref=db.backref("messages", cascade="all, delete"))

    def serialize(self):
        return {
            "id": self.id,
            "conversation_id": self.conversation_id,
            "sender": self.sender,
            "content": self.content,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

class ProveedorNotificacion(db.Model):
    __tablename__ = "proveedor_notificaciones"

    id = db.Column(db.Integer, primary_key=True)
    libro_titulo = db.Column(db.String(255), nullable=False)
    libro_autor = db.Column(db.String(255), nullable=True)
    categoria = db.Column(db.String(255), nullable=True)
    id_usuario = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)

    estado = db.Column(db.String(50), default="pendiente")  # pendiente, visto, aceptado, rechazado

    created_at = db.Column(db.DateTime, server_default=db.func.now(), nullable=False)
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now(), nullable=False)

    usuario = db.relationship("User")
