import React from 'react';
import { NatureEffectType } from './InteractiveWeatherCanvas';

export type ResolvedNatureEffect = Exclude<NatureEffectType, 'auto' | 'wallpaper_match'>;

interface WidgetWeatherOverlayProps {
  effect: ResolvedNatureEffect;
  isCollapsed?: boolean;
  seedOffset?: number;
}

const RAIN_DROPS = [
  { left: '7%', delay: '0s', duration: '2.3s', scale: 1.0 },
  { left: '18%', delay: '0.65s', duration: '2.8s', scale: 0.85 },
  { left: '29%', delay: '1.3s', duration: '2.1s', scale: 1.1 },
  { left: '42%', delay: '0.3s', duration: '2.6s', scale: 0.9 },
  { left: '55%', delay: '1.7s', duration: '2.4s', scale: 1.05 },
  { left: '68%', delay: '0.9s', duration: '2.9s', scale: 0.88 },
  { left: '81%', delay: '1.45s', duration: '2.2s', scale: 1.12 },
  { left: '92%', delay: '0.2s', duration: '2.5s', scale: 0.95 },
];

const TOP_BEADS = [
  { left: '5%', size: 6, delay: '0.1s' },
  { left: '12%', size: 4, delay: '0.5s' },
  { left: '23%', size: 7, delay: '0.9s' },
  { left: '34%', size: 5, delay: '0.2s' },
  { left: '47%', size: 6, delay: '0.7s' },
  { left: '59%', size: 5, delay: '1.1s' },
  { left: '73%', size: 7, delay: '0.4s' },
  { left: '85%', size: 5, delay: '0.8s' },
  { left: '94%', size: 6, delay: '0.3s' },
];

const SNOW_FLAKES = [
  { left: '10%', delay: '0s', duration: '4.2s', size: 10 },
  { left: '26%', delay: '1.1s', duration: '4.8s', size: 8 },
  { left: '44%', delay: '0.5s', duration: '3.9s', size: 11 },
  { left: '62%', delay: '1.8s', duration: '4.5s', size: 9 },
  { left: '78%', delay: '0.8s', duration: '4.1s', size: 10 },
  { left: '90%', delay: '2.1s', duration: '4.6s', size: 8 },
];

const AUTUMN_LEAVES = [
  { left: '12%', delay: '0s', duration: '4.6s', color: '#f59e0b', rot: -15 },
  { left: '34%', delay: '1.4s', duration: '5.2s', color: '#ea580c', rot: 20 },
  { left: '58%', delay: '0.7s', duration: '4.8s', color: '#fbbf24', rot: -8 },
  { left: '82%', delay: '2.1s', duration: '5.0s', color: '#dc2626', rot: 14 },
];

const SAKURA_PETALS = [
  { left: '14%', delay: '0s', duration: '4.3s' },
  { left: '32%', delay: '1.2s', duration: '4.9s' },
  { left: '52%', delay: '0.5s', duration: '4.5s' },
  { left: '73%', delay: '1.9s', duration: '4.7s' },
  { left: '89%', delay: '0.9s', duration: '4.1s' },
];

