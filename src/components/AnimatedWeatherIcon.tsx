import React, { useId } from 'react';

export interface AnimatedWeatherIconProps {
  iconName: string;
  size?: 'sm' | 'md' | 'lg';
  windSpeed?: number;
  temp?: number;
  className?: string;
}

export const AnimatedWeatherIcon: React.FC<AnimatedWeatherIconProps> = ({
  iconName,
  size = 'lg',
  windSpeed = 12,
  temp = 15,
  className = '',
}) => {
  const uid = useId().replace(/:/g, '');

  // Calculate dynamic animation speeds reactive to windSpeed
  const windFactor = Math.max(0.5, Math.min(2.4, (windSpeed || 10) / 14));
  const cloudDuration = (4.2 / windFactor).toFixed(2);
  const sunSpinDuration = (18 / Math.max(0.7, windFactor * 0.85)).toFixed(1);
  const rainDuration = (0.95 / Math.max(0.8, windFactor * 0.9)).toFixed(2);

  const dims =
    size === 'sm' ? 'w-6 h-6' : size === 'md' ? 'w-9 h-9' : 'w-14 h-14 sm:w-16 sm:h-16';

  const isWarm = temp >= 20;

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${dims} ${className}`}>
      <svg
        viewBox="0 0 64 64"
        className="w-full h-full overflow-visible"
        aria-hidden="true"
      >
        <defs>
          {/* Solar Gradient */}
          <radialGradient id={`sunGrad-${uid}`} cx="38%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fef9c3" />
            <stop offset="55%" stopColor={isWarm ? '#fbbf24' : '#facc15'} />
            <stop offset="100%" stopColor={isWarm ? '#ea580c' : '#d97706'} />
          </radialGradient>

          {/* Solar Outer Glow */}
          <radialGradient id={`sunGlow-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="30%" stopColor="#fde047" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>

          {/* Lunar Gradient */}
          <linearGradient id={`moonGrad-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="60%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>

          {/* Light Cloud Gradient */}
          <linearGradient id={`cloudLight-${uid}`} x1="20%" y1="10%" x2="80%" y2="95%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="65%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>

          {/* Storm / Dark Cloud Gradient */}
          <linearGradient id={`cloudDark-${uid}`} x1="20%" y1="10%" x2="80%" y2="95%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="55%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>

          {/* Raindrop Gradient */}
          <linearGradient id={`rainGrad-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* 1. SUN (CLEAR DAY) */}
        {iconName === 'sun' && (
          <g>
            {/* Pulsing Solar Corona */}
            <circle
              cx="32"
              cy="32"
              r="26"
              fill={`url(#sunGlow-${uid})`}
              style={{
                transformOrigin: '32px 32px',
                animation: 'svgSunPulse 3.2s ease-in-out infinite',
              }}
            />

            {/* Secondary Counter-Rotating Rays */}
            <g
              style={{
                transformOrigin: '32px 32px',
                animation: `svgSunSpinReverse ${Number(sunSpinDuration) * 1.4}s linear infinite`,
              }}
              opacity="0.55"
            >
              {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((angle) => (
                <line
                  key={angle}
                  x1="32"
                  y1="8"
                  x2="32"
                  y2="13"
                  stroke="#fde047"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  transform={`rotate(${angle} 32 32)`}
                />
              ))}
            </g>

            {/* Primary Rotating Solar Rays */}
            <g
              style={{
                transformOrigin: '32px 32px',
                animation: `svgSunSpin ${sunSpinDuration}s linear infinite`,
              }}
            >
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                <line
                  key={angle}
                  x1="32"
                  y1="4.5"
                  x2="32"
                  y2="12"
                  stroke="#fbbf24"
                  strokeWidth="3"
                  strokeLinecap="round"
                  transform={`rotate(${angle} 32 32)`}
                />
              ))}
            </g>

            {/* Sun Core */}
            <circle
              cx="32"
              cy="32"
              r="14.5"
              fill={`url(#sunGrad-${uid})`}
              stroke="#fef08a"
              strokeWidth="1"
            />
          </g>
        )}

        {/* 2. MOON (CLEAR NIGHT) */}
        {iconName === 'moon' && (
          <g>
            {/* Twinkling Stars */}
            <circle
              cx="14"
              cy="16"
              r="1.8"
              fill="#fef9c3"
              style={{
                transformOrigin: '14px 16px',
                animation: 'svgStarTwinkle 2.4s ease-in-out infinite',
              }}
            />
            <circle
              cx="50"
              cy="14"
              r="1.5"
              fill="#e0f2fe"
              style={{
                transformOrigin: '50px 14px',
                animation: 'svgStarTwinkle 3.1s ease-in-out 0.8s infinite',
              }}
            />
            <circle
              cx="48"
              cy="46"
              r="1.3"
              fill="#fde68a"
              style={{
                transformOrigin: '48px 46px',
                animation: 'svgStarTwinkle 2.8s ease-in-out 1.4s infinite',
              }}
            />

            {/* Rocking Crescent Moon */}
            <g
              style={{
                transformOrigin: '32px 32px',
                animation: 'svgMoonRock 4.5s ease-in-out infinite',
              }}
            >
              <path
                d="M38 14A18 18 0 1 0 50 38A14.5 14.5 0 1 1 38 14Z"
                fill={`url(#moonGrad-${uid})`}
                stroke="#fef08a"
                strokeWidth="0.8"
              />
            </g>
          </g>
        )}

        {/* 3. PARTLY CLOUDY (CLOUD + SUN) */}
        {iconName === 'cloud-sun' && (
          <g>
            {/* Animated Sun in Upper Left */}
            <g transform="translate(-7, -7)">
              <circle
                cx="28"
                cy="26"
                r="17"
                fill={`url(#sunGlow-${uid})`}
                style={{
                  transformOrigin: '28px 26px',
                  animation: 'svgSunPulse 3s ease-in-out infinite',
                }}
              />
              <g
                style={{
                  transformOrigin: '28px 26px',
                  animation: `svgSunSpin ${sunSpinDuration}s linear infinite`,
                }}
              >
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                  <line
                    key={angle}
                    x1="28"
                    y1="7"
                    x2="28"
                    y2="12"
                    stroke="#fbbf24"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    transform={`rotate(${angle} 28 26)`}
                  />
                ))}
              </g>
              <circle cx="28" cy="26" r="10.5" fill={`url(#sunGrad-${uid})`} />
            </g>

            {/* Drifting Foreground Cloud */}
            <g
              style={{
                animation: `svgCloudDrift ${cloudDuration}s ease-in-out infinite`,
              }}
            >
              <path
                d="M21 48H47C52.5 48 56.5 44 56.5 38.8C56.5 34.1 53 30.3 48.4 29.7C46.9 22.8 40.8 18 33.5 18C25.6 18 19.1 24 18.3 31.6C13.9 32.5 10.8 36.3 10.8 40.8C10.8 45.1 15.1 48 21 48Z"
                fill={`url(#cloudLight-${uid})`}
                stroke="rgba(255,255,255,0.6)"
                strokeWidth="1"
              />
            </g>
          </g>
        )}

        {/* 4. OVERCAST CLOUDS */}
        {iconName === 'cloud' && (
          <g>
            {/* Back Parallax Cloud */}
            <g
              style={{
                animation: `svgCloudDriftAlt ${Number(cloudDuration) * 1.25}s ease-in-out infinite`,
              }}
              opacity="0.75"
            >
              <path
                d="M24 38H49C53.5 38 57 34.5 57 30C57 25.8 53.8 22.4 49.6 22C48.2 16 42.8 12 36.2 12C29.2 12 23.5 17.2 22.8 24C18.8 24.8 16 28.2 16 32.2C16 36 19.6 38 24 38Z"
                fill={`url(#cloudDark-${uid})`}
              />
            </g>

            {/* Front Volumetric Cloud */}
            <g
              style={{
                animation: `svgCloudDrift ${cloudDuration}s ease-in-out infinite`,
              }}
            >
              <path
                d="M18 49H46C51.5 49 55.8 44.8 55.8 39.5C55.8 34.6 52.1 30.6 47.4 30C45.8 23 39.6 18 32.2 18C24.1 18 17.5 24.2 16.7 32C12.2 32.9 9 36.8 9 41.5C9 46 13.2 49 18 49Z"
                fill={`url(#cloudLight-${uid})`}
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="1"
              />
            </g>
          </g>
        )}

        {/* 5. FOG / MIST */}
        {iconName === 'cloud-fog' && (
          <g>
            <g
              style={{
                animation: `svgCloudDrift ${cloudDuration}s ease-in-out infinite`,
              }}
            >
              <path
                d="M19 39H46C51 39 54.8 35.4 54.8 30.6C54.8 26.2 51.5 22.6 47.1 22C45.6 15.8 39.8 11.4 32.8 11.4C25.2 11.4 19.1 16.9 18.3 23.8C14.1 24.6 11.2 28.1 11.2 32.2C11.2 36.2 14.8 39 19 39Z"
                fill={`url(#cloudLight-${uid})`}
              />
            </g>

            {/* Animated Mist Bars */}
            <line
              x1="14"
              y1="45"
              x2="50"
              y2="45"
              stroke="#cbd5e1"
              strokeWidth="3"
              strokeLinecap="round"
              style={{ animation: 'svgFogSlide 3.2s ease-in-out infinite' }}
            />
            <line
              x1="18"
              y1="51"
              x2="46"
              y2="51"
              stroke="#94a3b8"
              strokeWidth="3"
              strokeLinecap="round"
              style={{ animation: 'svgFogSlide 3.8s ease-in-out 0.9s infinite' }}
            />
            <line
              x1="12"
              y1="57"
              x2="42"
              y2="57"
              stroke="#64748b"
              strokeWidth="2.6"
              strokeLinecap="round"
              style={{ animation: 'svgFogSlide 4.2s ease-in-out 1.6s infinite' }}
            />
          </g>
        )}

        {/* 6. DRIZZLE / RAIN / HEAVY RAIN */}
        {(iconName === 'cloud-drizzle' ||
          iconName === 'cloud-rain' ||
          iconName === 'cloud-rain-heavy') && (
          <g>
            {/* Back Storm Cloud for heavy rain */}
            {iconName === 'cloud-rain-heavy' && (
              <g
                style={{
                  animation: `svgCloudDriftAlt ${Number(cloudDuration) * 0.9}s ease-in-out infinite`,
                }}
                opacity="0.8"
              >
                <path
                  d="M23 35H49C53.2 35 56.5 31.8 56.5 27.5C56.5 23.5 53.5 20.3 49.5 19.9C48.1 14.3 42.9 10.5 36.6 10.5C29.9 10.5 24.4 15.4 23.7 21.8C19.9 22.6 17.2 25.8 17.2 29.6C17.2 33.2 20.5 35 23 35Z"
                  fill={`url(#cloudDark-${uid})`}
                />
              </g>
            )}

            {/* Main Cloud */}
            <g
              style={{
                animation: `svgCloudDrift ${cloudDuration}s ease-in-out infinite`,
              }}
            >
              <path
                d="M18 42H46C51.5 42 55.5 38 55.5 33C55.5 28.4 52 24.6 47.4 24C45.8 17.4 39.8 12.6 32.5 12.6C24.6 12.6 18.1 18.5 17.3 26C12.9 26.8 9.8 30.5 9.8 35C9.8 39.2 13.6 42 18 42Z"
                fill={
                  iconName === 'cloud-drizzle'
                    ? `url(#cloudLight-${uid})`
                    : `url(#cloudDark-${uid})`
                }
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="1"
              />
            </g>

            {/* Animated Falling Raindrops */}
            {(iconName === 'cloud-drizzle'
              ? [
                  { x: 22, delay: '0s' },
                  { x: 32, delay: '0.4s' },
                  { x: 42, delay: '0.8s' },
                ]
              : iconName === 'cloud-rain'
              ? [
                  { x: 20, delay: '0s' },
                  { x: 28, delay: '0.25s' },
                  { x: 36, delay: '0.55s' },
                  { x: 44, delay: '0.15s' },
                ]
              : [
                  { x: 17, delay: '0s' },
                  { x: 24, delay: '0.18s' },
                  { x: 31, delay: '0.36s' },
                  { x: 38, delay: '0.12s' },
                  { x: 45, delay: '0.45s' },
                ]
            ).map((drop, i) => (
              <line
                key={i}
                x1={drop.x}
                y1="45"
                x2={drop.x - 2.5}
                y2={iconName === 'cloud-drizzle' ? '49.5' : '53'}
                stroke={`url(#rainGrad-${uid})`}
                strokeWidth={iconName === 'cloud-rain-heavy' ? '2.6' : '2.2'}
                strokeLinecap="round"
                style={{
                  animation: `svgRainFall ${
                    iconName === 'cloud-rain-heavy'
                      ? (Number(rainDuration) * 0.72).toFixed(2)
                      : rainDuration
                  }s linear ${drop.delay} infinite`,
                }}
              />
            ))}
          </g>
        )}

        {/* 7. SNOW */}
        {iconName === 'cloud-snow' && (
          <g>
            <g
              style={{
                animation: `svgCloudDrift ${cloudDuration}s ease-in-out infinite`,
              }}
            >
              <path
                d="M18 42H46C51.5 42 55.5 38 55.5 33C55.5 28.4 52 24.6 47.4 24C45.8 17.4 39.8 12.6 32.5 12.6C24.6 12.6 18.1 18.5 17.3 26C12.9 26.8 9.8 30.5 9.8 35C9.8 39.2 13.6 42 18 42Z"
                fill={`url(#cloudLight-${uid})`}
                stroke="rgba(255,255,255,0.6)"
                strokeWidth="1"
              />
            </g>

            {/* Tumbling Snowflakes */}
            {[
              { cx: 21, cy: 48, delay: '0s' },
              { cx: 32, cy: 50, delay: '0.6s' },
              { cx: 43, cy: 48, delay: '1.2s' },
            ].map((flake, i) => (
              <g
                key={i}
                style={{
                  transformOrigin: `${flake.cx}px ${flake.cy}px`,
                  animation: `svgSnowFall 2.2s ease-in-out ${flake.delay} infinite`,
                }}
              >
                <circle cx={flake.cx} cy={flake.cy} r="2.3" fill="#f8fafc" />
                <line
                  x1={flake.cx - 3.5}
                  y1={flake.cy}
                  x2={flake.cx + 3.5}
                  y2={flake.cy}
                  stroke="#e0f2fe"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <line
                  x1={flake.cx}
                  y1={flake.cy - 3.5}
                  x2={flake.cx}
                  y2={flake.cy + 3.5}
                  stroke="#e0f2fe"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </g>
            ))}
          </g>
        )}

        {/* 8. THUNDERSTORM (CLOUD + LIGHTNING + RAIN) */}
        {iconName === 'cloud-lightning' && (
          <g>
            <g
              style={{
                animation: `svgCloudDrift ${cloudDuration}s ease-in-out infinite`,
              }}
            >
              <path
                d="M18 41H46C51.5 41 55.5 37 55.5 32C55.5 27.4 52 23.6 47.4 23C45.8 16.4 39.8 11.6 32.5 11.6C24.6 11.6 18.1 17.5 17.3 25C12.9 25.8 9.8 29.5 9.8 34C9.8 38.2 13.6 41 18 41Z"
                fill={`url(#cloudDark-${uid})`}
                stroke="rgba(253, 224, 71, 0.35)"
                strokeWidth="1"
              />
            </g>

            {/* Rain streaks */}
            {[20, 44].map((rx, idx) => (
              <line
                key={idx}
                x1={rx}
                y1="44"
                x2={rx - 2.5}
                y2="52"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeLinecap="round"
                style={{
                  animation: `svgRainFall 0.85s linear ${idx * 0.35}s infinite`,
                }}
              />
            ))}

            {/* Flashing Lightning Bolt */}
            <polygon
              points="34,36 25,48 32,48 29,60 41,45 34,45"
              fill="#fde047"
              stroke="#f59e0b"
              strokeWidth="0.6"
              style={{
                transformOrigin: '33px 47px',
                animation: 'svgLightningFlash 2.4s ease-in-out infinite',
              }}
            />
          </g>
        )}
      </svg>
    </div>
  );
};

