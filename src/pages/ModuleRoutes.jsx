import { Navigate, Route, Routes } from 'react-router-dom';
import AICodingMentor from '../components/AICodingMentor';
import HabitTracker from '../components/HabitTracker';
import ProfileLeaderboard from '../components/ProfileLeaderboard';
import RoadmapSection from '../components/RoadmapSection';
import ModulePage from './ModulePage';
import NotFoundPage from './NotFoundPage';
import ProgrammingLanguageExplorerPage from './ProgrammingLanguageExplorerPage';
import LanguageExplorerPage from './LanguageExplorerPage';
import DsaBattleArenaPage from './DsaBattleArenaPage';
import AlgorithmVisualizerPage from './AlgorithmVisualizerPage';
import ComplexityAnalyzerPage from './ComplexityAnalyzerPage';
import CodingChallengesPage from './CodingChallengesPage';
import AICodingMentorPage from './AICodingMentorPage';
import RoadmapsPage from './RoadmapsPage';
import ProfilePage from './ProfilePage';
import LeaderboardPage from './LeaderboardPage';
import DashboardPage from './DashboardPage';
import AchievementsPage from './AchievementsPage';
import SettingsPage from './SettingsPage';
import DailyMissionsPage from './DailyMissionsPage';
import CodingHabitTrackerPage from './CodingHabitTrackerPage';

/**
 * Every route in here sits behind <RequireAuth /> (see App.jsx).
 * Aliases are explicit <Navigate>s so no legacy link ever 404s.
 */
function ModuleRoutes() {
  return (
    <Routes>
      {/* central dashboard (overview only — previews + entry points) */}
      <Route path="/dashboard" element={<DashboardPage />} />

      {/* default module landing */}
      <Route path="/modules" element={<Navigate to="/modules/practice" replace />} />
      <Route path="/modules/index" element={<Navigate to="/modules/practice" replace />} />

      {/* Learn */}
      <Route path="/modules/programming-explorer" element={<ProgrammingLanguageExplorerPage />} />
      <Route path="/modules/language-explorer" element={<LanguageExplorerPage />} />
      <Route path="/modules/dsa-battle" element={<DsaBattleArenaPage />} />
      <Route path="/modules/algorithm-visualizer" element={<AlgorithmVisualizerPage />} />
      <Route path="/modules/complexity-analyzer" element={<ComplexityAnalyzerPage />} />

      {/* Practice — three historical aliases that render the same module */}
      <Route path="/modules/practice" element={<CodingChallengesPage />} />
      <Route path="/modules/practice/:challengeId" element={<CodingChallengesPage />} />
      <Route path="/modules/challenges" element={<Navigate to="/modules/practice" replace />} />
      <Route path="/modules/challenge-studio" element={<Navigate to="/modules/practice" replace />} />

      {/* AI + Roadmaps */}
      <Route path="/modules/ai-mentor" element={<AICodingMentorPage />} />
      <Route path="/modules/roadmaps" element={<RoadmapsPage />} />
      <Route path="/modules/roadmaps/:roadmapId" element={<RoadmapsPage />} />

      {/* Dashboard / gamification */}
      <Route path="/modules/missions" element={<DailyMissionsPage />} />
      <Route path="/modules/habits" element={<CodingHabitTrackerPage />} />
      <Route path="/modules/profile" element={<ProfilePage />} />
      <Route path="/modules/leaderboard" element={<LeaderboardPage />} />
      <Route path="/modules/achievements" element={<AchievementsPage />} />
      <Route path="/modules/settings" element={<SettingsPage />} />

      {/* Community */}
      <Route
        path="/modules/community"
        element={
          <ModulePage
            title="Community"
            eyebrow="Community"
            description="Stay motivated through leaderboards, streaks, achievements, and a stronger sense of progress."
          >
            <ProfileLeaderboard />
            <HabitTracker />
          </ModulePage>
        }
      />
      <Route
        path="/modules/learn"
        element={
          <ModulePage
            title="AI Mentor"
            eyebrow="AI"
            description="Work through debugging, code review, and guided problem-solving with an always-on mentor experience."
          >
            <AICodingMentor />
          </ModulePage>
        }
      />
      <Route
        path="/modules/roadmap-preview"
        element={
          <ModulePage
            title="Roadmaps"
            eyebrow="Roadmaps"
            description="Follow curated pathways for frontend, backend, full stack, AI, DevOps, mobile, and security."
          >
            <RoadmapSection />
          </ModulePage>
        }
      />

      {/* ---- legacy aliases (kept so old links keep working) ---- */}
      <Route path="/programming-language-explorer" element={<Navigate to="/modules/programming-explorer" replace />} />
      <Route path="/challenges" element={<Navigate to="/modules/practice" replace />} />
      <Route path="/challenge-studio" element={<Navigate to="/modules/practice" replace />} />
      <Route path="/profile" element={<Navigate to="/modules/profile" replace />} />
      <Route path="/leaderboard" element={<Navigate to="/modules/leaderboard" replace />} />
      <Route path="/achievements" element={<Navigate to="/modules/achievements" replace />} />
      <Route path="/missions" element={<Navigate to="/modules/missions" replace />} />
      <Route path="/settings" element={<Navigate to="/modules/settings" replace />} />
      <Route path="/daily-missions" element={<Navigate to="/modules/missions" replace />} />
      <Route path="/community" element={<Navigate to="/modules/community" replace />} />

      {/* everything else */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default ModuleRoutes;
