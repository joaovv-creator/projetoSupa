import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importação do Contexto de Autenticação
import { AuthProvider } from './contexts/AuthContext';

// Importação das Páginas
import Login from './pages/Login'; 
import Dashboard from './pages/Dashboard'; 
import Produtos from './pages/Produtos';
import Clientes from './pages/Clientes';
import Vendas from './pages/Vendas';
import Relatorios from './pages/Relatorios';

/**
 * O App.jsx gerencia a navegação principal.
 * Certifique-se de que os arquivos na pasta /pages tenham exatamente estes nomes.
 */
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rota da tela de entrada (Login) */}
          <Route path="/login" element={<Login />} />
          
          {/* Rota da tela principal (Dashboard) */}
          <Route path="/" element={<Dashboard />} /> 
          
          {/* Rota do módulo de Produtos */}
          <Route path="/produtos" element={<Produtos />} />
          
          {/* Rota do módulo de Clientes */}
          <Route path="/clientes" element={<Clientes />} />
          
          {/* Rota do módulo de Vendas (PDV) */}
          <Route path="/vendas" element={<Vendas />} />
          
          {/* Rota do módulo de Relatórios e Histórico */}
          <Route path="/relatorios" element={<Relatorios />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}