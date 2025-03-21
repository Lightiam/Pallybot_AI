import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';

const AdminRouter: React.FC = () => {
  return (
    <Routes>
      <Route index element={<AdminDashboard />} />
      {/* Add more admin routes as needed */}
    </Routes>
  );
};

export default AdminRouter;