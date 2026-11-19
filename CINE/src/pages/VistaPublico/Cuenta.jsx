import { useEffect, useState } from 'react';
import CineApiService from '../../services/api';

export default function Cuenta() {
  const [esRegistro, setEsRegistro] = useState(false);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [usuarioActivo, setUsuarioActivo] = useState(
    JSON.parse(localStorage.getItem('usuarioCineMinuto')) || null
  );
  const [misCompras, setMisCompras] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  const cargarMisCompras = (idUsuario) => {
    if (!idUsuario) return;
    setCargandoHistorial(true);
    CineApiService.obtenerVentasUsuario(idUsuario)
      .then(res => setMisCompras(res.data))
      .catch(err => console.error('Error cargando historial:', err))
      .finally(() => setCargandoHistorial(false));
  };

  useEffect(() => {
    if (usuarioActivo?.id) {
      cargarMisCompras(usuarioActivo.id);
    }
  }, [usuarioActivo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (esRegistro) {
        const rol = correo === 'admins@gmail.com' ? 'admin' : 'cliente';
        res = await CineApiService.registrarUsuario({ nombre, correo, password, rol });
      } else {
        res = await CineApiService.iniciarSesion({ correo, password });
      }
      localStorage.setItem('usuarioCineMinuto', JSON.stringify(res.data));
      setUsuarioActivo(res.data);
    } catch (error) {
      alert(error.response?.data?.detail || 'Error al procesar la solicitud');
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem('usuarioCineMinuto');
    setUsuarioActivo(null);
    setMisCompras([]);
  };

  if (usuarioActivo) {
    return (
      <div style={{ maxWidth: '850px', margin: '2.5rem auto', padding: '0 1.5rem' }}>
        <div style={{ backgroundColor: 'var(--blanco)', padding: '2rem', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderTop: '5px solid var(--azul-principal)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <span style={{ backgroundColor: 'var(--amarillo-principal)', color: 'var(--azul-oscuro)', padding: '3px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>
              Rol: {usuarioActivo.rol}
            </span>
            <h2 style={{ color: 'var(--azul-principal)', margin: '0.6rem 0 0.2rem' }}>¡Hola, {usuarioActivo.nombre}!</h2>
            <p style={{ color: '#64748b' }}>{usuarioActivo.correo}</p>
          </div>
          <button className="btn-azul" onClick={cerrarSesion}>Cerrar Sesión</button>
        </div>

        {/* Historial de Compras y Boletas QR con botón de refresco */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ color: 'var(--azul-principal)', borderLeft: '5px solid var(--amarillo-principal)', paddingLeft: '0.8rem', margin: 0 }}>
            Mis Boletas y Compras ({misCompras.length})
          </h3>
          <button
            className="btn-amarillo"
            style={{ fontSize: '0.85rem', padding: '0.45rem 0.9rem' }}
            onClick={() => cargarMisCompras(usuarioActivo.id)}
            disabled={cargandoHistorial}
          >
            {cargandoHistorial ? 'Actualizando...' : '↻ Actualizar Boletas'}
          </button>
        </div>

        {misCompras.length === 0 ? (
          <div style={{ backgroundColor: 'var(--blanco)', padding: '2rem', borderRadius: '10px', textAlign: 'center', color: '#64748b' }}>
            Aún no tienes compras registradas en tu cuenta.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {misCompras.map(compra => (
              <div key={compra.id} style={{ backgroundColor: 'var(--blanco)', padding: '1.4rem', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderLeft: '6px solid var(--azul-principal)' }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Ticket #{compra.id} • {new Date(compra.fecha).toLocaleString()}
                  </span>
                  <h4 style={{ color: 'var(--azul-oscuro)', margin: '0.4rem 0' }}>{compra.detalle}</h4>
                  <strong style={{ color: 'var(--azul-principal)', fontSize: '1.1rem' }}>
                    Total Pagado: ${Number(compra.total).toLocaleString()}
                  </strong>
                </div>

                {/* Código QR generado automáticamente para entrada a sala */}
                <div style={{ textAlign: 'center' }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=CINEMINUTO-TICKET-${compra.id}`}
                    alt={`QR Ticket ${compra.id}`}
                    style={{ border: '2px solid var(--amarillo-principal)', borderRadius: '6px', padding: '3px' }}
                  />
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px', fontWeight: '700' }}>PASE DIGITAL</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '450px', margin: '3rem auto', padding: '0 1rem' }}>
      <div style={{ backgroundColor: 'var(--blanco)', padding: '2rem', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderTop: '5px solid var(--azul-principal)' }}>
        <h2 style={{ color: 'var(--azul-principal)', textAlign: 'center', marginBottom: '1.5rem' }}>
          {esRegistro ? 'Crear Cuenta CineMinuto' : 'Iniciar Sesión'}
        </h2>
        <form onSubmit={handleSubmit}>
          {esRegistro && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontWeight: '600' }}>Nombre Completo:</label>
              <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required style={{ width: '100%', padding: '0.6rem', marginTop: '0.3rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
          )}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontWeight: '600' }}>Correo:</label>
            <input type="email" value={correo} onChange={e => setCorreo(e.target.value)} required style={{ width: '100%', padding: '0.6rem', marginTop: '0.3rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontWeight: '600' }}>Contraseña:</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '0.6rem', marginTop: '0.3rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>
          <button type="submit" className="btn-amarillo" style={{ width: '100%', fontSize: '1rem' }}>
            {esRegistro ? 'Registrarme' : 'Ingresar'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '0.9rem' }}>
          {esRegistro ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
          <span onClick={() => setEsRegistro(!esRegistro)} style={{ color: 'var(--azul-claro)', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}>
            {esRegistro ? 'Inicia sesión aquí' : 'Regístrate aquí'}
          </span>
        </p>
      </div>
    </div>
  );
}