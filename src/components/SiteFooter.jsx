import { Link } from 'react-router-dom';

const footerLinks = [
  { to: '/product-experience', label: 'Product experience' },
  { to: '/modules/practice', label: 'Practice' },
  { to: '/modules/roadmaps', label: 'Roadmaps' },
  { to: '/modules/leaderboard', label: 'Leaderboard' },
  { to: '/modules/ai-mentor', label: 'AI mentor' }
];

function SiteFooter() {
  return (
    <footer className="mx-auto mt-12 max-w-7xl border-t border-white/10 px-6 py-8 text-sm text-slate-400 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p>© 2026 DevVerse. Crafted for ambitious builders.</p>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-2">
          {footerLinks.map((link) => (
            <Link key={link.to} to={link.to} className="rounded-sm transition hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

export default SiteFooter;
