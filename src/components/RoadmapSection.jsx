import { useState } from 'react';

const roadmaps = [
  {
    title: 'Frontend',
    short: 'UI systems & product polish',
    timeline: '8–10 weeks',
    progress: '78%',
    resources: ['HTML & CSS', 'JavaScript', 'React', 'Accessibility'],
    projects: ['Portfolio site', 'Dashboard UI', 'Design system'],
    certification: 'Meta Front-End Developer',
    accent: 'from-cyan-400 to-blue-500',
    milestones: ['Core foundations', 'Interactive UI', 'Production polish']
  },
  {
    title: 'Backend',
    short: 'APIs, data, and services',
    timeline: '10–12 weeks',
    progress: '65%',
    resources: ['Node.js', 'REST APIs', 'Databases', 'Authentication'],
    projects: ['Task API', 'Auth service', 'Analytics backend'],
    certification: 'Backend Development Certificate',
    accent: 'from-violet-500 to-fuchsia-500',
    milestones: ['Server setup', 'Data modeling', 'Secure services']
  },
  {
    title: 'Full Stack',
    short: 'Ship complete products end to end',
    timeline: '12–16 weeks',
    progress: '84%',
    resources: ['React', 'Node.js', 'PostgreSQL', 'Deployment'],
    projects: ['E-commerce app', 'Admin portal', 'Realtime dashboard'],
    certification: 'Full Stack Engineer Path',
    accent: 'from-indigo-500 to-cyan-400',
    milestones: ['Frontend shell', 'Backend logic', 'Launch readiness']
  },
  {
    title: 'React',
    short: 'Modern component architecture',
    timeline: '6–8 weeks',
    progress: '71%',
    resources: ['Hooks', 'State management', 'Routing', 'Testing'],
    projects: ['Component library', 'SPA journey', 'Animation playground'],
    certification: 'React Advanced Certification',
    accent: 'from-sky-500 to-indigo-500',
    milestones: ['Components', 'State flows', 'Performance tuning']
  },
  {
    title: 'Node.js',
    short: 'Scalable runtime and APIs',
    timeline: '7–9 weeks',
    progress: '69%',
    resources: ['Express', 'Streams', 'Sockets', 'Queues'],
    projects: ['Chat server', 'File service', 'Webhook processor'],
    certification: 'Node.js Practitioner',
    accent: 'from-emerald-500 to-lime-500',
    milestones: ['Runtime basics', 'API design', 'Production scaling']
  },
  {
    title: 'Java',
    short: 'Enterprise-grade engineering',
    timeline: '9–11 weeks',
    progress: '74%',
    resources: ['OOP', 'Collections', 'Spring Boot', 'Concurrency'],
    projects: ['Inventory service', 'Banking API', 'Microservice setup'],
    certification: 'Oracle Java Associate',
    accent: 'from-orange-500 to-amber-500',
    milestones: ['Syntax mastery', 'Spring applications', 'System design']
  },
  {
    title: 'Python',
    short: 'Rapid development and AI workflows',
    timeline: '6–8 weeks',
    progress: '81%',
    resources: ['Data structures', 'Flask', 'FastAPI', 'Automation'],
    projects: ['CLI tool', 'Automation script', 'ML notebook'],
    certification: 'Python Institute PCAP',
    accent: 'from-emerald-400 to-cyan-400',
    milestones: ['Python essentials', 'API building', 'Automation workflows']
  },
  {
    title: 'C++',
    short: 'System-level depth and performance',
    timeline: '10–12 weeks',
    progress: '63%',
    resources: ['Memory', 'Templates', 'STL', 'Concurrency'],
    projects: ['Render engine', 'Scheduler', 'Data structures toolkit'],
    certification: 'C++ Programming Certificate',
    accent: 'from-rose-500 to-red-500',
    milestones: ['Language basics', 'Low-level design', 'Optimization practice']
  },
  {
    title: 'AI',
    short: 'Build intelligent products',
    timeline: '8–10 weeks',
    progress: '77%',
    resources: ['LLMs', 'Prompt design', 'Evaluations', 'Model APIs'],
    projects: ['AI copilot', 'RAG assistant', 'Evaluation suite'],
    certification: 'Generative AI Engineer',
    accent: 'from-fuchsia-500 to-purple-500',
    milestones: ['Concepts', 'Prompt systems', 'Production AI']
  },
  {
    title: 'Machine Learning',
    short: 'From data to deployable models',
    timeline: '12–14 weeks',
    progress: '68%',
    resources: ['Pandas', 'Scikit-learn', 'PyTorch', 'MLOps'],
    projects: ['Classifier app', 'Forecasting model', 'Model monitoring'],
    certification: 'Machine Learning Specialist',
    accent: 'from-blue-500 to-cyan-500',
    milestones: ['Data prep', 'Model training', 'Deployment']
  },
  {
    title: 'Cyber Security',
    short: 'Secure systems with confidence',
    timeline: '10–12 weeks',
    progress: '73%',
    resources: ['Networking', 'Threat modeling', 'Cloud security', 'Pentesting'],
    projects: ['Secure app', 'Security audit', 'Incident playbook'],
    certification: 'CompTIA Security+',
    accent: 'from-yellow-500 to-orange-500',
    milestones: ['Threat basics', 'Hardening', 'Response drills']
  },
  {
    title: 'Android',
    short: 'Craft native mobile experiences',
    timeline: '8–10 weeks',
    progress: '67%',
    resources: ['Kotlin', 'Jetpack Compose', 'Navigation', 'Testing'],
    projects: ['Todo app', 'Fitness tracker', 'E-commerce mobile UI'],
    certification: 'Android Development Associate',
    accent: 'from-green-500 to-emerald-500',
    milestones: ['UI foundations', 'App architecture', 'Release polish']
  },
  {
    title: 'DevOps',
    short: 'Improve delivery and reliability',
    timeline: '9–11 weeks',
    progress: '76%',
    resources: ['CI/CD', 'Docker', 'Kubernetes', 'Monitoring'],
    projects: ['Deployment pipeline', 'Containerized app', 'Observability stack'],
    certification: 'AWS DevOps Engineer',
    accent: 'from-slate-500 to-cyan-600',
    milestones: ['Automation', 'Containers', 'Reliability']
  },
  {
    title: 'Cloud',
    short: 'Design resilient distributed systems',
    timeline: '10–12 weeks',
    progress: '79%',
    resources: ['Cloud fundamentals', 'Azure', 'Terraform', 'Networking'],
    projects: ['Cloud landing zone', 'Serverless app', 'Infrastructure stack'],
    certification: 'Azure Fundamentals',
    accent: 'from-indigo-400 to-violet-500',
    milestones: ['Architecture', 'Core services', 'Scale & governance']
  }
];

