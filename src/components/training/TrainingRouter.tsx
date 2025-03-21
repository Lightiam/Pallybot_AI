import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TrainingHub from './TrainingHub';
import TrainingCreate from './TrainingCreate';
import TrainingList from './TrainingList';

const TrainingRouter: React.FC = () => {
  return (
    <Routes>
      <Route index element={<TrainingHub />} />
      <Route path="create" element={<TrainingCreate />} />
      <Route path="list" element={<TrainingList />} />
    </Routes>
  );
};

export default TrainingRouter;