export const WidgetWeatherOverlay: React.FC<WidgetWeatherOverlayProps> = ({
  effect,
  isCollapsed = false,
}) => {
  if (effect === 'none') return null;

  const isRainOrStorm = effect === 'rain' || effect === 'thunderstorm';
  const isStorm = effect === 'thunderstorm';

  return (
    <div
      className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden z-20 select-none"
      aria-hidden="true"
    >
      {/* 1. RAIN & THUNDERSTORM: Soaked glass sheen, top puddle meniscus, hanging beads & falling droplets */}
      {isRainOrStorm && (
        <>
          {/* Soaked Widget Glass Tint & Wet Refraction Sheen */}
          <div
            className="absolute inset-0 rounded-2xl border border-sky-300/35"
            style={{
              background:
                'linear-gradient(180deg, rgba(56, 189, 248, 0.22) 0%, rgba(14, 165, 233, 0.08) 22%, rgba(2, 132, 199, 0.02) 60%, rgba(56, 189, 248, 0.10) 100%)',
              animation: 'widgetWetSheen 4s ease-in-out infinite',
            }}
          />

          {/* Thunderstorm Electric Lightning Flash on Soaked Window */}
          {isStorm && (
            <div
              className="absolute inset-0 rounded-2xl border-2 border-indigo-200/80 bg-gradient-to-b from-indigo-300/35 via-sky-200/15 to-transparent"
              style={{
                animation: 'widgetThunderFlash 5.5s infinite',
                boxShadow: 'inset 0 0 28px rgba(165, 180, 252, 0.55)',
              }}
            />
          )}

          {/* Glistening Water Film Meniscus Along the Top Edge */}
          <div
            className="absolute top-0 left-0 right-0 h-2"
            style={{
              background:
                'linear-gradient(180deg, rgba(186, 230, 253, 0.75) 0%, rgba(56, 189, 248, 0.35) 55%, transparent 100%)',
              boxShadow: '0 2px 10px rgba(56, 189, 248, 0.45)',
            }}
          />

          {/* Raindrop Impact Splash Rings on the Top Rim */}
          {RAIN_DROPS.slice(0, 6).map((drop, idx) => (
            <div
              key={`splash-${idx}`}
              className="absolute top-0.5 w-3.5 h-1.5 rounded-full border border-sky-200/80"
              style={{
                left: drop.left,
                animation: `widgetTopSplash ${isStorm ? '1.3s' : '1.8s'} ease-out infinite`,
                animationDelay: drop.delay,
              }}
            />
          ))}

          {/* Hanging Swelling Water Beads Along the Top Edge */}
          {TOP_BEADS.map((bead, idx) => (
            <div
              key={`bead-${idx}`}
              className="absolute top-0 rounded-b-full bg-gradient-to-b from-sky-100/90 to-sky-400/80 shadow-[0_2px_6px_rgba(56,189,248,0.65)]"
              style={{
                left: bead.left,
                width: `${bead.size}px`,
                height: `${bead.size * 0.95}px`,
                animation: `widgetDropSwell 2.1s ease-in-out infinite`,
                animationDelay: bead.delay,
              }}
            />
          ))}

          {/* Falling Water Droplets + Wet Rivulet Streaks Running Down From Top of Widget */}
          {RAIN_DROPS.map((drop, idx) => {
            const speedFactor = isStorm ? 0.72 : 1;
            const durSec = parseFloat(drop.duration) * speedFactor;
            return (
              <div
                key={`drip-${idx}`}
                className="absolute top-0"
                style={{ left: drop.left }}
              >
                {/* Wet Rivulet Trail on the Soaked Glass */}
                {!isCollapsed && (
                  <div
                    className="w-[1.5px] mx-auto rounded-full bg-gradient-to-b from-sky-200/50 via-sky-300/35 to-transparent"
                    style={{
                      animation: `widgetRivuletStreak ${durSec.toFixed(2)}s ease-in infinite`,
                      animationDelay: drop.delay,
                    }}
                  />
                )}

                {/* Realistic Falling Water Teardrop */}
                <div
                  className=" -mt-1"
                  style={{
                    animation: `widgetDropFall ${durSec.toFixed(2)}s cubic-bezier(0.32, 0, 0.85, 0.65) infinite`,
                    animationDelay: drop.delay,
                  }}
                >
                  <svg
                    width={Math.round(9 * drop.scale)}
                    height={Math.round(14 * drop.scale)}
                    viewBox="0 0 10 16"
                    className="overflow-visible drop-shadow-[0_2px_5px_rgba(56,189,248,0.85)]"
                  >
                    <defs>
                      <linearGradient id={`dropGrad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.95" />
                        <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#0284c7" stopOpacity="0.95" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M5 0.5 C5 0.5 9.2 7.2 9.2 10.8 C9.2 13.3 7.3 15.2 5 15.2 C2.7 15.2 0.8 13.3 0.8 10.8 C0.8 7.2 5 0.5 5 0.5 Z"
                      fill={`url(#dropGrad-${idx})`}
                    />
                    {/* Specular light reflection inside droplet */}
                    <ellipse
                      cx="3.6"
                      cy="10.2"
                      rx="1.1"
                      ry="2.2"
                      fill="#ffffff"
                      fillOpacity="0.85"
                      transform="rotate(-12 3.6 10.2)"
                    />
                  </svg>
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* 2. SNOW: Sculpted snowdrift cap on top rim, icicles & snowflakes drifting down */}
      {effect === 'snow' && (
        <>
          <div className="absolute inset-0 rounded-2xl border border-sky-100/45 shadow-[inset_0_0_20px_rgba(224,242,254,0.22)]" />

          {/* Sculpted Snow Cap on the Top Edge of the Widget */}
          <svg
            viewBox="0 0 400 22"
            preserveAspectRatio="none"
            className="absolute top-0 left-0 w-full h-4 drop-shadow-[0_3px_6px_rgba(186,230,253,0.45)]"
          >
            <path
              d="M0,0 L400,0 L400,10 Q365,16 330,9 Q285,2 245,12 Q195,19 150,8 Q100,2 55,13 Q25,17 0,9 Z"
              fill="#f8fafc"
              fillOpacity="0.9"
            />
            <path
              d="M0,0 L400,0 L400,6 Q350,12 295,6 Q230,14 165,5 Q95,12 40,6 L0,5 Z"
              fill="#ffffff"
            />
            {/* Hanging Crystalline Icicles on Left & Right Corners */}
            <polygon points="14,7 20,7 17,21" fill="#e0f2fe" fillOpacity="0.88" />
            <polygon points="24,8 29,8 26.5,17" fill="#bae6fd" fillOpacity="0.8" />
            <polygon points="368,7 374,7 371,20" fill="#e0f2fe" fillOpacity="0.88" />
            <polygon points="378,6 383,6 380.5,16" fill="#bae6fd" fillOpacity="0.8" />
          </svg>

          {/* Falling Snowflakes Shedding from Top Snowdrift */}
          {SNOW_FLAKES.map((flake, idx) => (
            <div
              key={`snow-${idx}`}
              className="absolute top-1 text-sky-100 drop-shadow-[0_0_4px_rgba(255,255,255,0.9)]"
              style={{
                left: flake.left,
                animation: `widgetSnowDriftDown ${flake.duration} ease-in-out infinite`,
                animationDelay: flake.delay,
              }}
            >
              <svg width={flake.size} height={flake.size} viewBox="0 0 12 12">
                <g stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
                  <line x1="6" y1="1" x2="6" y2="11" />
                  <line x1="1" y1="6" x2="11" y2="6" />
                  <line x1="2.5" y1="2.5" x2="9.5" y2="9.5" />
                  <line x1="9.5" y1="2.5" x2="2.5" y2="9.5" />
                </g>
              </svg>
            </div>
          ))}
        </>
      )}

      {/* 3. AUTUMN LEAVES: Leaves resting on top edge & fluttering down */}
      {effect === 'leaves' && (
        <>
          <div className="absolute inset-0 rounded-2xl border border-amber-400/30" />

          {/* Resting Leaves Along Top Edge */}
          <div className="absolute top-0.5 left-6 flex items-center gap-12">
            {['#f59e0b', '#ea580c', '#fbbf24'].map((clr, idx) => (
              <svg
                key={`rest-leaf-${idx}`}
                width="14"
                height="10"
                viewBox="0 0 16 12"
                style={{
                  animation: `widgetLeafSway ${2.6 + idx * 0.4}s ease-in-out infinite`,
                }}
              >
                <path
                  d="M1 6 C4 1, 11 1, 15 6 C11 11, 4 11, 1 6 Z"
                  fill={clr}
                  fillOpacity="0.88"
                />
                <path d="M1 6 L14 6" stroke="#78350f" strokeWidth="0.8" />
              </svg>
            ))}
          </div>

          {/* Falling Autumn Leaves From Widget Top */}
          {AUTUMN_LEAVES.map((leaf, idx) => (
            <div
              key={`fall-leaf-${idx}`}
              className="absolute top-0"
              style={{
                left: leaf.left,
                animation: `widgetLeafFlutterDown ${leaf.duration} ease-in-out infinite`,
                animationDelay: leaf.delay,
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 16 16"
                className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]"
              >
                <path
                  d="M2 14 C2 6, 7 2, 14 2 C14 9, 10 14, 2 14 Z"
                  fill={leaf.color}
                  fillOpacity="0.9"
                />
                <path d="M2 14 L12 4" stroke="#451a03" strokeWidth="1" />
              </svg>
            </div>
          ))}
        </>
      )}

      {/* 4. SAKURA: Cherry blossom petals on top edge & spiraling down */}
      {effect === 'sakura' && (
        <>
          <div className="absolute inset-0 rounded-2xl border border-pink-300/35 shadow-[inset_0_1px_12px_rgba(244,114,182,0.18)]" />
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-pink-300/60 to-transparent" />

          {SAKURA_PETALS.map((petal, idx) => (
            <div
              key={`sakura-${idx}`}
              className="absolute top-0"
              style={{
                left: petal.left,
                animation: `widgetSakuraFlutter ${petal.duration} ease-in-out infinite`,
                animationDelay: petal.delay,
              }}
            >
              <svg width="11" height="11" viewBox="0 0 14 14">
                <path
                  d="M7 1 C10 1, 13 4, 13 7.5 C13 10.5, 9.5 13, 7 11 C4.5 13, 1 10.5, 1 7.5 C1 4, 4 1, 7 1 Z"
                  fill="#fbcfe8"
                  fillOpacity="0.9"
                />
              </svg>
            </div>
          ))}
        </>
      )}

      {/* 5. MIST: Rolling fog bands & dew condensation along widget top */}
      {effect === 'mist' && (
        <>
          <div className="absolute inset-0 rounded-2xl border border-stone-200/25" />
          <div
            className="absolute -top-2 left-0 right-0 h-8 bg-gradient-to-b from-stone-200/25 via-stone-300/10 to-transparent blur-sm"
            style={{ animation: 'widgetMistRoll 7s ease-in-out infinite' }}
          />
          {!isCollapsed && (
            <div
              className="absolute -bottom-2 left-0 right-0 h-8 bg-gradient-to-t from-stone-200/20 via-stone-300/10 to-transparent blur-sm"
              style={{ animation: 'widgetMistRoll 9s ease-in-out infinite reverse' }}
            />
          )}
        </>
      )}

      {/* 6. SUNBEAMS: Golden solar rays & warm prism glow on widget top */}
      {effect === 'sunbeams' && (
        <>
          <div className="absolute inset-0 rounded-2xl border border-amber-300/35" />
          <div
            className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-200/20 via-amber-300/80 to-amber-200/20"
            style={{ animation: 'widgetSunShimmer 4.5s ease-in-out infinite' }}
          />
          <div
            className="absolute -top-6 left-6 w-44 h-24 bg-gradient-to-br from-amber-300/25 via-amber-200/10 to-transparent rotate-12 blur-md"
            style={{ animation: 'widgetSunShimmer 5s ease-in-out infinite' }}
          />
        </>
      )}

      {/* 7. AURORA: Flowing northern lights ribbon along the top edge */}
      {effect === 'aurora' && (
        <>
          <div className="absolute inset-0 rounded-2xl border border-emerald-400/30" />
          <div
            className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400/70 via-cyan-300/80 to-purple-400/70 blur-[1px]"
            style={{ animation: 'widgetAuroraFlow 6s ease-in-out infinite' }}
          />
          <div
            className="absolute top-0 left-8 right-8 h-8 bg-gradient-to-b from-emerald-400/20 via-cyan-400/10 to-transparent blur-md"
            style={{ animation: 'widgetAuroraFlow 6s ease-in-out infinite' }}
          />
        </>
      )}

      {/* 8. FIREFLIES: Glowing bioluminescent fireflies along the widget top */}
      {effect === 'fireflies' && (
        <>
          <div className="absolute inset-0 rounded-2xl border border-lime-300/25" />
          {[
            { left: '15%', delay: '0s' },
            { left: '38%', delay: '0.9s' },
            { left: '64%', delay: '0.4s' },
            { left: '84%', delay: '1.4s' },
          ].map((fly, idx) => (
            <div
              key={`fly-${idx}`}
              className="absolute top-2 w-2 h-2 rounded-full bg-lime-300 shadow-[0_0_10px_3px_rgba(190,242,100,0.85)]"
              style={{
                left: fly.left,
                animation: 'widgetFireflyHover 3.4s ease-in-out infinite',
                animationDelay: fly.delay,
              }}
            />
          ))}
        </>
      )}

      {/* 9. SHOOTING STARS: Starlight glints along widget top border */}
      {effect === 'shooting_stars' && (
        <>
          <div className="absolute inset-0 rounded-2xl border border-indigo-300/30" />
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-200/70 to-transparent" />
        </>
      )}
    </div>
  );
};
