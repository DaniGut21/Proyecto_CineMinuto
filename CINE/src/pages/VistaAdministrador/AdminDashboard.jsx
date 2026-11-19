import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CineApiService from '../../services/api';

export default function AdminDashboard() {
  const usuarioActivo = JSON.parse(localStorage.getItem('usuarioCineMinuto')) || null;

  // Estados Películas
  const [titulo, setTitulo] = useState('');
  const [duracion, setDuracion] = useState('');
  const [estado, setEstado] = useState('Disponible');
  const [imagen, setImagen] = useState('');
  const [sinopsis, setSinopsis] = useState('');
  const [trailerUrl, setTrailerUrl] = useState('');
  const [peliculas, setPeliculas] = useState([]);

  // Estados Confitería
  const [nombreCombo, setNombreCombo] = useState('');
  const [precioCombo, setPrecioCombo] = useState('');
  const [categoriaCombo, setCategoriaCombo] = useState('Confitería');
  const [productosConfiteria, setProductosConfiteria] = useState([]);

  // Estados Reservas y Ventas
  const [reservas, setReservas] = useState([]);
  const [ventas, setVentas] = useState([]);

  const codigosSillas = [
    'A1', 'A2', 'A3', 'A4', 'A5', 'A6',
    'B1', 'B2', 'B3', 'B4', 'B5', 'B6',
    'C1', 'C2', 'C3', 'C4', 'C5', 'C6',
    'D1', 'D2', 'D3', 'D4', 'D5', 'D6'
  ];

  const cargarDatos = async () => {
    try {
      const [resPelis, resConf, resReservas, resVentas] = await Promise.all([
        CineApiService.obtenerPeliculas(),
        CineApiService.obtenerConfiteria(),
        CineApiService.obtenerReservas(),
        CineApiService.obtenerVentas()
      ]);
      setPeliculas(resPelis.data);
      setProductosConfiteria(resConf.data);
      setReservas(resReservas.data);
      setVentas(resVentas.data);
    } catch (error) {
      console.error('Error cargando panel admin:', error);
    }
  };

  useEffect(() => {
    if (usuarioActivo?.rol === 'admin') {
      cargarDatos();
    }
  }, []);

  if (!usuarioActivo || usuarioActivo.rol !== 'admin') {
    return (
      <div style={{ maxWidth: '500px', margin: '4rem auto', padding: '2rem', backgroundColor: 'var(--blanco)', borderRadius: '10px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderTop: '5px solid #dc2626' }}>
        <h2 style={{ color: '#dc2626', marginBottom: '0.8rem' }}>🔒 Acceso Restringido</h2>
        <p style={{ color: '#475569', marginBottom: '1.5rem' }}>
          Esta sección es exclusiva para los administradores de <strong>CineMinuto</strong>. Por favor inicia sesión con una cuenta de administrador.
        </p>
        <Link to="/cuenta" className="btn-amarillo" style={{ textDecoration: 'none', display: 'inline-block' }}>
          Ir a Iniciar Sesión
        </Link>
      </div>
    );
  }

  const handleAgregarPelicula = async (e) => {
    e.preventDefault();
    await CineApiService.crearPelicula({
      titulo,
      duracion,
      estado,
      imagen,
      sinopsis,
      trailer_url: trailerUrl
    });
    setTitulo('');
    setDuracion('');
    setImagen('');
    setSinopsis('');
    setTrailerUrl('');
    cargarDatos();
  };

  const handleCambiarEstadoPelicula = async (peli, nuevoEstado) => {
    await CineApiService.actualizarPelicula(peli.id, {
      titulo: peli.titulo,
      duracion: peli.duracion,
      estado: nuevoEstado,
      imagen: peli.imagen,
      sinopsis: peli.sinopsis || '',
      trailer_url: peli.trailer_url || ''
    });
    cargarDatos();
  };

  const handleEliminarPelicula = async (id) => {
    if (window.confirm('¿Seguro que deseas quitar esta película de la cartelera?')) {
      await CineApiService.eliminarPelicula(id);
      cargarDatos();
    }
  };

  const handleAgregarCombo = async (e) => {
    e.preventDefault();
    await CineApiService.crearProductoConfiteria({
      nombre: nombreCombo,
      precio: Number(precioCombo),
      categoria: categoriaCombo
    });
    setNombreCombo('');
    setPrecioCombo('');
    cargarDatos();
  };

  const handleEliminarCombo = async (id) => {
    if (window.confirm('¿Eliminar este producto de la confitería?')) {
      await CineApiService.eliminarProductoConfiteria(id);
      cargarDatos();
    }
  };

  const handleCambiarSilla = async (reservaId, nuevaSilla) => {
    try {
      await CineApiService.cambiarSillaReserva(reservaId, nuevaSilla);
      cargarDatos();
    } catch (error) {
      alert(error.response?.data?.detail || 'No se pudo cambiar la silla.');
    }
  };

  const handleCancelarReserva = async (reserva) => {
    if (window.confirm(`¿Cancelar la reserva de la silla ${reserva.silla_codigo} para "${reserva.pelicula}" (${reserva.cliente}) y dejarla libre nuevamente?`)) {
      await CineApiService.cancelarReserva(reserva.id);
      cargarDatos();
    }
  };

  const totalRecaudado = ventas.reduce((sum, v) => sum + Number(v.total), 0);

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ color: 'var(--azul-principal)', borderLeft: '5px solid var(--amarillo-principal)', paddingLeft: '0.8rem' }}>
          Panel de Control - Administrador CineMinuto
        </h2>
        <span style={{ backgroundColor: 'var(--azul-principal)', color: 'var(--blanco)', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem' }}>
          Admin: <strong>{usuarioActivo.nombre}</strong>
        </span>
      </div>

      {/* SECCIÓN 1: GESTIÓN DE PELÍCULAS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
        <form onSubmit={handleAgregarPelicula} style={{ backgroundColor: 'var(--blanco)', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 3px 10px rgba(0,0,0,0.08)', borderTop: '5px solid var(--amarillo-principal)' }}>
          <h3 style={{ color: 'var(--azul-principal)', marginBottom: '1rem' }}>Agregar Nueva Película</h3>
          
          <div style={{ marginBottom: '0.8rem' }}>
            <label style={{ fontWeight: '600' }}>Título de la Película:</label>
            <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} required placeholder="Ej: Yo Soy Rocky" style={{ width: '100%', padding: '0.55rem', marginTop: '0.3rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>

          <div style={{ marginBottom: '0.8rem' }}>
            <label style={{ fontWeight: '600' }}>Duración:</label>
            <input type="text" value={duracion} onChange={e => setDuracion(e.target.value)} required placeholder="Ej: 2h 08m" style={{ width: '100%', padding: '0.55rem', marginTop: '0.3rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>

          <div style={{ marginBottom: '0.8rem' }}>
            <label style={{ fontWeight: '600' }}>Estado:</label>
            <select value={estado} onChange={e => setEstado(e.target.value)} style={{ width: '100%', padding: '0.55rem', marginTop: '0.3rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
              <option value="Disponible">Disponible</option>
              <option value="Preventa">Preventa</option>
              <option value="Pronto">Pronto</option>
            </select>
          </div>

          <div style={{ marginBottom: '0.8rem' }}>
            <label style={{ fontWeight: '600' }}>URL de la Imagen (Póster):</label>
            <input type="url" value={imagen} onChange={e => setImagen(e.target.value)} placeholder="https://ejemplo.com/poster.jpg" style={{ width: '100%', padding: '0.55rem', marginTop: '0.3rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>

          <div style={{ marginBottom: '0.8rem' }}>
            <label style={{ fontWeight: '600' }}>Link del Tráiler (YouTube):</label>
            <input type="url" value={trailerUrl} onChange={e => setTrailerUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." style={{ width: '100%', padding: '0.55rem', marginTop: '0.3rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>

          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ fontWeight: '600' }}>Sinopsis:</label>
            <textarea rows="3" value={sinopsis} onChange={e => setSinopsis(e.target.value)} placeholder="Escribe de qué trata la película..." style={{ width: '100%', padding: '0.55rem', marginTop: '0.3rem', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'vertical' }} />
          </div>

          <button type="submit" className="btn-azul" style={{ width: '100%' }}>
            + Guardar en Cartelera
          </button>
        </form>

        <div style={{ backgroundColor: 'var(--blanco)', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 3px 10px rgba(0,0,0,0.08)', borderTop: '5px solid var(--azul-principal)' }}>
          <h3 style={{ color: 'var(--azul-principal)', marginBottom: '1rem' }}>Películas en Cartelera ({peliculas.length})</h3>
          <div style={{ maxHeight: '490px', overflowY: 'auto' }}>
            {peliculas.map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem', borderBottom: '1px solid var(--borde-suave)', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <img src={p.imagen} alt={p.titulo} style={{ width: '45px', height: '65px', objectFit: 'cover', borderRadius: '4px' }} />
                  <div>
                    <strong style={{ color: 'var(--azul-oscuro)' }}>{p.titulo}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{p.duracion}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <select
                    value={p.estado}
                    onChange={(e) => handleCambiarEstadoPelicula(p, e.target.value)}
                    style={{ padding: '0.3rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8rem', fontWeight: '600', color: 'var(--azul-principal)' }}
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="Preventa">Preventa</option>
                    <option value="Pronto">Pronto</option>
                  </select>

                  <button
                    onClick={() => handleEliminarPelicula(p.id)}
                    style={{ background: '#dc2626', color: 'white', border: 'none', padding: '0.35rem 0.7rem', borderRadius: '5px', cursor: 'pointer', fontSize: '0.8rem' }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: GESTIÓN DE CONFITERÍA */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
        <form onSubmit={handleAgregarCombo} style={{ backgroundColor: 'var(--blanco)', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 3px 10px rgba(0,0,0,0.08)', borderTop: '5px solid var(--amarillo-principal)' }}>
          <h3 style={{ color: 'var(--azul-principal)', marginBottom: '1rem' }}>Agregar Combo de Confitería</h3>
          <div style={{ marginBottom: '0.8rem' }}>
            <label style={{ fontWeight: '600' }}>Nombre del Combo / Producto:</label>
            <input type="text" value={nombreCombo} onChange={e => setNombreCombo(e.target.value)} required placeholder="Ej: Combo Crispetas y Sushi" style={{ width: '100%', padding: '0.55rem', marginTop: '0.3rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>
          <div style={{ marginBottom: '0.8rem' }}>
            <label style={{ fontWeight: '600' }}>Precio (COP):</label>
            <input type="number" value={precioCombo} onChange={e => setPrecioCombo(e.target.value)} required placeholder="Ej: 32000" style={{ width: '100%', padding: '0.55rem', marginTop: '0.3rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ fontWeight: '600' }}>Categoría:</label>
            <select value={categoriaCombo} onChange={e => setCategoriaCombo(e.target.value)} style={{ width: '100%', padding: '0.55rem', marginTop: '0.3rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
              <option value="Confitería">Confitería</option>
              <option value="Cinepolitana">Cinepolitana</option>
              <option value="Sushi">Sushi</option>
              <option value="Juan Valdez">Juan Valdez</option>
            </select>
          </div>
          <button type="submit" className="btn-amarillo" style={{ width: '100%' }}>
            + Agregar Producto
          </button>
        </form>

        <div style={{ backgroundColor: 'var(--blanco)', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 3px 10px rgba(0,0,0,0.08)', borderTop: '5px solid var(--azul-principal)' }}>
          <h3 style={{ color: 'var(--azul-principal)', marginBottom: '1rem' }}>Menú de Confitería Activo ({productosConfiteria.length})</h3>
          <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
            {productosConfiteria.map(prod => (
              <div key={prod.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.7rem', borderBottom: '1px solid var(--borde-suave)' }}>
                <div>
                  <strong>{prod.nombre}</strong>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{prod.categoria} • <strong>${Number(prod.precio).toLocaleString()}</strong></div>
                </div>
                <button
                  onClick={() => handleEliminarCombo(prod.id)}
                  style={{ background: '#dc2626', color: 'white', border: 'none', padding: '0.35rem 0.7rem', borderRadius: '5px', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: CONTROL DE SILLAS RESERVADAS (MODIFICAR O CANCELAR) */}
      <div style={{ backgroundColor: 'var(--blanco)', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 3px 10px rgba(0,0,0,0.08)', marginBottom: '2.5rem', borderTop: '5px solid var(--amarillo-principal)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ color: 'var(--azul-principal)' }}>Control de Sillas Reservadas ({reservas.length})</h3>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Permite reasignar el asiento de un cliente o liberar la silla si cancela
          </span>
        </div>

        {reservas.length === 0 ? (
          <p style={{ color: '#64748b' }}>No hay sillas reservadas actualmente.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--azul-principal)', color: 'var(--blanco)' }}>
                  <th style={{ padding: '0.75rem' }}>Cliente</th>
                  <th style={{ padding: '0.75rem' }}>Película</th>
                  <th style={{ padding: '0.75rem' }}>Sala y Horario</th>
                  <th style={{ padding: '0.75rem' }}>Silla Asignada</th>
                  <th style={{ padding: '0.75rem' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reservas.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--borde-suave)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '600' }}>{r.cliente}</td>
                    <td style={{ padding: '0.75rem' }}>{r.pelicula}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.88rem' }}>{r.sala_nombre} • {r.horario}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <select
                        value={r.silla_codigo}
                        onChange={(e) => handleCambiarSilla(r.id, e.target.value)}
                        style={{ padding: '0.35rem 0.6rem', borderRadius: '5px', border: '1px solid #cbd5e1', fontWeight: '800', color: 'var(--azul-oscuro)', backgroundColor: '#fef9c3' }}
                      >
                        {codigosSillas.map(cod => (
                          <option key={cod} value={cod}>{cod}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <button
                        onClick={() => handleCancelarReserva(r)}
                        style={{ background: '#dc2626', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '5px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}
                      >
                        Liberar Silla
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECCIÓN 4: REGISTRO DE BOLETAS VENDIDAS */}
      <div style={{ backgroundColor: 'var(--blanco)', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 3px 10px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ color: 'var(--azul-principal)' }}>Registro de Ventas y Boletas Emitidas</h3>
          <span style={{ backgroundColor: 'var(--amarillo-principal)', color: 'var(--azul-oscuro)', padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: '800' }}>
            Total Recaudado: ${totalRecaudado.toLocaleString()}
          </span>
        </div>

        {ventas.length === 0 ? (
          <p style={{ color: '#64748b' }}>Aún no se han registrado compras desde el carrito.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--azul-principal)', color: 'var(--blanco)' }}>
                <th style={{ padding: '0.75rem' }}>ID Venta</th>
                <th style={{ padding: '0.75rem' }}>Cliente</th>
                <th style={{ padding: '0.75rem' }}>Detalle (Boletas / Combos)</th>
                <th style={{ padding: '0.75rem' }}>Total</th>
                <th style={{ padding: '0.75rem' }}>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map(v => (
                <tr key={v.id} style={{ borderBottom: '1px solid var(--borde-suave)' }}>
                  <td style={{ padding: '0.75rem', fontWeight: '700' }}>#{v.id}</td>
                  <td style={{ padding: '0.75rem' }}>{v.cliente || 'Cliente Invitado'}</td>
                  <td style={{ padding: '0.75rem' }}>{v.detalle}</td>
                  <td style={{ padding: '0.75rem', fontWeight: '700', color: 'var(--azul-principal)' }}>${Number(v.total).toLocaleString()}</td>
                  <td style={{ padding: '0.75rem', fontSize: '0.85rem', color: '#64748b' }}>{new Date(v.fecha).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}