import Button from '../components/ui/Button';

function ModulePage({ title, eyebrow, description, children }) {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8 lg:px-8 lg:py-12">
      <div className="glass rounded-2xl border border-white/10 p-8 lg:p-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">{title}</h1>
            <p className="mt-4 text-lg leading-8 text-slate-400">{description}</p>
          </div>
          <Button to="/" variant="secondary">
            Back to home
          </Button>
        </div>
      </div>

      <div className="space-y-6">{children}</div>
    </div>
  );
}

export default ModulePage;
