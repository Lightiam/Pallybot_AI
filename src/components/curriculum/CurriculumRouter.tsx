import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CurriculumCalendar from './CurriculumCalendar';
import CurriculumSettings from './CurriculumSettings';
import CurriculumCreate from './CurriculumCreate';
import CurriculumLibrary from './CurriculumLibrary';
import ModuleManagement from './ModuleManagement';

const CurriculumRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="calendar" element={<CurriculumCalendar />} />
      <Route path="settings" element={<CurriculumSettings />} />
      <Route path="create" element={<CurriculumCreate />} />
      <Route path="library" element={<CurriculumLibrary />} />
      <Route path="modules" element={<ModuleManagement />} />
    </Routes>
  );
};

export default CurriculumRouter;