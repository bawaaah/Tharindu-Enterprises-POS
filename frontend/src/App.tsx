import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Pos from './components/Pos';
import ProductForm from './components/ProductForm';
import Reports from './components/Reports';
import Inventory from './components/Inventory';
import InventoryPage from './components/InventoryPage';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode'; // Updated import

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('token');
        }
      } catch {
        localStorage.removeItem('token');
      }
    }
  }, []);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/pos" /> : <Login onLogin={handleLogin} />}
        />
        <Route
          path="/pos"
          element={isAuthenticated ? <Pos onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route
          path="/products"
          element={isAuthenticated ? <ProductForm onLogout={handleLogout} /> : <ProductForm onLogout={handleLogout} />}
        />
        <Route
          path="/reports"
          element={isAuthenticated ? <Reports onLogout={handleLogout} /> : <Reports onLogout={handleLogout} />}
        />
        <Route
          path="/inventory"
          element={isAuthenticated ? <InventoryPage onLogout={handleLogout} /> : <InventoryPage onLogout={handleLogout} />}
        />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/pos" : "/login"} />} />
      </Routes>
    </Router>
  );
};

export default App;