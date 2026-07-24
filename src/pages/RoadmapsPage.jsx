import { useMemo, useState } from 'react';
import { ArrowRight, BookOpen, CheckCircle2, Compass, Sparkles, Target } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';

const initialRoadmaps = [
  {
    id: 'frontend',
    title: 'Frontend',
    short: 'Client interfaces, DOM manipulation, responsive designs, and product polish.',
    timeline: '8–10 weeks',
    resources: [
      { name: 'HTML5 & CSS3 structures', type: 'Documentation', url: '#' },
      { name: 'Modern JavaScript (ES6+)', type: 'Course', url: '#' },
      { name: 'React Component architecture', type: 'Tutorial', url: '#' },
      { name: 'Web Accessibility (WCAG 2.1)', type: 'Guide', url: '#' }
    ],
    projects: [
      { name: 'Interactive UI Dashboard', difficulty: 'Medium' },
      { name: 'Headless CMS Blog Site', difficulty: 'Hard' }
    ],
    certification: 'Meta Front-End Professional Certificate',
    accent: 'from-cyan-400 to-blue-500',
    milestones: [
      { id: 'fe-m1', label: 'Semantic HTML & Grid Layouts' },
      { id: 'fe-m2', label: 'Asynchronous Fetch Operations' },
      { id: 'fe-m3', label: 'React Hooks & State Routing' },
      { id: 'fe-m4', label: 'Optimization & Production Build' }
    ]
  },
  {
    id: 'backend',
    title: 'Backend',
    short: 'APIs, relational & NoSQL databases, caching, and server architecture.',
    timeline: '10–12 weeks',
    resources: [
      { name: 'Node.js event loop logic', type: 'Article', url: '#' },
      { name: 'REST API design patterns', type: 'Course', url: '#' },
      { name: 'PostgreSQL optimization indexing', type: 'Documentation', url: '#' }
    ],
    projects: [
      { name: 'Task Manager Auth API', difficulty: 'Medium' },
      { name: 'Real-time Message Broker', difficulty: 'Hard' }
    ],
    certification: 'Backend Systems Developer Certificate',
    accent: 'from-violet-500 to-fuchsia-500',
    milestones: [
      { id: 'be-m1', label: 'HTTP Server Setup & Routing' },
      { id: 'be-m2', label: 'Database Schema & Query Design' },
      { id: 'be-m3', label: 'JWT Token Security Shielding' },
      { id: 'be-m4', label: 'Redis Cache & Cluster Tuning' }
    ]
  },
  {
    id: 'react',
    title: 'React',
    short: 'Deep dive into rendering lifecycles, states, and hooks.',
    timeline: '6–8 weeks',
    resources: [
      { name: 'Custom hooks implementations', type: 'Guide', url: '#' },
      { name: 'Redux Toolkit state management', type: 'Course', url: '#' }
    ],
    projects: [
      { name: 'Task Board Kanban workspace', difficulty: 'Medium' },
      { name: 'Interactive Graphing Tool', difficulty: 'Hard' }
    ],
    certification: 'React Expert Certification',
    accent: 'from-sky-500 to-indigo-500',
    milestones: [
      { id: 're-m1', label: 'Functional Props & Render Cycles' },
      { id: 're-m2', label: 'Context API & Global States' },
      { id: 're-m3', label: 'Lazy Loading & Suspense renders' }
    ]
  },
  {
    id: 'node',
    title: 'Node.js',
    short: 'Express web servers, streams, networking protocols, and performance.',
    timeline: '7–9 weeks',
    resources: [
      { name: 'Express request/response cycle', type: 'Article', url: '#' },
      { name: 'Socket.io real-time streaming', type: 'Guide', url: '#' }
    ],
    projects: [
      { name: 'Collaborative Editor Room', difficulty: 'Hard' }
    ],
    certification: 'OpenJS Node.js Application Developer',
    accent: 'from-emerald-500 to-lime-500',
    milestones: [
      { id: 'no-m1', label: 'Event Loop & Node Modules' },
      { id: 'no-m2', label: 'Streams & Buffered I/O operations' },
      { id: 'no-m3', label: 'Clustering & Load Balancing' }
    ]
  },
  {
    id: 'python',
    title: 'Python',
    short: 'Automation scripting, backend APIs, data science, and scripting.',
    timeline: '6–8 weeks',
    resources: [
      { name: 'Python collections & list comps', type: 'Guide', url: '#' },
      { name: 'FastAPI microservices frameworks', type: 'Tutorial', url: '#' }
    ],
    projects: [
      { name: 'Automation CSV Parser tool', difficulty: 'Easy' },
      { name: 'E-commerce microservice', difficulty: 'Hard' }
    ],
    certification: 'Python Institute PCAP',
    accent: 'from-emerald-400 to-cyan-400',
    milestones: [
      { id: 'py-m1', label: 'Data Structures & Iterators' },
      { id: 'py-m2', label: 'FastAPI REST Endpoint structure' },
      { id: 'py-m3', label: 'Web Scraping & CSV parsing pipelines' },
      { id: 'py-m4', label: 'Concurrency with AsyncIO' }
    ]
  },
  {
    id: 'java',
    title: 'Java',
    short: 'Object-oriented programming, Spring framework, concurrency, and VMs.',
    timeline: '9–11 weeks',
    resources: [
      { name: 'Java collections framework hierarchy', type: 'Article', url: '#' },
      { name: 'Spring Boot REST controller builds', type: 'Course', url: '#' }
    ],
    projects: [
      { name: 'E-commerce inventory tracker', difficulty: 'Medium' }
    ],
    certification: 'Oracle Java Associate',
    accent: 'from-orange-500 to-amber-500',
    milestones: [
      { id: 'ja-m1', label: 'OOP Encapsulation & Inheritance' },
      { id: 'ja-m2', label: 'Spring Boot Controllers & Hibernate' },
      { id: 'ja-m3', label: 'Multi-threading & Synchronized Blocks' },
      { id: 'ja-m4', label: 'JVM Heap profiling diagnostics' }
    ]
  },
  {
    id: 'cpp',
    title: 'C++',
    short: 'Pointers, reference memory mapping, templates, STL, and low-level code.',
    timeline: '10–12 weeks',
    resources: [
      { name: 'Modern C++ Memory Models', type: 'Guide', url: '#' },
      { name: 'C++ STL Container operations', type: 'Documentation', url: '#' }
    ],
    projects: [
      { name: 'Memory Pool allocator build', difficulty: 'Hard' }
    ],
    certification: 'C++ Certified Associate Programmer',
    accent: 'from-rose-500 to-red-500',
    milestones: [
      { id: 'cpp-m1', label: 'Pointers & Dynamic Memory management' },
      { id: 'cpp-m2', label: 'Templates & Generic programming structures' },
      { id: 'cpp-m3', label: 'Lock-Free data structure architectures' }
    ]
  },
  {
    id: 'ai',
    title: 'AI',
    short: 'Prompt engineering, vector DBs, token layers, and model fine-tuning.',
    timeline: '8–10 weeks',
    resources: [
      { name: 'OpenAI API key configuration guides', type: 'Tutorial', url: '#' },
      { name: 'Retrieval Augmented Generation (RAG)', type: 'Concept', url: '#' }
    ],
    projects: [
      { name: 'RAG PDF Vector Search engine', difficulty: 'Hard' }
    ],
    certification: 'Generative AI Engineer Specialist',
    accent: 'from-fuchsia-500 to-purple-500',
    milestones: [
      { id: 'ai-m1', label: 'Tokenizer & Prompt structures setup' },
      { id: 'ai-m2', label: 'Vector Indexing with Pinecone DB' },
      { id: 'ai-m3', label: 'Model Fine-tuning hyperparams' }
    ]
  },
  {
    id: 'ml',
    title: 'Machine Learning',
    short: 'Mathematical matrices, regression layers, Pandas, PyTorch models.',
    timeline: '12–14 weeks',
    resources: [
      { name: 'Linear regression math basics', type: 'Article', url: '#' },
      { name: 'PyTorch deep neural networks', type: 'Course', url: '#' }
    ],
    projects: [
      { name: 'Image classifier implementation', difficulty: 'Hard' }
    ],
    certification: 'Machine Learning Developer Certificate',
    accent: 'from-blue-500 to-cyan-500',
    milestones: [
      { id: 'ml-m1', label: 'Scikit-learn Regression models' },
      { id: 'ml-m2', label: 'Neural networks weight gradients' },
      { id: 'ml-m3', label: 'Model hyperparams optimization grid' },
      { id: 'ml-m4', label: 'Model execution container deployment' }
    ]
  },
  {
    id: 'android',
    title: 'Android',
    short: 'Kotlin scripting, Jetpack Compose layouts, background intents.',
    timeline: '8–10 weeks',
    resources: [
      { name: 'Kotlin coroutines concurrency flow', type: 'Article', url: '#' },
      { name: 'Jetpack Compose layout components', type: 'Documentation', url: '#' }
    ],
    projects: [
      { name: 'Habit tracking native application', difficulty: 'Medium' }
    ],
    certification: 'Google Associate Android Developer',
    accent: 'from-green-500 to-emerald-500',
    milestones: [
      { id: 'an-m1', label: 'XML UI & Jetpack Compose setup' },
      { id: 'an-m2', label: 'SQLite DB with Room integration' },
      { id: 'an-m3', label: 'Background sync Service triggers' }
    ]
  },
  {
    id: 'cybersec',
    title: 'Cyber Security',
    short: 'Threat modeling, web exploits, network sniffing, and cloud compliance.',
    timeline: '10–12 weeks',
    resources: [
      { name: 'OWASP Top 10 vulnerabilities list', type: 'Guide', url: '#' },
      { name: 'Threat Modeling methodology structures', type: 'Article', url: '#' }
    ],
    projects: [
      { name: 'Security Auditing network analyzer', difficulty: 'Hard' }
    ],
    certification: 'CompTIA Security+ Certification',
    accent: 'from-yellow-500 to-orange-500',
    milestones: [
      { id: 'cs-m1', label: 'Port Scanning & Packet analyses' },
      { id: 'cs-m2', label: 'SQL Injections & XSS exploits' },
      { id: 'cs-m3', label: 'Cryptographic structures validation' },
      { id: 'cs-m4', label: 'IAM policy cloud compliance checks' }
    ]
  }
];

