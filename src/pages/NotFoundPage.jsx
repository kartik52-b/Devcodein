import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center gap-5 px-6 text-center">
      <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">404</p>
      <h1 className="text-3xl font-semibold text-white sm:text-4xl">This page does not exist.</h1>
      <p className="max-w-xl text-slate-400">
        The link may be out of date, or the module may have moved. Head back to the platform and keep
        building.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          to="/"
          className="rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 px-5 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.02]"
        >
          Back to home
        </Link>
        <Link
          to="/modules/practice"
          className="rounded-full border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-white/20"
        >
          Open practice room
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
