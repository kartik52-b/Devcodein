import { Link } from 'react-router-dom';
import AICodingMentor from '../components/AICodingMentor';
import AlgorithmVisualizer from '../components/AlgorithmVisualizer';
import CodingChallengePlatform from '../components/CodingChallengePlatform';
import ComplexityAnalyzer from '../components/ComplexityAnalyzer';
import DailyMissionSystem from '../components/DailyMissionSystem';
import DsaBattleArena from '../components/DsaBattleArena';
import HabitTracker from '../components/HabitTracker';
import LanguageExplorer from '../components/LanguageExplorer';
import ProfileLeaderboard from '../components/ProfileLeaderboard';
import RoadmapSection from '../components/RoadmapSection';

const features = [
  {
    title: 'Programming Explorer',
    description: 'Explore languages with an immersive editor experience and elegant syntax previews.',
    path: '/programming-language-explorer',
    accent: 'from-indigo-500/25 to-cyan-400/20'
  },
  {
    title: 'DSA Battle',
    description: 'Compare core data structures and algorithms through animated, high-signal visuals.',
    path: '/modules/dsa-battle',
    accent: 'from-fuchsia-500/25 to-violet-500/20'
  },
  {
    title: 'AI Mentor',
    description: 'Practice real workflows with an AI coach that guides debugging, critique, and next steps.',
    path: '/modules/ai-mentor',
    accent: 'from-cyan-500/25 to-sky-500/20'
  },
  {
    title: 'Roadmaps',
    description: 'Discover curated learning paths for frontend, backend, AI, DevOps, mobile, and security.',
    path: '/modules/roadmaps',
    accent: 'from-emerald-500/25 to-lime-500/20'
  },
  {
    title: 'Coding Challenges',
    description: 'Challenge yourself with focused coding problems, filters, hints, solutions, and XP rewards in a dedicated studio.',
    path: '/modules/challenges',
    accent: 'from-amber-500/25 to-orange-500/20'
  },
  {
    title: 'Community',
    description: 'Track progress, compare yourself against peers, and keep momentum through leaderboards.',
    path: '/modules/community',
    accent: 'from-rose-500/25 to-pink-500/20'
  }
];

const stats = [
  { value: '4.9/5', label: 'Learner satisfaction' },
  { value: '12k+', label: 'Projects launched' },
  { value: '98%', label: 'Weekly retention' }
];

const testimonials = [
  {
    quote: 'DevVerse feels like having a world-class engineering mentor in the room at all times.',
    author: 'Maya Chen',
    role: 'Frontend Engineer, Northstar'
  },
  {
    quote: 'The platform turns complex topics into beautiful, focused learning loops.',
    author: 'Jules Alvarez',
    role: 'Product Engineer, Arc Labs'
  }
];

const faqs = [
  {
    question: 'Who is DevVerse built for?',
    answer: 'It is designed for ambitious developers, career switchers, and product builders.'
  },
  {
    question: 'Is it suitable for beginners?',
    answer: 'Yes. The curriculum guides you from fundamentals to advanced systems design with clarity.'
  },
  {
    question: 'Do I need prior experience?',
    answer: 'No. You can start from zero and progress through curated, AI-assisted pathways.'
  }
];

