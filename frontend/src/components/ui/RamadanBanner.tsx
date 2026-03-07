import { useTranslation } from 'react-i18next';
import { useRamadanStore } from '../../stores/ramadanStore';

const STARS = [
  { cx: 8,  cy: 12, r: 1.1, delay: 0    },
  { cx: 22, cy: 5,  r: 0.7, delay: 0.7  },
  { cx: 38, cy: 18, r: 1.3, delay: 1.4  },
  { cx: 52, cy: 7,  r: 0.9, delay: 0.3  },
  { cx: 67, cy: 22, r: 0.6, delay: 1.0  },
  { cx: 79, cy: 9,  r: 1.0, delay: 0.5  },
  { cx: 91, cy: 16, r: 0.8, delay: 1.8  },
  { cx: 14, cy: 34, r: 0.7, delay: 1.2  },
  { cx: 31, cy: 42, r: 1.2, delay: 0.2  },
  { cx: 47, cy: 30, r: 0.5, delay: 0.9  },
  { cx: 63, cy: 38, r: 0.9, delay: 1.6  },
  { cx: 84, cy: 32, r: 0.7, delay: 0.4  },
  { cx: 95, cy: 45, r: 1.1, delay: 1.1  },
  { cx: 5,  cy: 52, r: 0.6, delay: 0.8  },
  { cx: 73, cy: 52, r: 0.8, delay: 1.3  },
];

export function RamadanBanner() {
  const { t } = useTranslation();
  const enabled = useRamadanStore((s) => s.enabled);

  if (!enabled) return null;

  return (
    <div
      className="relative overflow-hidden rounded-xl mb-6"
      style={{
        background: 'linear-gradient(135deg, #0c0623 0%, #1a0d52 35%, #2a1260 65%, #0c0623 100%)',
        border: '1px solid rgba(251, 191, 36, 0.22)',
        boxShadow: '0 4px 32px rgba(251, 191, 36, 0.07), 0 1px 8px rgba(0,0,0,0.3)',
      }}
    >
      {/* Twinkling star field */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 100 60"
      >
        <radialGradient id="rmbg" cx="15%" cy="50%" r="30%">
          <stop offset="0%"   stopColor="#fbbf24" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
        <rect x="0" y="0" width="100" height="60" fill="url(#rmbg)" />
        {STARS.map((s, i) => (
          <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="#fbbf24"
            className="ramadan-star" style={{ animationDelay: `${s.delay}s` }} />
        ))}
      </svg>

      {/* Bottom shimmer line */}
      <div className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.45), transparent)' }} />

      {/* Content */}
      <div className="relative flex items-center gap-5 px-5 py-4 sm:px-7 sm:py-5">
        {/* Crescent moon */}
        <div className="shrink-0 hidden sm:flex items-center justify-center">
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none"
            style={{ filter: 'drop-shadow(0 0 14px rgba(251,191,36,0.55))' }}>
            <path d="M34 8C22 8 13 17 13 29C13 41 22 50 34 50C26 50 19.5 43 19.5 35.5C19.5 28 25 20 34 8Z" fill="#fbbf24" />
            <circle cx="41" cy="13" r="2"   fill="#fbbf24" opacity="0.55" />
            <circle cx="45" cy="22" r="1.3" fill="#fbbf24" opacity="0.35" />
            <circle cx="39" cy="7"  r="1"   fill="#fbbf24" opacity="0.4"  />
          </svg>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-2xl font-bold tracking-wide mb-0.5"
            style={{ color: '#fbbf24', textShadow: '0 0 24px rgba(251,191,36,0.35)' }}>
            {t('ramadan.greeting')}
          </h3>
          <p className="text-sm" style={{ color: 'rgba(253, 230, 138, 0.8)' }}>
            {t('ramadan.subtext')}
          </p>
        </div>
      </div>
    </div>
  );
}
