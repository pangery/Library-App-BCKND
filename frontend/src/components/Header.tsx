import { IconBook } from './icons';

interface Props {
  authorCount: number;
  bookCount: number;
  onRefresh: () => void;
  refreshing: boolean;
}

export function Header({ authorCount, bookCount, onRefresh, refreshing }: Props) {
  return (
    <header className="header">
      <div className="header__hero">
        <div className="header__brand">
          <div className="header__logo">
            <IconBook className="header__logo-icon" />
          </div>
          <div>
            <h1 className="header__title">Knihovna</h1>
            <p className="header__subtitle">
              Správa autorů a knih · jedna aplikace
            </p>
          </div>
        </div>
        <button
          type="button"
          className={`btn btn--ghost btn--icon ${refreshing ? 'btn--spin' : ''}`}
          onClick={onRefresh}
          disabled={refreshing}
          aria-label="Obnovit data"
          title="Obnovit"
        >
          <svg viewBox="0 0 24 24" fill="none" className="btn__svg" aria-hidden>
            <path
              d="M4 12a8 8 0 0 1 13.5-5.7M20 12a8 8 0 0 1-13.5 5.7"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
            <path
              d="M17 4v4h-4M7 20v-4h4"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="header__stats">
        <div className="stat stat--authors">
          <span className="stat__value">{authorCount}</span>
          <span className="stat__label">Autorů</span>
        </div>
        <div className="stat stat--books">
          <span className="stat__value">{bookCount}</span>
          <span className="stat__label">Knih</span>
        </div>
        {authorCount > 0 && bookCount > 0 && (
          <div className="stat stat--ratio">
            <span className="stat__value">
              {(bookCount / authorCount).toFixed(1)}
            </span>
            <span className="stat__label">Knih / autor</span>
          </div>
        )}
      </div>
    </header>
  );
}