interface AnimatedMetricIconProps {
  type: 'humidity' | 'wind' | 'pressure' | 'uv';
  value: number;
}

export const AnimatedMetricIcon: React.FC<AnimatedMetricIconProps> = ({ type, value }) => {
  const uid = useId().replace(/:/g, '');

  if (type === 'humidity') {
    // Fill level inside droplet scaled 0..100%
    const pct = Math.max(10, Math.min(95, value || 60));
    const fillY = 22 - (pct / 100) * 16;
    return (
      <svg viewBox="0 0 24 24" className="w-4 h-4 overflow-visible" aria-hidden="true">
        <defs>
          <clipPath id={`dropClip-${uid}`}>
            <path d="M12 2.5C12 2.5 5 10.2 5 15.2C5 19.1 8.1 22 12 22C15.9 22 19 19.1 19 15.2C19 10.2 12 2.5 12 2.5Z" />
          </clipPath>
        </defs>
        <path
          d="M12 2.5C12 2.5 5 10.2 5 15.2C5 19.1 8.1 22 12 22C15.9 22 19 19.1 19 15.2C19 10.2 12 2.5 12 2.5Z"
          fill="rgba(56, 189, 248, 0.15)"
          stroke="#38bdf8"
          strokeWidth="1.6"
        />
        <g clipPath={`url(#dropClip-${uid})`}>
          <rect
            x="3"
            y={fillY}
            width="18"
            height="20"
            fill="#38bdf8"
            opacity="0.65"
            style={{ animation: 'svgCloudDrift 2.6s ease-in-out infinite' }}
          />
        </g>
      </svg>
    );
  }

  if (type === 'wind') {
    const dur = Math.max(0.45, Math.min(2.2, 18 / Math.max(4, value || 10))).toFixed(2);
    return (
      <svg viewBox="0 0 24 24" className="w-4 h-4 overflow-visible" aria-hidden="true">
        <path
          d="M3 9H16.5C18.2 9 19.5 7.7 19.5 6C19.5 4.3 18.2 3 16.5 3C15 3 13.7 4.1 13.5 5.5"
          fill="none"
          stroke="#34d399"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeDasharray="12 6"
          style={{ animation: `svgWindDash ${dur}s linear infinite` }}
        />
        <path
          d="M2 14H18.5C20.4 14 22 15.6 22 17.5C22 19.4 20.4 21 18.5 21C16.8 21 15.3 19.7 15.1 18"
          fill="none"
          stroke="#6ee7b7"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeDasharray="12 6"
          style={{ animation: `svgWindDash ${dur}s linear 0.3s infinite` }}
        />
      </svg>
    );
  }

  if (type === 'pressure') {
    // Normal pressure ~740..780 mmHg -> needle angle -60..+60 deg
    const norm = Math.max(725, Math.min(785, value || 755));
    const deg = ((norm - 755) / 30) * 65;
    return (
      <svg viewBox="0 0 24 24" className="w-4 h-4 overflow-visible" aria-hidden="true">
        <circle
          cx="12"
          cy="12"
          r="9.5"
          fill="rgba(251, 191, 36, 0.1)"
          stroke="#fbbf24"
          strokeWidth="1.6"
        />
        <line
          x1="12"
          y1="12"
          x2="12"
          y2="5.5"
          stroke="#fde047"
          strokeWidth="2"
          strokeLinecap="round"
          transform={`rotate(${deg.toFixed(1)} 12 12)`}
        />
        <circle cx="12" cy="12" r="1.8" fill="#fbbf24" />
      </svg>
    );
  }

  // UV Index
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 overflow-visible" aria-hidden="true">
      <g
        style={{
          transformOrigin: '12px 12px',
          animation: 'svgSunSpin 10s linear infinite',
        }}
      >
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <line
            key={a}
            x1="12"
            y1="2"
            x2="12"
            y2="4.8"
            stroke="#fb923c"
            strokeWidth="1.8"
            strokeLinecap="round"
            transform={`rotate(${a} 12 12)`}
          />
        ))}
      </g>
      <circle
        cx="12"
        cy="12"
        r="5"
        fill="#fb923c"
        style={{
          transformOrigin: '12px 12px',
          animation: 'svgSunPulse 2.2s ease-in-out infinite',
        }}
      />
    </svg>
  );
};
