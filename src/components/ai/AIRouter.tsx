import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ChatMode from './ChatMode';
import CodeInterface from './CodeInterface';
import LearningEnvironment from './LearningEnvironment';
import CurriculumGenerator from './CurriculumGenerator';
import ModuleGenerator from './ModuleGenerator';
import AISettings from './AISettings';

const AIRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/chat" element={<ChatMode />} />
      <Route path="/code" element={<CodeInterface />} />
      <Route path="/learning-environment" element={<LearningEnvironment />} />
      <Route path="/curriculum" element={<CurriculumGenerator />} />
      <Route path="/module" element={<ModuleGenerator />} />
      <Route path="/settings" element={<AISettings />} />
    </Routes>
  );
};

export default AIRouter;