function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden text-slate-100">
      <div className="relative z-10">
        <main>
          <section className="mx-auto grid max-w-7xl gap-14 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
            <div className="relative">
              <div className="aurora" />
              <div className="relative space-y-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-sm text-indigo-200">
                  <span className="h-2 w-2 rounded-full bg-cyan-300" />
                  AI-powered coding learning platform
                </div>
                <div className="space-y-5">
                  <h1 className="max-w-3xl text-4xl font-semibold leading-[0.95] text-white sm:text-5xl lg:text-7xl">
                    Learn to build like the top 1% of engineers.
                  </h1>
                  <p className="max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                    DevVerse turns ambitious curiosity into exceptional engineering skill with AI-guided mentorship, premium practice, and beautiful production workflows.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <a href="#features" className="rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 px-6 py-3 text-center font-medium text-white shadow-glow transition hover:scale-[1.01]">
                    Explore the platform
                  </a>
                  <a href="#faq" className="rounded-full border border-white/15 bg-white/10 px-6 py-3 text-center font-medium text-slate-100 backdrop-blur transition hover:bg-white/20">
                    See how it works
                  </a>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="glass animate-float rounded-[2rem] border border-white/10 p-5 shadow-2xl shadow-indigo-950/60">
                <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4">
                  <div className="mb-4 flex items-center justify-between">
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
                      <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-slate-300">{title}</span>
                          <span className="text-white">{progress}</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-800">
                          <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400" style={{ width: progress }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
            <div className="grid gap-6 lg:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="glass rounded-[1.4rem] border border-white/10 p-8 text-center">
                  <p className="text-4xl font-semibold text-white">{stat.value}</p>
                  <p className="mt-2 text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="features" className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
            <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">Platform overview</p>
                <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Every major module, beautifully previewed.</h2>
              </div>
              <p className="max-w-xl text-slate-400">The homepage highlights the product experience while each module links to a dedicated page for full interaction.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {features.map((feature) => (
                <Link key={feature.title} to={feature.path} className="group glass rounded-[1.6rem] border border-white/10 p-7 transition hover:-translate-y-1">
                  <div className={`mb-5 h-12 w-12 rounded-2xl bg-gradient-to-br ${feature.accent}`} />
                  <h3 className="mb-3 text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="leading-7 text-slate-400">{feature.description}</p>
                  <div className="mt-6 text-sm font-medium text-cyan-300 transition group-hover:text-cyan-200">Open module →</div>
                </Link>
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
            <div className="glass rounded-[2rem] border border-white/10 p-8 lg:p-10">
              <div className="mb-8">
                <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">Preview suite</p>
                <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">A polished snapshot of the full product experience.</h2>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-6">
                  <LanguageExplorer />
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-6">
                  <DsaBattleArena />
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="glass rounded-[2rem] border border-white/10 p-8">
                <AICodingMentor />
              </div>
              <div className="glass rounded-[2rem] border border-white/10 p-8">
                <RoadmapSection />
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
            <div className="glass rounded-[2rem] border border-white/10 p-8">
              <div className="mb-6">
                <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">Community pulse</p>
                <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Momentum, accountability, and visible growth.</h2>
              </div>
              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <ProfileLeaderboard />
                <div className="space-y-6">
                  <DailyMissionSystem />
                  <HabitTracker />
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
            <div className="grid gap-6 lg:grid-cols-2">
              {testimonials.map((item) => (
                <div key={item.author} className="glass rounded-[1.5rem] border border-white/10 p-7">
                  <p className="text-lg leading-8 text-slate-200">“{item.quote}”</p>
                  <div className="mt-6">
                    <p className="font-semibold text-white">{item.author}</p>
                    <p className="text-sm text-slate-400">{item.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="faq" className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
            <div className="glass rounded-[2rem] border border-white/10 p-8 lg:p-12">
              <div className="mb-8 max-w-2xl">
                <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">FAQ</p>
                <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Everything you need to know before you begin.</h2>
              </div>
              <div className="space-y-4">
                {faqs.map((item) => (
                  <details key={item.question} className="rounded-[1.25rem] border border-white/10 bg-slate-950/70 p-5">
                    <summary className="cursor-pointer text-lg font-medium text-white">{item.question}</summary>
                    <p className="mt-3 text-slate-400">{item.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
            <div className="glass rounded-[2rem] border border-white/10 p-8 text-center lg:p-12">
              <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">Ready to build differently?</p>
              <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-semibold text-white sm:text-4xl">Join DevVerse and sharpen your engineering instincts with AI that feels like a real co-pilot.</h2>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <a href="#" className="rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 px-6 py-3 font-medium text-white shadow-glow transition hover:scale-[1.01]">
                  Reserve your access
                </a>
                <a href="#" className="rounded-full border border-white/15 bg-white/10 px-6 py-3 font-medium text-slate-100 backdrop-blur transition hover:bg-white/20">
                  Book a demo
                </a>
              </div>
            </div>
          </section>
        </main>

        <footer className="mx-auto max-w-7xl border-t border-white/10 px-6 py-8 text-sm text-slate-400 lg:px-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p>© 2026 DevVerse. Crafted for ambitious builders.</p>
            <div className="flex gap-5">
              <a href="#" className="transition hover:text-white">Privacy</a>
              <a href="#" className="transition hover:text-white">Terms</a>
              <a href="#" className="transition hover:text-white">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default LandingPage;
