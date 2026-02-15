from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column
from .models import db


class Book(db.Model):
    __tablename__ = "book"

    id: Mapped[int] = mapped_column(primary_key=True)
    titulo: Mapped[str] = mapped_column(String(255), nullable=False)
    autor: Mapped[str] = mapped_column(String(255), nullable=False)
    precio: Mapped[float] = mapped_column(db.Float, nullable=False)
    isbn: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "titulo": self.titulo,
            "autor": self.autor,
            "precio": self.precio,
            "isbn": self.isbn
        }

    def __repr__(self):
        return f'{self.titulo}'