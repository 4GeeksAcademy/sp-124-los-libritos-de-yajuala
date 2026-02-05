from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from .models import db


class Review(db.Model):
    __tablename__ = "review"

    id: Mapped[int] = mapped_column(primary_key=True)

    id_cliente: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    id_libro: Mapped[int] = mapped_column(ForeignKey("book.id"), nullable=False)

    puntuacion: Mapped[int] = mapped_column(Integer, nullable=False)
    comentario: Mapped[str] = mapped_column(String(500), nullable=True)

    def serialize(self):
        return {
            "id": self.id,
            "id_cliente": self.id_cliente,
            "id_libro": self.id_libro,
            "puntuacion": self.puntuacion,
            "comentario": self.comentario
        }
