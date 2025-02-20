import { Routes, Route } from 'react-router-dom'; // Eliminar Router de aquí
import Login from './components/login';
import Register from './components/Register';
import AdminPanel from './components/AdminPanel';
import RolePanel from './components/RolePanel';
import Navbar from './components/Navbar';

function App() {
    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/role-panel/:role" element={<RolePanel />} />
            </Routes>
        </>
    );
}

export default App;