import type { ReactNode } from 'react';

interface Props {
  icon: ReactNode;
  title: string;
  description: string;
}

export function EmptyState({ icon, title, description }: Props) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">{icon}</div>
      <p className="empty-state__title">{title}</p>
      <p className="empty-state__desc">{description}</p>
    </div>
  );
}
