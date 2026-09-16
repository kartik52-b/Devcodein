import { Navigate, Route, Routes } from 'react-router-dom';
import AICodingMentor from '../components/AICodingMentor';
import HabitTracker from '../components/HabitTracker';
import ProfileLeaderboard from '../components/ProfileLeaderboard';
import RoadmapSection from '../components/RoadmapSection';
import ModulePage from './ModulePage';
import ProgrammingLanguageExplorerPage from './ProgrammingLanguageExplorerPage';
import DsaBattleArenaPage from './DsaBattleArenaPage';
import AlgorithmVisualizerPage from './AlgorithmVisualizerPage';
import ComplexityAnalyzerPage from './ComplexityAnalyzerPage';
import CodingChallengesPage from './CodingChallengesPage';

function ModuleRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/" replace />} />
      <Route path="/modules/programming-explorer" element={<ProgrammingLanguageExplorerPage />} />
      <Route path="/programming-language-explorer" element={<ProgrammingLanguageExplorerPage />} />
      <Route path="/modules/dsa-battle" element={<DsaBattleArenaPage />} />
      <Route path="/modules/algorithm-visualizer" element={<AlgorithmVisualizerPage />} />
      <Route path="/modules/complexity-analyzer" element={<ComplexityAnalyzerPage />} />
      <Route path="/modules/ai-mentor" element={<ModulePage title="AI Mentor" eyebrow="AI" description="Work through debugging, code review, and guided problem-solving with an always-on mentor experience." ><AICodingMentor /></ModulePage>} />
      <Route path="/modules/roadmaps" element={<ModulePage title="Roadmaps" eyebrow="Roadmaps" description="Follow curated pathways for frontend, backend, full stack, AI, DevOps, mobile, and security." ><RoadmapSection /></ModulePage>} />
      <Route path="/modules/practice" element={<CodingChallengesPage />} />
      <Route path="/modules/challenges" element={<CodingChallengesPage />} />
      <Route path="/modules/challenge-studio" element={<CodingChallengesPage />} />
      <Route path="/modules/community" element={<ModulePage title="Community" eyebrow="Community" description="Stay motivated through leaderboards, streaks, achievements, and a stronger sense of progress." ><ProfileLeaderboard /><HabitTracker /></ModulePage>} />
    </Routes>
  );
}

export default ModuleRoutes;