function RoadmapsPage() {
  const { activeProfile, toggleMilestone, addXp } = useProfile();
  const [selectedRoadmapId, setSelectedRoadmapId] = useState('frontend');

  const roadmapData = useMemo(() => {
    return initialRoadmaps.map((r) => {
      const completedIds = r.milestones.filter((m) => activeProfile.completedMilestones.includes(m.id));
      const progressPercent = r.milestones.length > 0 ? Math.round((completedIds.length / r.milestones.length) * 100) : 0;

      return {
        ...r,
        progress: progressPercent,
        milestones: r.milestones.map((m) => ({
          ...m,
          completed: activeProfile.completedMilestones.includes(m.id)
        }))
      };
    });
  }, [activeProfile.completedMilestones]);

  const activeRoadmap = roadmapData.find((r) => r.id === selectedRoadmapId) || roadmapData[0];

  const handleToggleCheckpoint = (milestoneId, isCompletedAlready) => {
    toggleMilestone(milestoneId);

    if (!isCompletedAlready) {
      addXp(100);
      alert('Milestone checked! Awarded +100 XP.');
    }
  };

  const completedCount = activeRoadmap.milestones.filter((m) => m.completed).length;
  const nextMilestone = activeRoadmap.milestones.find((m) => !m.completed);

  return (
    <div className="min-h-screen bg-[#050816] p-4 text-slate-100 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="glass rounded-[2rem] border border-white/10 p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.35em] text-[#5ed29c]">Guided growth system</p>
              <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Turn each milestone into a visible step toward your next engineering role</h1>
              <p className="mt-4 text-slate-400">Choose a path, track authentic checkpoints, and build confidence through structured practice instead of passive content consumption.</p>
            </div>
            <div className="rounded-[1.2rem] border border-[#5ed29c]/20 bg-[#5ed29c]/10 px-4 py-3 text-sm text-[#5ed29c]">
              <div className="flex items-center gap-2">
                <Compass size={16} />
                <span>{completedCount}/{activeRoadmap.milestones.length} checkpoints done</span>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <section className="glass rounded-[2rem] border border-white/10 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Choose a track</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Learning pathways</h2>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">{roadmapData.length} paths</div>
            </div>
            <div className="space-y-3">
              {roadmapData.map((roadmap) => {
                const isActive = roadmap.id === selectedRoadmapId;
                return (
                  <button key={roadmap.id} onClick={() => setSelectedRoadmapId(roadmap.id)} className={`w-full rounded-[1.25rem] border p-4 text-left transition-all ${isActive ? 'border-[#5ed29c]/40 bg-[#5ed29c]/10 shadow-lg shadow-[#07100c]' : 'border-white/10 bg-slate-950/60 hover:border-white/20 hover:bg-white/5'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r ${roadmap.accent}`} />
                        <span className="text-sm font-semibold text-white">{roadmap.title}</span>
                      </div>
                      <span className="text-xs font-semibold text-[#5ed29c]">{roadmap.progress}%</span>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-slate-400">{roadmap.short}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="glass rounded-[2rem] border border-white/10 p-6">
            <div className={`rounded-[1.5rem] border border-white/10 bg-gradient-to-br ${activeRoadmap.accent} p-[1px]`}>
              <div className="rounded-[calc(1.5rem-1px)] bg-slate-950/85 p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Selected path</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">{activeRoadmap.title} engineering</h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">{activeRoadmap.short}</p>
                  </div>
                  <div className="rounded-full border border-[#5ed29c]/20 bg-[#5ed29c]/10 px-3 py-2 text-sm text-[#5ed29c]">
                    {activeRoadmap.progress}% complete
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-[1rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Timeline</p>
                    <p className="mt-2 text-lg font-semibold text-white">{activeRoadmap.timeline}</p>
                  </div>
                  <div className="rounded-[1rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Next milestone</p>
                    <p className="mt-2 text-sm text-slate-300">{nextMilestone ? nextMilestone.label : 'All milestones complete!'}</p>
                  </div>
                  <div className="rounded-[1rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Certification</p>
                    <p className="mt-2 text-sm text-slate-300">{activeRoadmap.certification}</p>
                  </div>
                </div>

                <div className="mt-6 rounded-[1.25rem] border border-white/10 bg-slate-950/70 p-4">
                  <div className="flex items-center gap-2">
                    <Target size={16} className="text-[#5ed29c]" />
                    <h3 className="text-lg font-semibold text-white">Milestones</h3>
                  </div>
                  <div className="mt-4 space-y-3">
                    {activeRoadmap.milestones.map((milestone, index) => (
                      <button key={milestone.id} onClick={() => handleToggleCheckpoint(milestone.id, milestone.completed)} className={`flex w-full items-center justify-between rounded-[1rem] border px-4 py-3 text-left transition ${milestone.completed ? 'border-[#5ed29c]/25 bg-[#5ed29c]/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`flex h-7 w-7 items-center justify-center rounded-full border ${milestone.completed ? 'border-[#5ed29c] bg-[#5ed29c]/10 text-[#5ed29c]' : 'border-white/10 text-slate-400'}`}>
                            {milestone.completed ? <CheckCircle2 size={14} /> : index + 1}
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${milestone.completed ? 'text-[#5ed29c]' : 'text-slate-200'}`}>{milestone.label}</p>
                            <p className="text-xs text-slate-500">{milestone.completed ? 'Completed' : 'Tap to mark complete'}</p>
                          </div>
                        </div>
                        <ArrowRight size={16} className="text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/70 p-4">
                    <div className="flex items-center gap-2">
                      <BookOpen size={16} className="text-[#5ed29c]" />
                      <h3 className="text-lg font-semibold text-white">Resources</h3>
                    </div>
                    <div className="mt-4 space-y-2">
                      {activeRoadmap.resources.map((resource) => (
                        <a key={resource.name} href={resource.url} className="flex items-center justify-between rounded-[0.9rem] border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 transition hover:border-[#5ed29c]/20 hover:bg-[#5ed29c]/10">
                          <span>{resource.name}</span>
                          <span className="text-xs uppercase tracking-[0.25em] text-slate-500">{resource.type}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/70 p-4">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-[#5ed29c]" />
                      <h3 className="text-lg font-semibold text-white">Projects</h3>
                    </div>
                    <div className="mt-4 space-y-2">
                      {activeRoadmap.projects.map((project) => (
                        <div key={project.name} className="flex items-center justify-between rounded-[0.9rem] border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
                          <span>{project.name}</span>
                          <span className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.25em] ${project.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-300' : project.difficulty === 'Medium' ? 'bg-indigo-500/10 text-indigo-300' : 'bg-rose-500/10 text-rose-300'}`}>{project.difficulty}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default RoadmapsPage;
