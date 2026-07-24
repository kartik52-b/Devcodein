import { Link } from 'react-router-dom';

function ModulePage({ title, eyebrow, description, children }) {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8 lg:px-8 lg:py-10">
      <div className="glass rounded-[2rem] border border-white/10 p-8 lg:p-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">{eyebrow}</p>
            <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">{title}</h1>
            <p className="mt-4 text-lg leading-8 text-slate-400">{description}</p>
          </div>
          <Link to="/" className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/20">
            Back to home
          </Link>
        </div>
      </div>

      <div className="space-y-6">{children}</div>
    </div>
  );
}

export default ModulePage;
