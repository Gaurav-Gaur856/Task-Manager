import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

const tokenKey = 'taskmanager_token';

function App() {
  const [token, setToken] = useState(localStorage.getItem(tokenKey));

  useEffect(() => {
    if (token) localStorage.setItem(tokenKey, token);
    else localStorage.removeItem(tokenKey);
  }, [token]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLogin={setToken} />} />
        <Route path="/register" element={<Register onRegister={setToken} />} />
        <Route
          path="/"
          element={token ? <Dashboard token={token} onLogout={() => setToken(null)} /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
