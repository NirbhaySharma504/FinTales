import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './Home';
import { StoryCreator } from './StoryCreator';
import { StoryLibrary } from './StoryLibrary';
import { VisualNovel } from './VisualNovel';
import SummaryPage from "./SummaryPage";
import QuizPage from "./QuizPage";

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<StoryCreator />} />
        <Route path="/library" element={<StoryLibrary />} />
        <Route path="/story/:storyId" element={<VisualNovel />} />
        <Route path="/summary" element={<SummaryPage />} />
        <Route path="/quiz" element={<QuizPage />} />
      </Routes>
    </BrowserRouter>
  );
};
