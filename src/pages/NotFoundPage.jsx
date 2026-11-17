import Button from '../components/ui/Button';

function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="eyebrow">404</p>
      <h1 className="text-3xl font-semibold text-white sm:text-4xl">This page does not exist.</h1>
      <p className="max-w-xl text-slate-400">
        The link may be out of date, or the module may have moved. Head back to the platform and keep
        building.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button to="/" variant="primary">
          Back to home
        </Button>
        <Button to="/modules/practice" variant="secondary">
          Open practice room
        </Button>
      </div>
    </div>
  );
}

export default NotFoundPage;
