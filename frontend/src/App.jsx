import React, { useState, useMemo } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { lightTheme, darkTheme } from "./theme";
import AppLayout from "./components/AppLayout";

// Pages
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import TopicExplainer from "./pages/TopicExplainer";
import NotesSummarizer from "./pages/NotesSummarizer";
import QuizGenerator from "./pages/QuizGenerator";
import Flashcards from "./pages/Flashcards";
import Analytics from "./pages/Analytics";
import StudyPlanner from "./pages/StudyPlanner";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const theme = useMemo(() => (darkMode ? darkTheme : lightTheme), [darkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route element={<AppLayout darkMode={darkMode} onToggleDark={() => setDarkMode((d) => !d)} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/explain" element={<TopicExplainer />} />
            <Route path="/notes" element={<NotesSummarizer />} />
            <Route path="/quiz" element={<QuizGenerator />} />
            <Route path="/flashcards" element={<Flashcards />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/planner" element={<StudyPlanner />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}