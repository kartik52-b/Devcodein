import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Code2,
  Compass,
  Gauge,
  LineChart,
  Sparkles,
  Swords,
  Trophy
} from 'lucide-react';
import Button from '../components/ui/Button';

/**
 * Homepage — deliberately short: hero, four core features, four featured
 * tools and one call to action. Module previews and long-form marketing copy
 * live on their own pages (/product-experience and the module routes).
 */
const features = [
  {
    title: 'Learn',
    description: 'Explore programming languages and structured learning resources.',
    path: '/modules/programming-explorer',
    icon: BookOpen
  },
  {
    title: 'Practice',
    description: 'Solve coding challenges and improve problem-solving skills.',
    path: '/modules/practice',
    icon: Code2
  },
  {
    title: 'AI Mentor',
    description: 'Get intelligent coding assistance while you build.',
    path: '/modules/ai-mentor',
    icon: Sparkles
  },
  {
    title: 'Leaderboard',
    description: 'Track your progress and achievements against other learners.',
    path: '/modules/leaderboard',
    icon: Trophy
  }
];

const tools = [
  {
    title: 'Language Explorer',
    description: 'Compare syntax, trade-offs and performance.',
    path: '/modules/programming-explorer',
    icon: Compass
  },
  {
    title: 'DSA Battle Arena',
    description: 'See data structures and algorithms side by side.',
    path: '/modules/dsa-battle',
    icon: Swords
  },
  {
    title: 'Algorithm Visualizer',
    description: 'Step through algorithms and watch how they run.',
    path: '/modules/algorithm-visualizer',
    icon: LineChart
  },
  {
    title: 'Complexity Analyzer',
    description: 'Estimate time and space complexity as you code.',
    path: '/modules/complexity-analyzer',
    icon: Gauge
  }
];

function LandingPage() {
  return (
    <div className="relative text-slate-200">
      <div className="relative z-10">
        {/* ------------------------------------------------------------ hero */}
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8 lg:py-20">
          <div className="relative">
            <div className="aurora" aria-hidden="true" />
            <div className="relative space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-sm text-indigo-300">
                <span className="h-2 w-2 rounded-full bg-cyan-300" />
                AI-powered coding learning platform
              </div>

              <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
                Master Coding. Build Your Future.
              </h1>

              <p className="max-w-xl text-lg leading-8 text-slate-300">
                Learn programming, practice DSA, explore powerful coding tools and improve your
                skills with DevVerse.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button to="/modules/practice" variant="primary" size="lg" className="text-center">
                  Start Learning
                </Button>
                <Button href="#features" variant="secondary" size="lg" className="text-center">
                  Explore Features
                </Button>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="glass animate-float rounded-2xl border border-white/10 p-6 shadow-2xl shadow-indigo-950/60">
              <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-400">Current mastery path</p>
                    <p className="text-lg font-semibold text-white">Systems Design • React • AI APIs</p>
                  </div>
                  <div className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">
                    On track
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    ['Designing resilient APIs', '92%'],
                    ['Shipping polished UI systems', '81%'],
                    ['Integrating AI copilots', '74%']
                  ].map(([title, progress]) => (
                    <div key={title} className="rounded-lg border border-white/10 bg-white/5 p-3">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-slate-300">{title}</span>
                        <span className="text-white">{progress}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                          style={{ width: progress }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------- features */}
        <section id="features" className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
          <div className="max-w-2xl">
            <p className="eyebrow">What you get</p>
            <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
              Four ways to level up.
            </h2>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ title, description, path, icon: Icon }) => (
              <Link
                key={title}
                to={path}
                className="group glass flex flex-col rounded-xl border border-white/10 p-6 transition hover:-translate-y-1 hover:border-white/20"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-cyan-300">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-slate-400">{description}</p>
                <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-cyan-300">
                  Explore <ArrowRight size={14} aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ----------------------------------------------------- featured tools */}
        <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow">Featured tools</p>
              <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
                Focused tools for daily practice.
              </h2>
            </div>
            <Link
              to="/product-experience"
              className="inline-flex items-center gap-1 rounded-sm text-sm font-medium text-slate-300 transition hover:text-white"
            >
              See the product experience <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {tools.map(({ title, description, path, icon: Icon }) => (
              <Link
                key={title}
                to={path}
                className="group glass rounded-xl border border-white/10 p-6 transition hover:-translate-y-1 hover:border-white/20"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-cyan-300">
                    <Icon size={16} aria-hidden="true" />
                  </span>
                  <h3 className="text-base font-semibold text-white">{title}</h3>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-400">{description}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* --------------------------------------------------------------- CTA */}
        <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
          <div className="glass rounded-2xl border border-white/10 p-8 text-center lg:p-12">
            <h2 className="mx-auto max-w-2xl text-3xl font-semibold text-white sm:text-4xl">
              Ready to start building?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-400">
              Create your account and pick up your first practice session in under a minute.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button to="/auth?mode=register" variant="primary" size="lg">
                Create your account
              </Button>
              <Button to="/product-experience" variant="secondary" size="lg">
                Explore the product
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default LandingPage;