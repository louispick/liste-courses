import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import Recipes from './pages/Recipes';
import History from './pages/History';
import Pictionary from './pages/Pictionary'; // Remplace Quiz
import Packing from './pages/Packing';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Home />} />
          <Route path="recipes" element={<Recipes />} />
          <Route path="packing" element={<Packing />} />
          <Route path="history" element={<History />} />
          <Route path="game" element={<Pictionary />} /> 
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
