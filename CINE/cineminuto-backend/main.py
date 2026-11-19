from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from models import PeliculaModel, SalaModel, SillaModel, ConfiteriaModel, VentaModel, UsuarioModel

app = FastAPI(title="API CineMinuto")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pelicula_repo = PeliculaModel()
sala_repo = SalaModel()
silla_repo = SillaModel()
confiteria_repo = ConfiteriaModel()
venta_repo = VentaModel()
usuario_repo = UsuarioModel()

# ==========================================
# ESQUEMAS DE VALIDACIÓN (PYDANTIC)
# ==========================================

class PeliculaSchema(BaseModel):
    titulo: str
    duracion: str
    estado: str
    imagen: str = ""
    sinopsis: str = "Sinopsis próximamente disponible."
    trailer_url: str = "https://www.youtube.com"

class ConfiteriaSchema(BaseModel):
    nombre: str
    precio: float
    categoria: str

class ReservaSillasSchema(BaseModel):
    pelicula_id: int
    sala_nombre: str
    horario: str
    sillas: List[str]
    usuario_id: int

class CambiarSillaSchema(BaseModel):
    nueva_silla: str

class VentaSchema(BaseModel):
    detalle: str
    total: float
    usuario_id: int

class RegistroSchema(BaseModel):
    nombre: str
    correo: str
    password: str
    rol: str = "cliente"

class LoginSchema(BaseModel):
    correo: str
    password: str

# ==========================================
# RUTAS DE USUARIOS (REGISTRO, LOGIN E HISTORIAL)
# ==========================================

@app.post("/api/usuarios/registro")
def registrar_usuario(datos: RegistroSchema):
    res = usuario_repo.registrar(datos.nombre, datos.correo, datos.password, datos.rol)
    if "error" in res:
        raise HTTPException(status_code=400, detail=res["error"])
    return res

@app.post("/api/usuarios/login")
def iniciar_sesion(datos: LoginSchema):
    usuario = usuario_repo.login(datos.correo, datos.password)
    if not usuario:
        raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")
    return usuario

@app.get("/api/usuarios/{usuario_id}/ventas")
def historial_usuario(usuario_id: int):
    return venta_repo.listar_ventas_por_usuario(usuario_id)

# ==========================================
# RUTAS VISTA PÚBLICO (Cartelera, Salas, Sillas, Confitería y Ventas)
# ==========================================

@app.get("/api/peliculas")
def obtener_peliculas():
    return pelicula_repo.listar_todas()

@app.get("/api/salas")
def obtener_salas():
    return sala_repo.listar_salas()

@app.get("/api/sillas")
def obtener_sillas_ocupadas(pelicula_id: int, sala_nombre: str, horario: str):
    return silla_repo.obtener_ocupadas(pelicula_id, sala_nombre, horario)

@app.post("/api/sillas/reservar")
def reservar_sillas(reserva: ReservaSillasSchema):
    res = silla_repo.reservar_sillas(
        reserva.pelicula_id,
        reserva.sala_nombre,
        reserva.horario,
        reserva.sillas,
        reserva.usuario_id
    )
    if "error" in res:
        raise HTTPException(status_code=409, detail=res["error"])
    return res

@app.get("/api/confiteria")
def obtener_confiteria():
    return confiteria_repo.listar_productos()

@app.post("/api/ventas")
def comprar(venta: VentaSchema):
    if not venta.usuario_id:
        raise HTTPException(status_code=401, detail="Debes iniciar sesión para realizar una compra.")
    return venta_repo.registrar_venta(venta.detalle, venta.total, venta.usuario_id)

# ==========================================
# RUTAS VISTA ADMINISTRADOR (CRUD Películas, Confitería, Reservas y Reportes)
# ==========================================

@app.post("/api/admin/peliculas")
def agregar_pelicula(pelicula: PeliculaSchema):
    return pelicula_repo.crear(
        pelicula.titulo,
        pelicula.duracion,
        pelicula.estado,
        pelicula.imagen,
        pelicula.sinopsis,
        pelicula.trailer_url
    )

@app.put("/api/admin/peliculas/{pelicula_id}")
def editar_pelicula(pelicula_id: int, pelicula: PeliculaSchema):
    return pelicula_repo.actualizar(
        pelicula_id,
        pelicula.titulo,
        pelicula.duracion,
        pelicula.estado,
        pelicula.sinopsis,
        pelicula.trailer_url
    )

@app.delete("/api/admin/peliculas/{pelicula_id}")
def borrar_pelicula(pelicula_id: int):
    return pelicula_repo.eliminar(pelicula_id)

@app.post("/api/admin/confiteria")
def agregar_producto_confiteria(producto: ConfiteriaSchema):
    return confiteria_repo.crear_producto(producto.nombre, producto.precio, producto.categoria)

@app.delete("/api/admin/confiteria/{producto_id}")
def borrar_producto_confiteria(producto_id: int):
    return confiteria_repo.eliminar_producto(producto_id)

@app.get("/api/admin/reservas")
def listar_reservas_sillas():
    return silla_repo.listar_todas_reservas()

@app.put("/api/admin/reservas/{reserva_id}")
def modificar_silla_reservada(reserva_id: int, datos: CambiarSillaSchema):
    res = silla_repo.cambiar_silla(reserva_id, datos.nueva_silla)
    if isinstance(res, dict) and "error" in res:
        raise HTTPException(status_code=409, detail=res["error"])
    return res

@app.delete("/api/admin/reservas/{reserva_id}")
def cancelar_reserva_silla(reserva_id: int):
    return silla_repo.eliminar_reserva(reserva_id)

@app.get("/api/admin/ventas")
def reporte_ventas():
    return venta_repo.listar_ventas()