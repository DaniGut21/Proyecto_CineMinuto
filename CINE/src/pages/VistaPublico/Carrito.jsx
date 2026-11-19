import { useState } from 'react';
import { Link } from 'react-router-dom';
import CineApiService from '../../services/api';

export default function Carrito({ carrito, eliminarDelCarrito, vaciarCarrito }) {
  const [comprando, setComprando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');

  const usuarioActivo = JSON.parse(localStorage.getItem('usuarioCineMinuto')) || null;
  const total = carrito.reduce((acc, item) => acc + item.precio, 0);

  const handleFinalizarCompra = async () => {
    if (!usuarioActivo) {
      alert('Debes iniciar sesión o crear una cuenta para finalizar tu pedido.');
      return;
    }
    if (carrito.length === 0) return;

    setComprando(true);
    try {
      // 1. Registrar las sillas ocupadas en PostgreSQL para cada boleta del carrito
      for (const item of carrito) {
        if (item.reservaSillas) {
          await CineApiService.reservarSillas({
            ...item.reservaSillas,
            usuario_id: usuarioActivo.id
          });
        }
      }

      // 2. Registrar la venta general en PostgreSQL
      const resumenDetalle = carrito.map(item => item.nombre).join(', ');
      await CineApiService.registrarVenta({
        detalle: resumenDetalle,
        total: total,
        usuario_id: usuarioActivo.id
      });

      vaciarCarrito();
      setMensajeExito(
        `¡Compra realizada con éxito, ${usuarioActivo.nombre}! Tus sillas quedaron reservadas y tus boletas están en "Mi Cuenta".`
      );
    } catch (error) {
      alert(error.response?.data?.detail || 'Error al procesar la compra o reservar las sillas.');
    } finally {
      setComprando(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h2 style={{ color: 'var(--azul-principal)', borderLeft: '5px solid var(--amarillo-principal)', paddingLeft: '0.8rem' }}>
          Tu Carrito de Compras
        </h2>
        <span style={{ fontSize: '0.9rem', color: 'var(--azul-oscuro)', fontWeight: '600' }}>
          Usuario: <strong>{usuarioActivo ? usuarioActivo.nombre : 'No autenticado'}</strong>
        </span>
      </div>

      {mensajeExito && (
        <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: '600' }}>
          ✅ {mensajeExito}
        </div>
      )}

      {carrito.length === 0 ? (
        <div style={{ backgroundColor: 'var(--blanco)', padding: '2.5rem', borderRadius: '10px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Aún no has agregado boletas ni combos a tu carrito.</p>
        </div>
      ) : (
        <div style={{ backgroundColor: 'var(--blanco)', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 3px 10px rgba(0,0,0,0.08)' }}>
          {carrito.map((item, index) => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 0', borderBottom: '1px solid var(--borde-suave)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--amarillo-principal)', color: 'var(--azul-oscuro)', padding: '2px 6px', borderRadius: '4px', fontWeight: '700', marginRight: '8px' }}>
                  {item.tipo}
                </span>
                <strong>{item.nombre}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontWeight: '700', color: 'var(--azul-principal)' }}>${item.precio.toLocaleString()}</span>
                <button
                  onClick={() => eliminarDelCarrito(index)}
                  style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}
                >
                  X
                </button>
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '2px solid var(--azul-principal)' }}>
            <span style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--azul-oscuro)' }}>Total a Pagar:</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--azul-principal)' }}>${total.toLocaleString()}</span>
          </div>

          {!usuarioActivo ? (
            <div style={{ marginTop: '1.5rem', padding: '1.2rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ color: '#991b1b', fontWeight: '600', marginBottom: '0.8rem' }}>
                🔒 Debes iniciar sesión o crear una cuenta para confirmar tu compra.
              </p>
              <Link to="/cuenta" className="btn-azul" style={{ textDecoration: 'none', display: 'inline-block' }}>
                Iniciar Sesión o Registrarme
              </Link>
            </div>
          ) : (
            <button
              className="btn-amarillo"
              style={{ width: '100%', marginTop: '1.5rem', fontSize: '1.1rem' }}
              onClick={handleFinalizarCompra}
              disabled={comprando}
            >
              {comprando ? 'Procesando pago y reservando sillas...' : 'Confirmar y Pagar Entradas'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}