function RoadmapSection() {
  const [activeRoadmap, setActiveRoadmap] = useState(roadmaps[0]);

  return (
    <section id="roadmaps" className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">Roadmaps</p>
          <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Choose a path and follow the signal from beginner to builder.</h2>
        </div>
        <p className="max-w-xl text-slate-400">
          Each roadmap mixes milestone guidance, hands-on projects, curated resources, and professional certification targets in a single premium experience.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="glass rounded-[2rem] border border-white/10 p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Interactive roadmap nodes</h3>
            <span className="text-sm text-slate-400">{roadmaps.length} tracks</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {roadmaps.map((roadmap) => {
              const isActive = activeRoadmap.title === roadmap.title;
              return (
                <button
                  key={roadmap.title}
                  onClick={() => setActiveRoadmap(roadmap)}
                  className={`roadmap-card rounded-[1.25rem] border p-4 text-left transition ${isActive ? 'border-cyan-400/40 bg-cyan-400/10 shadow-lg shadow-cyan-950/40' : 'border-white/10 bg-slate-950/50 hover:border-white/20 hover:bg-white/5'}`}
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r ${roadmap.accent}`} />
                    <span className="text-sm font-medium text-white">{roadmap.title}</span>
                  </div>
                  <p className="text-sm text-slate-400">{roadmap.short}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="glass rounded-[2rem] border border-white/10 p-7">
          <div className={`rounded-[1.5rem] border border-white/10 bg-gradient-to-br ${activeRoadmap.accent} p-[1px]`}>
            <div className="rounded-[calc(1.5rem-1px)] bg-slate-950/80 p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Selected roadmap</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">{activeRoadmap.title}</h3>
                  <p className="mt-2 max-w-xl text-slate-400">{activeRoadmap.short}</p>
                </div>
                <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-200">
                  {activeRoadmap.progress} complete
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Timeline</p>
                  <p className="mt-2 text-lg font-semibold text-white">{activeRoadmap.timeline}</p>
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Progress</p>
                  <div className="mt-2 h-2 rounded-full bg-slate-800">
                    <div className={`h-2 rounded-full bg-gradient-to-r ${activeRoadmap.accent}`} style={{ width: activeRoadmap.progress }} />
                  </div>
                  <p className="mt-2 text-sm text-slate-300">{activeRoadmap.progress} of the guided path is unlocked</p>
                </div>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="rounded-[1.25rem] border border-white/10 bg-slate-900/70 p-4">
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Resources</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-300">
                    {activeRoadmap.resources.map((resource) => (
                      <li key={resource} className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-cyan-300" />
                        {resource}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-slate-900/70 p-4">
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Projects</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-300">
                    {activeRoadmap.projects.map((project) => (
                      <li key={project} className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-violet-300" />
                        {project}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Certification</p>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-200">
                    {activeRoadmap.certification}
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  {activeRoadmap.milestones.map((milestone, index) => (
                    <div key={milestone} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10 text-sm font-semibold text-cyan-200">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-white">{milestone}</p>
                        <p className="text-sm text-slate-400">{index === 0 ? 'Start with foundations' : index === 1 ? 'Level up with guided projects' : 'Graduate with confidence'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default RoadmapSection;
