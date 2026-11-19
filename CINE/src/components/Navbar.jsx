import { Link } from 'react-router-dom';

export default function Navbar({ cantidadCarrito = 0 }) {
  return (
    <header style={{ backgroundColor: 'var(--azul-principal)', color: 'var(--blanco)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
      {/* Franja superior informativa */}
      <div style={{ backgroundColor: 'var(--azul-oscuro)', padding: '0.35rem 2.5rem', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
        <span>📍 Estás en: <strong>Bogotá - Sede Universitaria</strong></span>
        <span>🍿 ¡Bienvenido a CineMinuto!</span>
      </div>

      {/* Barra principal */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2.5rem' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ backgroundColor: 'var(--amarillo-principal)', color: 'var(--azul-oscuro)', fontWeight: '900', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '1.3rem' }}>
            CINE
          </span>
          <span style={{ color: 'var(--blanco)', fontWeight: '700', fontSize: '1.4rem', letterSpacing: '0.5px' }}>
            MINUTO
          </span>
        </Link>

        <div style={{ display: 'flex', gap: '1.8rem', alignItems: 'center', fontWeight: '500' }}>
          <Link to="/" style={{ color: 'var(--blanco)', textDecoration: 'none' }}>Inicio</Link>
          <Link to="/cartelera" style={{ color: 'var(--blanco)', textDecoration: 'none' }}>Cartelera</Link>
          <Link to="/confiteria" style={{ color: 'var(--blanco)', textDecoration: 'none' }}>Comidas</Link>
          <Link to="/carrito" style={{ color: 'var(--amarillo-principal)', textDecoration: 'none', fontWeight: '700' }}>
            🛒 Carrito ({cantidadCarrito})
          </Link>
          <Link to="/cuenta" style={{ color: 'var(--blanco)', textDecoration: 'none', border: '1px solid var(--blanco)', padding: '0.35rem 0.8rem', borderRadius: '20px', fontSize: '0.9rem' }}>
            Mi Cuenta
          </Link>
          <Link to="/admin" className="btn-amarillo" style={{ textDecoration: 'none', fontSize: '0.9rem' }}>
            Vista Admin
          </Link>
        </div>
      </nav>
    </header>
  );
}