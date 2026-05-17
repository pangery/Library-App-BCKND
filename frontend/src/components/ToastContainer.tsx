import type { Toast } from '../hooks/useToast';
import { IconAlert, IconCheck } from './icons';

interface Props {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}

function ToastIcon({ type }: { type: Toast['type'] }) {
  if (type === 'success') return <IconCheck className="toast__svg" />;
  if (type === 'error') return <IconAlert className="toast__svg" />;
  return null;
}

export function ToastContainer({ toasts, onDismiss }: Props) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast--${toast.type}`} role="alert">
          <ToastIcon type={toast.type} />
          <span className="toast__msg">{toast.message}</span>
          <button
            type="button"
            className="toast__close"
            onClick={() => onDismiss(toast.id)}
            aria-label="Zavřít"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
