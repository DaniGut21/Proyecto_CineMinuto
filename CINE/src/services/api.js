import axios from 'axios';

class CineApiService {
  constructor() {
    this.api = axios.create({
      baseURL: 'http://localhost:8000/api',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // USUARIOS
  async registrarUsuario(datos) {
    return await this.api.post('/usuarios/registro', datos);
  }

  async iniciarSesion(datos) {
    return await this.api.post('/usuarios/login', datos);
  }

  async obtenerVentasUsuario(usuarioId) {
    return await this.api.get(`/usuarios/${usuarioId}/ventas`);
  }

  // VISTAS PÚBLICAS
  async obtenerPeliculas() {
    return await this.api.get('/peliculas');
  }

  async obtenerSalas() {
    return await this.api.get('/salas');
  }

  async obtenerSillasOcupadas(peliculaId, salaNombre, horario) {
    return await this.api.get('/sillas', {
      params: {
        pelicula_id: peliculaId,
        sala_nombre: salaNombre,
        horario: horario
      }
    });
  }

  async reservarSillas(datosReserva) {
    return await this.api.post('/sillas/reservar', datosReserva);
  }

  async obtenerConfiteria() {
    return await this.api.get('/confiteria');
  }

  async registrarVenta(venta) {
    return await this.api.post('/ventas', venta);
  }

  // VISTA ADMINISTRADOR
  async crearPelicula(pelicula) {
    return await this.api.post('/admin/peliculas', pelicula);
  }

  async actualizarPelicula(id, pelicula) {
    return await this.api.put(`/admin/peliculas/${id}`, pelicula);
  }

  async eliminarPelicula(id) {
    return await this.api.delete(`/admin/peliculas/${id}`);
  }

  async crearProductoConfiteria(producto) {
    return await this.api.post('/admin/confiteria', producto);
  }

  async eliminarProductoConfiteria(id) {
    return await this.api.delete(`/admin/confiteria/${id}`);
  }

  async obtenerReservas() {
    return await this.api.get('/admin/reservas');
  }

  async cambiarSillaReserva(reservaId, nuevaSilla) {
    return await this.api.put(`/admin/reservas/${reservaId}`, { nueva_silla: nuevaSilla });
  }

  async cancelarReserva(reservaId) {
    return await this.api.delete(`/admin/reservas/${reservaId}`);
  }

  async obtenerVentas() {
    return await this.api.get('/admin/ventas');
  }
}

export default new CineApiService();