import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import LanguageExplorer from '../components/LanguageExplorer';
import DsaBattleArena from '../components/DsaBattleArena';
import Button from '../components/ui/Button';

const PAGE_TITLE = 'Product experience · DevVerse';
const PAGE_DESCRIPTION =
  'See the DevVerse language explorer and DSA battle arena side by side before you sign up.';

/**
 * Dedicated home for the product previews that used to sit on the landing
 * page. The same components render here at full width, so nothing is lost.
 */
function ProductExperiencePage() {
  useEffect(() => {
    const previousTitle = document.title;
    const meta = document.querySelector('meta[name="description"]');
    const previousDescription = meta?.getAttribute('content');

    document.title = PAGE_TITLE;
    if (meta) meta.setAttribute('content', PAGE_DESCRIPTION);

    return () => {
      document.title = previousTitle;
      if (meta && previousDescription) meta.setAttribute('content', previousDescription);
    };
  }, []);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-12 lg:px-8 lg:py-16">
      <Link
        to="/"
        className="self-start rounded-sm text-sm text-slate-400 transition hover:text-white"
      >
        ← Back to home
      </Link>

      <section className="glass rounded-2xl border border-white/10 p-8 lg:p-12">
        <p className="eyebrow">Product experience</p>
        <h1 className="mt-2 max-w-3xl text-3xl font-semibold text-white sm:text-4xl">
          A polished snapshot of the full product experience.
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-400">
          These are the same interactive previews used across DevVerse: a live language explorer
          and the DSA battle arena. Sign in to open the full modules with saved progress.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button to="/auth?mode=register" variant="primary" size="lg">
            Create your account
          </Button>
          <Button to="/modules/practice" variant="secondary" size="lg">
            Browse practice
          </Button>
        </div>
      </section>

      <section aria-label="Language explorer preview" className="glass rounded-2xl border border-white/10 p-6 lg:p-8">
        <LanguageExplorer />
      </section>

      <section aria-label="DSA battle arena preview" className="glass rounded-2xl border border-white/10 p-6 lg:p-8">
        <DsaBattleArena />
      </section>
    </div>
  );
}

export default ProductExperiencePage;