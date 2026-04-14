import { STAT_MAX } from '../../../config/catalog';
import { statBand } from '../../../utils/formatStat';
import { cx } from '../../../utils/classNames';
import './StatBar.css';

export interface StatBarProps {
  label: string;
  value: number;
  max?: number;
  id?: string;
  className?: string;
}

export function StatBar({ label, value, max = STAT_MAX, id, className }: StatBarProps) {
  const pct = Math.min(Math.max(value, 0), max) / max * 100;
  const band = statBand(value);
  return (
    <div
      className={cx('stat-bar', className)}
      role="img"
      aria-label={`${label} ${value} out of ${max}`}
      id={id}
    >
      <span className="stat-bar__label">{label}</span>
      <span className="stat-bar__value">{value}</span>
      <div className="stat-bar__track" aria-hidden="true">
        <div
          className="stat-bar__fill"
          data-band={band}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
