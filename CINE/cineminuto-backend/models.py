import re
from database import Database

class PeliculaModel:
    def __init__(self):
        self.db = Database()

    def listar_todas(self):
        conn = self.db.conectar()
        cur = conn.cursor()
        cur.execute("SELECT * FROM peliculas ORDER BY id DESC;")
        peliculas = cur.fetchall()
        cur.close()
        conn.close()
        return peliculas

    def crear(self, titulo, duracion, estado, imagen="", sinopsis="", trailer_url=""):
        conn = self.db.conectar()
        cur = conn.cursor()
        cur.execute(
            """INSERT INTO peliculas (titulo, duracion, estado, imagen, sinopsis, trailer_url) 
               VALUES (%s, %s, %s, %s, %s, %s) RETURNING *;""",
            (
                titulo,
                duracion,
                estado,
                imagen or "https://via.placeholder.com/300x450?text=CineMinuto",
                sinopsis or "Sinopsis próximamente disponible.",
                trailer_url or "https://www.youtube.com"
            )
        )
        nueva = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        return nueva

    def actualizar(self, pelicula_id, titulo, duracion, estado, sinopsis="", trailer_url=""):
        conn = self.db.conectar()
        cur = conn.cursor()
        cur.execute(
            """UPDATE peliculas 
               SET titulo=%s, duracion=%s, estado=%s, sinopsis=%s, trailer_url=%s 
               WHERE id=%s RETURNING *;""",
            (titulo, duracion, estado, sinopsis, trailer_url, pelicula_id)
        )
        actualizada = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        return actualizada

    def eliminar(self, pelicula_id):
        conn = self.db.conectar()
        cur = conn.cursor()
        cur.execute("DELETE FROM peliculas WHERE id = %s;", (pelicula_id,))
        conn.commit()
        cur.close()
        conn.close()
        return {"mensaje": "Película eliminada"}


class SalaModel:
    def __init__(self):
        self.db = Database()

    def listar_salas(self):
        conn = self.db.conectar()
        cur = conn.cursor()
        cur.execute("SELECT * FROM salas ORDER BY precio ASC;")
        salas = cur.fetchall()
        cur.close()
        conn.close()
        return salas


