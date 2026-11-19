import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CineApiService from '../../services/api';
import CarruselPeliculas from '../../components/CarruselPeliculas';

export default function Home() {
  const [peliculas, setPeliculas] = useState([]);

  useEffect(() => {
    CineApiService.obtenerPeliculas()
      .then(res => setPeliculas(res.data))
      .catch(err => console.error('Error cargando películas:', err));
  }, []);

  return (
    <div>
      {/* Carrusel principal */}
      <CarruselPeliculas peliculas={peliculas} />

      {/* Accesos rápidos estilo Cine Colombia */}
      <section style={{ maxWidth: '1200px', margin: '2.5rem auto', padding: '0 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div style={{ backgroundColor: 'var(--blanco)', borderTop: '5px solid var(--azul-principal)', padding: '1.8rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <span style={{ color: 'var(--azul-claro)', fontWeight: '700', fontSize: '0.8rem' }}>ESTRENOS Y PREVENTAS</span>
          <h3 style={{ color: 'var(--azul-principal)', margin: '0.5rem 0' }}>CARTELERA DE CINE</h3>
          <p style={{ color: '#475569', marginBottom: '1.2rem' }}>Explora todas las funciones disponibles y asegura tus entradas.</p>
          <Link to="/cartelera" className="btn-azul" style={{ textDecoration: 'none', display: 'inline-block' }}>Comprar Aquí</Link>
        </div>

        <div style={{ backgroundColor: 'var(--blanco)', borderTop: '5px solid var(--amarillo-principal)', padding: '1.8rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <span style={{ color: '#b45309', fontWeight: '700', fontSize: '0.8rem' }}>¡NO TE QUEDES CON EL ANTOJO!</span>
          <h3 style={{ color: 'var(--azul-principal)', margin: '0.5rem 0' }}>ALIMENTOS Y COMBOS</h3>
          <p style={{ color: '#475569', marginBottom: '1.2rem' }}>Completa tu experiencia con crispetas, bebidas, pizza y sushi.</p>
          <Link to="/confiteria" className="btn-amarillo" style={{ textDecoration: 'none', display: 'inline-block' }}>Ver Menú</Link>
        </div>
      </section>
    </div>
  );
}