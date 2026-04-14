import { useNavigate } from 'react-router-dom';
import './BackButton.css';

export interface BackButtonProps {
  fallbackTo?: string;
  label?: string;
}

export function BackButton({ fallbackTo = '/', label = 'Back to catalog' }: BackButtonProps) {
  const navigate = useNavigate();
  const handleClick = () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx;
    if (typeof idx === 'number' && idx > 0) {
      navigate(-1);
    } else {
      navigate(fallbackTo);
    }
  };
  return (
    <button type="button" className="back-button" onClick={handleClick}>
      <svg
        aria-hidden="true"
        width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
      <span>{label}</span>
    </button>
  );
}