class SillaModel:
    def __init__(self):
        self.db = Database()

    def obtener_ocupadas(self, pelicula_id, sala_nombre, horario):
        conn = self.db.conectar()
        cur = conn.cursor()
        cur.execute(
            """SELECT silla_codigo FROM sillas_ocupadas 
               WHERE pelicula_id = %s AND sala_nombre = %s AND horario = %s;""",
            (pelicula_id, sala_nombre, horario)
        )
        filas = cur.fetchall()
        cur.close()
        conn.close()
        return [f["silla_codigo"] for f in filas]

    def reservar_sillas(self, pelicula_id, sala_nombre, horario, sillas, usuario_id):
        conn = self.db.conectar()
        cur = conn.cursor()
        try:
            for codigo in sillas:
                cur.execute(
                    """INSERT INTO sillas_ocupadas (pelicula_id, sala_nombre, horario, silla_codigo, usuario_id)
                       VALUES (%s, %s, %s, %s, %s);""",
                    (pelicula_id, sala_nombre, horario, codigo, usuario_id)
                )
            conn.commit()
            return {"mensaje": "Sillas reservadas correctamente"}
        except Exception:
            conn.rollback()
            return {"error": "Una o más sillas seleccionadas ya fueron ocupadas por otro usuario."}
        finally:
            cur.close()
            conn.close()

    def listar_todas_reservas(self):
        conn = self.db.conectar()
        cur = conn.cursor()
        cur.execute("""
            SELECT s.id, s.pelicula_id, p.titulo AS pelicula, s.sala_nombre, s.horario,
                   s.silla_codigo, COALESCE(u.nombre, 'Cliente') AS cliente, s.fecha
            FROM sillas_ocupadas s
            JOIN peliculas p ON s.pelicula_id = p.id
            LEFT JOIN usuarios u ON s.usuario_id = u.id
            ORDER BY s.fecha DESC, s.silla_codigo ASC;
        """)
        reservas = cur.fetchall()
        cur.close()
        conn.close()
        return reservas

    def cambiar_silla(self, reserva_id, nueva_silla):
        conn = self.db.conectar()
        cur = conn.cursor()
        nueva = nueva_silla.upper()
        try:
            cur.execute("""
                SELECT s.pelicula_id, s.usuario_id, s.sala_nombre, s.horario, s.silla_codigo, p.titulo
                FROM sillas_ocupadas s
                JOIN peliculas p ON s.pelicula_id = p.id
                WHERE s.id = %s;
            """, (reserva_id,))
            info = cur.fetchone()
            if not info:
                return {"error": "Reserva no encontrada"}

            cur.execute(
                "UPDATE sillas_ocupadas SET silla_codigo = %s WHERE id = %s RETURNING *;",
                (nueva, reserva_id)
            )
            actualizada = cur.fetchone()

            cur.execute("""
                SELECT silla_codigo FROM sillas_ocupadas
                WHERE pelicula_id = %s AND sala_nombre = %s AND horario = %s AND usuario_id = %s
                ORDER BY silla_codigo ASC;
            """, (info["pelicula_id"], info["sala_nombre"], info["horario"], info["usuario_id"]))
            sillas_actuales = [f["silla_codigo"] for f in cur.fetchall()]
            texto_sillas = ", ".join(sillas_actuales)

            patron_busqueda = f"%{info['titulo']} ({info['sala_nombre']} - {info['horario']}%"
            cur.execute("""
                SELECT id, detalle FROM ventas
                WHERE usuario_id = %s AND detalle LIKE %s
                ORDER BY id DESC LIMIT 1;
            """, (info["usuario_id"], patron_busqueda))
            venta = cur.fetchone()

            if venta:
                encabezado = f"{info['titulo']} ({info['sala_nombre']} - {info['horario']} | Sillas: "
                patron_regex = re.escape(encabezado) + r"[^)]+\)"
                nuevo_detalle = re.sub(patron_regex, f"{encabezado}{texto_sillas})", venta["detalle"], count=1)
                cur.execute("UPDATE ventas SET detalle = %s WHERE id = %s;", (nuevo_detalle, venta["id"]))

            conn.commit()
            return actualizada
        except Exception:
            conn.rollback()
            return {"error": f"La silla {nueva} ya está ocupada en esa misma función."}
        finally:
            cur.close()
            conn.close()

    def eliminar_reserva(self, reserva_id):
        conn = self.db.conectar()
        cur = conn.cursor()
        try:
            # 1. Obtener datos de la reserva antes de borrarla
            cur.execute("""
                SELECT s.pelicula_id, s.usuario_id, s.sala_nombre, s.horario, s.silla_codigo, p.titulo
                FROM sillas_ocupadas s
                JOIN peliculas p ON s.pelicula_id = p.id
                WHERE s.id = %s;
            """, (reserva_id,))
            info = cur.fetchone()

            # 2. Liberar la silla en la tabla sillas_ocupadas
            cur.execute("DELETE FROM sillas_ocupadas WHERE id = %s;", (reserva_id,))

            # 3. Sincronizar el ticket en la tabla ventas
            if info:
                cur.execute("""
                    SELECT silla_codigo FROM sillas_ocupadas
                    WHERE pelicula_id = %s AND sala_nombre = %s AND horario = %s AND usuario_id = %s
                    ORDER BY silla_codigo ASC;
                """, (info["pelicula_id"], info["sala_nombre"], info["horario"], info["usuario_id"]))
                sillas_restantes = [f["silla_codigo"] for f in cur.fetchall()]

                patron_busqueda = f"%{info['titulo']} ({info['sala_nombre']} - {info['horario']}%"
                cur.execute("""
                    SELECT id, detalle FROM ventas
                    WHERE usuario_id = %s AND detalle LIKE %s
                    ORDER BY id DESC LIMIT 1;
                """, (info["usuario_id"], patron_busqueda))
                venta = cur.fetchone()

                if venta:
                    encabezado = f"{info['titulo']} ({info['sala_nombre']} - {info['horario']} | Sillas: "
                    patron_regex = re.escape(encabezado) + r"[^)]+\)"

                    # Si no quedan sillas activas y el ticket solo tenía esa boleta (sin combos adicionales)
                    es_solo_boleta = venta["detalle"].strip().startswith("Boleta:") and "), " not in venta["detalle"]
                    if not sillas_restantes and es_solo_boleta:
                        cur.execute("DELETE FROM ventas WHERE id = %s;", (venta["id"],))
                    else:
                        texto_sillas = ", ".join(sillas_restantes) if sillas_restantes else f"{info['silla_codigo']} [CANCELADA]"
                        nuevo_detalle = re.sub(patron_regex, f"{encabezado}{texto_sillas})", venta["detalle"], count=1)
                        cur.execute("UPDATE ventas SET detalle = %s WHERE id = %s;", (nuevo_detalle, venta["id"]))

            conn.commit()
            return {"mensaje": "Reserva cancelada y silla liberada"}
        finally:
            cur.close()
            conn.close()


