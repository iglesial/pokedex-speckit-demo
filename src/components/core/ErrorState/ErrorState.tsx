import './ErrorState.css';

export interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = "Couldn't load the Pokédex.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="error-state" role="alert">
      <p className="error-state__message">{message}</p>
      {onRetry && (
        <button type="button" className="error-state__retry" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
