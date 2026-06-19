import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import JobForm from './pages/JobForm';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* BUG FIX: Was "/jobs/new" in route but Dashboard navigated to "/job/new"
            (missing 's'). Unified to "/jobs/new" here and fixed in Dashboard too. */}
        <Route path="/jobs/new" element={<JobForm />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;