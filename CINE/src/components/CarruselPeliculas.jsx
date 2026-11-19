import ReactSlick from 'react-slick';
import { Link } from 'react-router-dom';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const Slider = ReactSlick.default ? ReactSlick.default : ReactSlick;

export default function CarruselPeliculas({ peliculas }) {
  const settings = {
    dots: true,
    infinite: peliculas.length > 3,
    speed: 500,
    slidesToShow: Math.min(3, peliculas.length || 1),
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3500
  };

  return (
    <section style={{ backgroundColor: 'var(--azul-oscuro)', padding: '2.5rem 4rem', color: 'var(--blanco)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ borderLeft: '5px solid var(--amarillo-principal)', paddingLeft: '0.8rem', fontSize: '1.6rem' }}>
          Películas Destacadas
        </h2>
        <Link to="/cartelera" style={{ color: 'var(--amarillo-principal)', textDecoration: 'none', fontWeight: '600' }}>
          Ver toda la cartelera →
        </Link>
      </div>

      {peliculas.length === 0 ? (
        <p>Cargando cartelera...</p>
      ) : (
        <Slider {...settings}>
          {peliculas.map((peli) => (
            <div key={peli.id} style={{ padding: '0 12px' }}>
              <div style={{ backgroundColor: 'var(--blanco)', color: 'var(--texto-oscuro)', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }}>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    backgroundColor: 'var(--amarillo-principal)',
                    color: 'var(--azul-oscuro)',
                    fontWeight: '800',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase'
                  }}>
                    {peli.estado}
                  </span>
                  <img
                    src={peli.imagen}
                    alt={peli.titulo}
                    style={{ width: '100%', height: '320px', objectFit: 'cover', display: 'block' }}
                  />
                </div>
                <div style={{ padding: '1.2rem' }}>
                  <h4 style={{ color: 'var(--azul-principal)', fontSize: '1.1rem', marginBottom: '0.4rem', minHeight: '2.6rem' }}>
                    {peli.titulo}
                  </h4>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    ⏱ Duración: {peli.duracion}
                  </p>
                  <Link to="/cartelera" className="btn-azul" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                    Comprar Boletas
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      )}
    </section>
  );
}