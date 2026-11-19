import { useEffect, useState } from 'react';
import CineApiService from '../../services/api';

export default function Cartelera({ agregarAlCarrito }) {
  const [peliculas, setPeliculas] = useState([]);
  const [salas, setSalas] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');
  const [peliculaSeleccionada, setPeliculaSeleccionada] = useState(null);

  // Estados para selección de sala, horario y sillas reales desde PostgreSQL
  const [peliculaSillas, setPeliculaSillas] = useState(null);
  const [salaSeleccionada, setSalaSeleccionada] = useState(null);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState('4:30 PM');
  const [sillasOcupadas, setSillasOcupadas] = useState([]);
  const [sillasSeleccionadas, setSillasSeleccionadas] = useState([]);
  const [cargandoSillas, setCargandoSillas] = useState(false);

  const filas = ['A', 'B', 'C', 'D'];
  const columnas = [1, 2, 3, 4, 5, 6];

  useEffect(() => {
    CineApiService.obtenerPeliculas()
      .then(res => setPeliculas(res.data))
      .catch(err => console.error('Error cargando cartelera:', err));

    CineApiService.obtenerSalas()
      .then(res => {
        setSalas(res.data);
        if (res.data.length > 0) {
          setSalaSeleccionada(res.data[0]);
        }
      })
      .catch(err => console.error('Error cargando salas:', err));
  }, []);

  // Consultar sillas ocupadas en PostgreSQL cada vez que cambia película, sala u horario
  useEffect(() => {
    if (peliculaSillas && salaSeleccionada && horarioSeleccionado) {
      setCargandoSillas(true);
      CineApiService.obtenerSillasOcupadas(
        peliculaSillas.id,
        salaSeleccionada.nombre,
        horarioSeleccionado
      )
        .then(res => {
          setSillasOcupadas(res.data);
          setSillasSeleccionadas([]);
        })
        .catch(err => console.error('Error consultando sillas ocupadas:', err))
        .finally(() => setCargandoSillas(false));
    }
  }, [peliculaSillas, salaSeleccionada, horarioSeleccionado]);

  const peliculasFiltradas = peliculas.filter(p => {
    const coincideEstado =
      filtroEstado === 'Todas' || p.estado.toLowerCase() === filtroEstado.toLowerCase();
    const coincideTitulo = p.titulo.toLowerCase().includes(busqueda.toLowerCase());
    return coincideEstado && coincideTitulo;
  });

  const esProximamente = (estado) => estado && estado.toLowerCase() === 'pronto';

  const abrirSelectorSillas = (peli) => {
    if (esProximamente(peli.estado)) return;
    setPeliculaSeleccionada(null);
    setPeliculaSillas(peli);
    if (salas.length > 0) {
      setSalaSeleccionada(salas[0]);
    }
    setHorarioSeleccionado('4:30 PM');
    setSillasSeleccionadas([]);
  };

  const toggleSilla = (codigoSilla) => {
    if (sillasOcupadas.includes(codigoSilla)) return;
    if (sillasSeleccionadas.includes(codigoSilla)) {
      setSillasSeleccionadas(sillasSeleccionadas.filter(s => s !== codigoSilla));
    } else {
      setSillasSeleccionadas([...sillasSeleccionadas, codigoSilla]);
    }
  };

  const confirmarSillasAlCarrito = () => {
    if (!salaSeleccionada) return;
    if (sillasSeleccionadas.length === 0) {
      alert('Por favor selecciona al menos una silla en el mapa.');
      return;
    }
    const precioUnitario = Number(salaSeleccionada.precio);
    agregarAlCarrito({
      id: `boleta-${peliculaSillas.id}-${Date.now()}`,
      nombre: `Boleta: ${peliculaSillas.titulo} (${salaSeleccionada.nombre} - ${horarioSeleccionado} | Sillas: ${sillasSeleccionadas.join(', ')})`,
      precio: precioUnitario * sillasSeleccionadas.length,
      tipo: 'Boleta',
      reservaSillas: {
        pelicula_id: peliculaSillas.id,
        sala_nombre: salaSeleccionada.nombre,
        horario: horarioSeleccionado,
        sillas: [...sillasSeleccionadas]
      }
    });
    setPeliculaSillas(null);
    setSillasSeleccionadas([]);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem' }}>
      {/* Encabezado, buscador y pestañas de estado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <h2 style={{ color: 'var(--azul-principal)', borderLeft: '5px solid var(--amarillo-principal)', paddingLeft: '0.8rem' }}>
          Cartelera de CineMinuto
        </h2>

        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="🔍 Buscar película..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              padding: '0.55rem 0.9rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              minWidth: '210px',
              fontSize: '0.9rem'
            }}
          />

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {['Todas', 'Disponible', 'Preventa', 'Pronto'].map(estado => (
              <button
                key={estado}
                onClick={() => setFiltroEstado(estado)}
                className={filtroEstado === estado ? 'btn-amarillo' : 'btn-azul'}
              >
                {estado}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cuadrícula de Películas */}
      {peliculasFiltradas.length === 0 ? (
        <div style={{ backgroundColor: 'var(--blanco)', padding: '2.5rem', borderRadius: '10px', textAlign: 'center', color: '#64748b' }}>
          No se encontraron películas que coincidan con tu búsqueda.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.8rem' }}>
          {peliculasFiltradas.map(peli => {
            const bloqueada = esProximamente(peli.estado);

            return (
              <div key={peli.id} style={{ backgroundColor: 'var(--blanco)', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 3px 10px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                <div onClick={() => setPeliculaSeleccionada(peli)} style={{ position: 'relative', cursor: 'pointer' }} title="Ver sinopsis y tráiler">
                  <span style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    backgroundColor: bloqueada ? '#334155' : 'var(--amarillo-principal)',
                    color: bloqueada ? 'var(--blanco)' : 'var(--azul-oscuro)',
                    fontWeight: '800',
                    padding: '3px 10px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase'
                  }}>
                    {peli.estado}
                  </span>
                  <img src={peli.imagen} alt={peli.titulo} style={{ width: '100%', height: '340px', objectFit: 'cover', display: 'block' }} />
                </div>

                <div style={{ padding: '1.2rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 onClick={() => setPeliculaSeleccionada(peli)} style={{ color: 'var(--azul-principal)', fontSize: '1.15rem', marginBottom: '0.4rem', cursor: 'pointer' }}>
                      {peli.titulo}
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>⏱ Duración: {peli.duracion}</p>
                    <p style={{ color: 'var(--azul-oscuro)', fontWeight: '700', margin: '0.8rem 0', fontSize: '0.95rem' }}>
                      {bloqueada ? 'Estreno próximamente' : 'Boletas desde: $15.000'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button className="btn-azul" style={{ width: '100%', fontSize: '0.9rem' }} onClick={() => setPeliculaSeleccionada(peli)}>
                      Ver Sinopsis y Tráiler
                    </button>

                    {bloqueada ? (
                      <button
                        disabled
                        style={{
                          width: '100%',
                          padding: '0.65rem',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: '#e2e8f0',
                          color: '#64748b',
                          fontWeight: '700',
                          cursor: 'not-allowed'
                        }}
                      >
                        ⏳ Próximamente en Cartelera
                      </button>
                    ) : (
                      <button className="btn-amarillo" style={{ width: '100%' }} onClick={() => abrirSelectorSillas(peli)}>
                        🎟 Elegir Sala, Sillas y Comprar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Sinopsis y Tráiler */}
      {peliculaSeleccionada && (
        <div onClick={() => setPeliculaSeleccionada(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 20, 45, 0.78)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'var(--blanco)', borderRadius: '12px', maxWidth: '720px', width: '100%', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.35)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            <img src={peliculaSeleccionada.imagen} alt={peliculaSeleccionada.titulo} style={{ width: '100%', height: '100%', maxHeight: '420px', objectFit: 'cover' }} />
            <div style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <span style={{ backgroundColor: 'var(--amarillo-principal)', color: 'var(--azul-oscuro)', fontWeight: '800', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    {peliculaSeleccionada.estado}
                  </span>
                  <button onClick={() => setPeliculaSeleccionada(null)} style={{ background: 'transparent', border: 'none', fontSize: '1.3rem', fontWeight: 'bold', cursor: 'pointer', color: '#64748b' }}>✕</button>
                </div>
                <h2 style={{ color: 'var(--azul-principal)', margin: '0.8rem 0 0.4rem' }}>{peliculaSeleccionada.titulo}</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>⏱ Duración: {peliculaSeleccionada.duracion}</p>
                <h4 style={{ color: 'var(--azul-oscuro)', marginBottom: '0.4rem' }}>Sinopsis:</h4>
                <p style={{ color: '#334155', lineHeight: '1.5', fontSize: '0.95rem', marginBottom: '1.5rem' }}>{peliculaSeleccionada.sinopsis}</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                <a href={peliculaSeleccionada.trailer_url || 'https://www.youtube.com'} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: '#dc2626', color: 'white', textAlign: 'center', padding: '0.7rem', borderRadius: '6px', textDecoration: 'none', fontWeight: '700' }}>
                  ▶ Ver Tráiler en YouTube
                </a>

                {esProximamente(peliculaSeleccionada.estado) ? (
                  <button
                    disabled
                    style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: 'none', backgroundColor: '#e2e8f0', color: '#64748b', fontWeight: '700', cursor: 'not-allowed' }}
                  >
                    ⏳ Venta no disponible (Próximamente)
                  </button>
                ) : (
                  <button className="btn-amarillo" style={{ width: '100%' }} onClick={() => abrirSelectorSillas(peliculaSeleccionada)}>
                    🎟 Elegir Sala, Sillas y Comprar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Selección de Tipo de Sala, Horario y Sillas Persistentes */}
      {peliculaSillas && salaSeleccionada && (
        <div onClick={() => setPeliculaSillas(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 20, 45, 0.82)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'var(--blanco)', borderRadius: '12px', maxWidth: '560px', width: '100%', padding: '1.8rem', borderTop: '6px solid var(--amarillo-principal)', maxHeight: '92vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
              <h3 style={{ color: 'var(--azul-principal)' }}>Configura tu Entrada</h3>
              <button onClick={() => setPeliculaSillas(null)} style={{ background: 'transparent', border: 'none', fontSize: '1.3rem', cursor: 'pointer' }}>✕</button>
            </div>

            <p style={{ fontWeight: '700', color: 'var(--azul-oscuro)', marginBottom: '1rem' }}>🎬 {peliculaSillas.titulo}</p>

            {/* Selector visual de Tipo de Sala desde PostgreSQL */}
            <label style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--azul-principal)' }}>1. Elige el Tipo de Sala:</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', margin: '0.4rem 0 1rem' }}>
              {salas.map(sala => {
                const activa = salaSeleccionada.id === sala.id;
                return (
                  <div
                    key={sala.id}
                    onClick={() => setSalaSeleccionada(sala)}
                    style={{
                      padding: '0.7rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: activa ? '2px solid var(--azul-principal)' : '1px solid #cbd5e1',
                      backgroundColor: activa ? '#fef9c3' : '#f8fafc'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '0.88rem', color: 'var(--azul-oscuro)' }}>
                      <span>{sala.nombre}</span>
                      <span style={{ color: 'var(--azul-principal)' }}>${Number(sala.precio).toLocaleString()}</span>
                    </div>
                    <p style={{ fontSize: '0.73rem', color: '#475569', marginTop: '3px', lineHeight: '1.3' }}>
                      {sala.descripcion}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Selector de Horario */}
            <div style={{ marginBottom: '1.1rem' }}>
              <label style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--azul-principal)' }}>2. Horario de Función:</label>
              <select
                value={horarioSeleccionado}
                onChange={(e) => setHorarioSeleccionado(e.target.value)}
                style={{ width: '100%', padding: '0.55rem', marginTop: '0.3rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                <option value="2:00 PM">2:00 PM (Doblada)</option>
                <option value="4:30 PM">4:30 PM (Subtitulada)</option>
                <option value="7:15 PM">7:15 PM (Doblada)</option>
                <option value="9:45 PM">9:45 PM (Subtitulada)</option>
              </select>
            </div>

            {/* Pantalla del Cine */}
            <div style={{ backgroundColor: 'var(--azul-principal)', color: 'white', textAlign: 'center', padding: '0.35rem', borderRadius: '4px', fontSize: '0.8rem', letterSpacing: '3px', marginBottom: '1rem' }}>
              PANTALLA - {salaSeleccionada.nombre.toUpperCase()}
            </div>

            {/* Cuadrícula de Asientos */}
            {cargandoSillas ? (
              <p style={{ textAlign: 'center', color: '#64748b', margin: '1rem 0' }}>Consultando disponibilidad en sala...</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', alignItems: 'center', marginBottom: '1rem' }}>
                {filas.map(fila => (
                  <div key={fila} style={{ display: 'flex', gap: '0.45rem' }}>
                    {columnas.map(col => {
                      const codigo = `${fila}${col}`;
                      const ocupada = sillasOcupadas.includes(codigo);
                      const seleccionada = sillasSeleccionadas.includes(codigo);
                      return (
                        <button
                          key={codigo}
                          onClick={() => toggleSilla(codigo)}
                          disabled={ocupada}
                          style={{
                            width: '42px',
                            height: '36px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontWeight: '700',
                            fontSize: '0.8rem',
                            cursor: ocupada ? 'not-allowed' : 'pointer',
                            backgroundColor: ocupada ? '#94a3b8' : seleccionada ? 'var(--amarillo-principal)' : '#e2e8f0',
                            color: ocupada ? 'white' : 'var(--azul-oscuro)'
                          }}
                        >
                          {codigo}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}

            {/* Leyenda */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.2rem', fontSize: '0.78rem', marginBottom: '1rem' }}>
              <span>⬜ Disponible</span>
              <span>🟨 Seleccionada</span>
              <span>⬛ Ocupada ({sillasOcupadas.length})</span>
            </div>

            {/* Resumen y Total Dinámico */}
            <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '6px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '700' }}>
              <div style={{ fontSize: '0.88rem' }}>
                <div>Sillas: {sillasSeleccionadas.length > 0 ? sillasSeleccionadas.join(', ') : 'Ninguna'}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  {salaSeleccionada.nombre}: ${Number(salaSeleccionada.precio).toLocaleString()} c/u
                </div>
              </div>
              <span style={{ color: 'var(--azul-principal)', fontSize: '1.1rem' }}>
                Total: ${(sillasSeleccionadas.length * Number(salaSeleccionada.precio)).toLocaleString()}
              </span>
            </div>

            <button className="btn-amarillo" style={{ width: '100%' }} onClick={confirmarSillasAlCarrito}>
              Confirmar Sillas y Agregar al Carrito
            </button>
          </div>
        </div>
      )}
    </div>
  );
}