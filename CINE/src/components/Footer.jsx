import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--azul-oscuro)', color: 'var(--blanco)', marginTop: '4rem', borderTop: '5px solid var(--amarillo-principal)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.8rem' }}>
            <span style={{ backgroundColor: 'var(--amarillo-principal)', color: 'var(--azul-oscuro)', fontWeight: '900', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
              CINE
            </span>
            <span style={{ fontWeight: '700', fontSize: '1.2rem' }}>MINUTO</span>
          </div>
          <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Proyecto universitario de gestión cinematográfica. Cartelera, preventas y confitería al alcance de un clic.
          </p>
        </div>

        <div>
          <h4 style={{ color: 'var(--amarillo-principal)', marginBottom: '0.8rem' }}>Navegación</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
            <li><Link to="/" style={{ color: 'var(--blanco)', textDecoration: 'none' }}>Inicio</Link></li>
            <li><Link to="/cartelera" style={{ color: 'var(--blanco)', textDecoration: 'none' }}>Cartelera</Link></li>
            <li><Link to="/confiteria" style={{ color: 'var(--blanco)', textDecoration: 'none' }}>Comidas y Combos</Link></li>
            <li><Link to="/cuenta" style={{ color: 'var(--blanco)', textDecoration: 'none' }}>Mi Cuenta</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: 'var(--amarillo-principal)', marginBottom: '0.8rem' }}>Desarrollado por</h4>
          <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.6' }}>
            Daniel Gutiérrez & Miguel Alaguna<br />
            Ingeniería / Proyecto Universitario<br />
            Bogotá, Colombia
          </p>
        </div>
      </div>

      <div style={{ backgroundColor: '#00152b', textAlign: 'center', padding: '1rem', fontSize: '0.85rem', color: '#94a3b8' }}>
        © 2026 CineMinuto. Todos los derechos reservados.
      </div>
    </footer>
  );
}