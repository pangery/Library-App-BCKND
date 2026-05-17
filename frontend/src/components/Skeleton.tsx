interface Props {
  rows?: number;
}

export function SkeletonTable({ rows = 4 }: Props) {
  return (
    <div className="skeleton-table" aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skeleton-row">
          <div className="skeleton skeleton--circle" />
          <div className="skeleton skeleton--line skeleton--lg" />
          <div className="skeleton skeleton--line skeleton--sm" />
        </div>
      ))}
    </div>
  );
}
