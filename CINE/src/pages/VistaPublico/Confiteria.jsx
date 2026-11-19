import { useEffect, useState } from 'react';
import CineApiService from '../../services/api';

export default function Confiteria({ agregarAlCarrito }) {
  const [productos, setProductos] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');

  useEffect(() => {
    CineApiService.obtenerConfiteria()
      .then(res => setProductos(res.data))
      .catch(err => console.error('Error cargando comidas:', err));
  }, []);

  const categorias = ['Todas', 'Confitería', 'Cinepolitana', 'Sushi', 'Juan Valdez'];

  const productosFiltrados = categoriaActiva === 'Todas'
    ? productos
    : productos.filter(p => p.categoria.toLowerCase() === categoriaActiva.toLowerCase());

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <h2 style={{ color: 'var(--azul-principal)', borderLeft: '5px solid var(--amarillo-principal)', paddingLeft: '0.8rem' }}>
          Alimentos, Pizza, Sushi y Confitería
        </h2>

        {/* Pestañas de categorías */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoriaActiva(cat)}
              className={categoriaActiva === cat ? 'btn-amarillo' : 'btn-azul'}
            >
              {cat === 'Cinepolitana' ? '🍕 Pizza (Cinepolitana)' : cat === 'Sushi' ? '🍣 Sushi' : cat}
            </button>
          ))}
        </div>
      </div>

      {productosFiltrados.length === 0 ? (
        <div style={{ backgroundColor: 'var(--blanco)', padding: '2rem', borderRadius: '10px', textAlign: 'center' }}>
          <p style={{ color: '#64748b' }}>No hay productos registrados en esta categoría aún.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {productosFiltrados.map(prod => (
            <div key={prod.id} style={{ backgroundColor: 'var(--blanco)', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 3px 10px rgba(0,0,0,0.08)', borderTop: '4px solid var(--azul-principal)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ backgroundColor: 'var(--amarillo-principal)', color: 'var(--azul-oscuro)', padding: '3px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '800' }}>
                  {prod.categoria}
                </span>
                <h3 style={{ color: 'var(--azul-oscuro)', margin: '0.8rem 0 0.4rem' }}>{prod.nombre}</h3>
                <p style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--azul-principal)', marginBottom: '1.2rem' }}>
                  ${Number(prod.precio).toLocaleString()}
                </p>
              </div>

              <button
                className="btn-azul"
                style={{ width: '100%' }}
                onClick={() => agregarAlCarrito({
                  id: `comida-${prod.id}-${Date.now()}`,
                  nombre: prod.nombre,
                  precio: Number(prod.precio),
                  tipo: prod.categoria
                })}
              >
                + Agregar al Carrito
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}