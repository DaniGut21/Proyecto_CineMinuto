import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/VistaPublico/Home';
import Cartelera from './pages/VistaPublico/Cartelera';
import Confiteria from './pages/VistaPublico/Confiteria';
import Carrito from './pages/VistaPublico/Carrito';
import Cuenta from './pages/VistaPublico/Cuenta';
import AdminDashboard from './pages/VistaAdministrador/AdminDashboard';

function App() {
  const [carrito, setCarrito] = useState([]);

  const agregarAlCarrito = (producto) => {
    setCarrito([...carrito, producto]);
    alert(`¡"${producto.nombre}" agregado al carrito!`);
  };

  const eliminarDelCarrito = (indice) => {
    setCarrito(carrito.filter((_, i) => i !== indice));
  };

  const vaciarCarrito = () => {
    setCarrito([]);
  };

  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar cantidadCarrito={carrito.length} />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cartelera" element={<Cartelera agregarAlCarrito={agregarAlCarrito} />} />
            <Route path="/confiteria" element={<Confiteria agregarAlCarrito={agregarAlCarrito} />} />
            <Route path="/carrito" element={<Carrito carrito={carrito} eliminarDelCarrito={eliminarDelCarrito} vaciarCarrito={vaciarCarrito} />} />
            <Route path="/cuenta" element={<Cuenta />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;