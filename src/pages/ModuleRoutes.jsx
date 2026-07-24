import { Navigate, Route, Routes } from 'react-router-dom';
import NavigationShell from '../components/NavigationShell';
import ProgrammingLanguageExplorerPage from './ProgrammingLanguageExplorerPage';
import DsaBattleArenaPage from './DsaBattleArenaPage';
import AlgorithmVisualizerPage from './AlgorithmVisualizerPage';
import ComplexityAnalyzerPage from './ComplexityAnalyzerPage';
import CodingChallengesPage from './CodingChallengesPage';
import DailyMissionsPage from './DailyMissionsPage';
import AICodingMentorPage from './AICodingMentorPage';
import CodingHabitTrackerPage from './CodingHabitTrackerPage';
import RoadmapsPage from './RoadmapsPage';
import ProfilePage from './ProfilePage';
import LeaderboardPage from './LeaderboardPage';
import SettingsPage from './SettingsPage';

function ModuleRoutes() {
  return (
    <NavigationShell>
      <Routes>
        <Route path="/" element={<Navigate to="/" replace />} />
        <Route path="/modules/programming-explorer" element={<ProgrammingLanguageExplorerPage />} />
        <Route path="/programming-language-explorer" element={<Navigate to="/modules/programming-explorer" replace />} />
        <Route path="/modules/dsa-battle" element={<DsaBattleArenaPage />} />
        <Route path="/modules/algorithm-visualizer" element={<AlgorithmVisualizerPage />} />
        <Route path="/modules/complexity-analyzer" element={<ComplexityAnalyzerPage />} />
        <Route path="/modules/practice" element={<Navigate to="/modules/challenges" replace />} />
        <Route path="/modules/challenges" element={<CodingChallengesPage />} />
        <Route path="/modules/challenge-studio" element={<Navigate to="/modules/challenges" replace />} />
        
        {/* New Dedicated Feature Pages */}
        <Route path="/modules/daily-missions" element={<DailyMissionsPage />} />
        <Route path="/modules/ai-mentor" element={<AICodingMentorPage />} />
        <Route path="/modules/habit-tracker" element={<CodingHabitTrackerPage />} />
        <Route path="/modules/roadmaps" element={<RoadmapsPage />} />
        <Route path="/modules/profile" element={<ProfilePage />} />
        <Route path="/modules/leaderboard" element={<LeaderboardPage />} />
        <Route path="/modules/settings" element={<SettingsPage />} />
        
        {/* Catch all redirects back to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </NavigationShell>
  );
}

export default ModuleRoutes;
