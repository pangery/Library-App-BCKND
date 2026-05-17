import { IconSearch } from './icons';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export function SearchField({ value, onChange, placeholder }: Props) {
  return (
    <div className="search">
      <IconSearch className="search__icon" />
      <input
        type="search"
        className="search__input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {value && (
        <button
          type="button"
          className="search__clear"
          onClick={() => onChange('')}
          aria-label="Vymazat hledání"
        >
          ×
        </button>
      )}
    </div>
  );
}