class ConfiteriaModel:
    def __init__(self):
        self.db = Database()

    def listar_productos(self):
        conn = self.db.conectar()
        cur = conn.cursor()
        cur.execute("SELECT * FROM confiteria ORDER BY id DESC;")
        productos = cur.fetchall()
        cur.close()
        conn.close()
        return productos

    def crear_producto(self, nombre, precio, categoria):
        conn = self.db.conectar()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO confiteria (nombre, precio, categoria) VALUES (%s, %s, %s) RETURNING *;",
            (nombre, precio, categoria)
        )
        nuevo = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        return nuevo

    def eliminar_producto(self, producto_id):
        conn = self.db.conectar()
        cur = conn.cursor()
        cur.execute("DELETE FROM confiteria WHERE id = %s;", (producto_id,))
        conn.commit()
        cur.close()
        conn.close()
        return {"mensaje": "Producto eliminado"}


class VentaModel:
    def __init__(self):
        self.db = Database()

    def registrar_venta(self, detalle, total, usuario_id):
        conn = self.db.conectar()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO ventas (usuario_id, detalle, total) VALUES (%s, %s, %s) RETURNING *;",
            (usuario_id, detalle, total)
        )
        venta = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        return venta

    def listar_ventas(self):
        conn = self.db.conectar()
        cur = conn.cursor()
        cur.execute("""
            SELECT v.id, v.detalle, v.total, v.fecha, COALESCE(u.nombre, 'Cliente Invitado') AS cliente
            FROM ventas v
            LEFT JOIN usuarios u ON v.usuario_id = u.id
            ORDER BY v.fecha DESC;
        """)
        ventas = cur.fetchall()
        cur.close()
        conn.close()
        return ventas

    def listar_ventas_por_usuario(self, usuario_id):
        conn = self.db.conectar()
        cur = conn.cursor()
        cur.execute(
            "SELECT id, detalle, total, fecha FROM ventas WHERE usuario_id = %s ORDER BY fecha DESC;",
            (usuario_id,)
        )
        ventas = cur.fetchall()
        cur.close()
        conn.close()
        return ventas


class UsuarioModel:
    def __init__(self):
        self.db = Database()

    def registrar(self, nombre, correo, password, rol="cliente"):
        conn = self.db.conectar()
        cur = conn.cursor()
        try:
            cur.execute(
                "INSERT INTO usuarios (nombre, correo, password, rol) VALUES (%s, %s, %s, %s) RETURNING id, nombre, correo, rol;",
                (nombre, correo, password, rol)
            )
            usuario = cur.fetchone()
            conn.commit()
            return usuario
        except Exception:
            conn.rollback()
            return {"error": "El correo ya está registrado"}
        finally:
            cur.close()
            conn.close()

    def login(self, correo, password):
        conn = self.db.conectar()
        cur = conn.cursor()
        cur.execute(
            "SELECT id, nombre, correo, rol FROM usuarios WHERE correo = %s AND password = %s;",
            (correo, password)
        )
        usuario = cur.fetchone()
        cur.close()
        conn.close()
        return usuario