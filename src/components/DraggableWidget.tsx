import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  GripVertical,
  ChevronUp,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Maximize2,
  Minimize2,
  Pin,
} from 'lucide-react';

export interface DraggableWidgetProps {
  id: string;
  title: string;
  summary?: string;
  icon?: React.ReactNode;
  isCollapsed: boolean;
  onToggleCollapse: (id: string) => void;
  isWide?: boolean;
  onToggleWide?: (id: string) => void;
  freePositionMode: boolean;
  savedOffset: { x: number; y: number };
  onSaveOffset: (id: string, offset: { x: number; y: number }) => void;
  onStartPointerDrag: (id: string) => void;
  onHoverTargetWidget: (targetId: string | null) => void;
  onEndPointerDrag: (sourceId: string, targetId: string | null) => void;
  onMoveOffset?: (id: string, direction: 'up' | 'down') => void;
  isDragging: boolean;
  isDragOver: boolean;
  children: React.ReactNode;
}

interface JellyPhysicsState {
  // Position (px)
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  // Squash & stretch scale
  scaleX: number;
  scaleY: number;
  vScaleX: number;
  vScaleY: number;
  targetScaleX: number;
  targetScaleY: number;
  // Shear skew (deg)
  skewX: number;
  skewY: number;
  vSkewX: number;
  vSkewY: number;
  targetSkewX: number;
  targetSkewY: number;
  // Rotation (deg)
  rot: number;
  vRot: number;
  targetRot: number;
}

const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

export const DraggableWidget: React.FC<DraggableWidgetProps> = ({
  id,
  title,
  summary,
  icon,
  isCollapsed,
  onToggleCollapse,
  isWide = false,
  onToggleWide,
  freePositionMode,
  savedOffset,
  onSaveOffset,
  onStartPointerDrag,
  onHoverTargetWidget,
  onEndPointerDrag,
  onMoveOffset,
  isDragging,
  isDragOver,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const isPointerDownRef = useRef(false);
  const pointerStartRef = useRef({ clientX: 0, clientY: 0, baseX: 0, baseY: 0 });
  const lastPointerRef = useRef({ clientX: 0, clientY: 0, time: 0 });
  const hoveredTargetRef = useRef<string | null>(null);

  const [isPinnedOffset, setIsPinnedOffset] = useState(
    savedOffset.x !== 0 || savedOffset.y !== 0
  );

  const physRef = useRef<JellyPhysicsState>({
    x: savedOffset.x,
    y: savedOffset.y,
    vx: 0,
    vy: 0,
    targetX: savedOffset.x,
    targetY: savedOffset.y,
    scaleX: 1,
    scaleY: 1,
    vScaleX: 0,
    vScaleY: 0,
    targetScaleX: 1,
    targetScaleY: 1,
    skewX: 0,
    skewY: 0,
    vSkewX: 0,
    vSkewY: 0,
    targetSkewX: 0,
    targetSkewY: 0,
    rot: 0,
    vRot: 0,
    targetRot: 0,
  });

  const applyTransformToDOM = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const p = physRef.current;

    const isAtRest =
      !isPointerDownRef.current &&
      Math.abs(p.x - p.targetX) < 0.15 &&
      Math.abs(p.y - p.targetY) < 0.15 &&
      Math.abs(p.scaleX - 1) < 0.001 &&
      Math.abs(p.scaleY - 1) < 0.001 &&
      Math.abs(p.skewX) < 0.02 &&
      Math.abs(p.skewY) < 0.02 &&
      Math.abs(p.rot) < 0.02;

    if (isAtRest && p.targetX === 0 && p.targetY === 0) {
      el.style.transform = '';
      return;
    }

    el.style.transform = `translate3d(${p.x.toFixed(2)}px, ${p.y.toFixed(2)}px, 0) rotate(${p.rot.toFixed(
      2
    )}deg) skew(${p.skewX.toFixed(2)}deg, ${p.skewY.toFixed(2)}deg) scale(${p.scaleX.toFixed(
      4
    )}, ${p.scaleY.toFixed(4)})`;
  }, []);

  const stepPhysics = useCallback(() => {
    const p = physRef.current;

    if (isPointerDownRef.current) {
      // Tight responsive follow while dragging with pointer/finger
      const dx = p.targetX - p.x;
      const dy = p.targetY - p.y;
      p.vx = p.vx * 0.45 + dx * 0.38;
      p.vy = p.vy * 0.45 + dy * 0.38;
      p.x += p.vx;
      p.y += p.vy;

      // Drive jelly deformation from live velocity
      const speedX = p.vx;
      const speedY = p.vy;
      p.targetScaleX = 1 + clamp((Math.abs(speedX) - Math.abs(speedY)) * 0.0065, -0.16, 0.2);
      p.targetScaleY = 1 + clamp((Math.abs(speedY) - Math.abs(speedX)) * 0.0065, -0.16, 0.2);
      p.targetSkewX = clamp(speedX * 0.28, -13, 13);
      p.targetSkewY = clamp(speedY * 0.18, -9, 9);
      p.targetRot = clamp(speedX * 0.25, -10, 10);
    } else {
      // Elastic spring-back / settling when released
      const posStiffness = 0.15;
      const posDamping = 0.77;
      const ax = (p.targetX - p.x) * posStiffness;
      const ay = (p.targetY - p.y) * posStiffness;
      p.vx = (p.vx + ax) * posDamping;
      p.vy = (p.vy + ay) * posDamping;
      p.x += p.vx;
      p.y += p.vy;

      // Coupled jelly squash & stretch from spring-back velocity
      p.targetScaleX = 1 + clamp((Math.abs(p.vx) - Math.abs(p.vy)) * 0.004, -0.12, 0.14);
      p.targetScaleY = 1 + clamp((Math.abs(p.vy) - Math.abs(p.vx)) * 0.004, -0.12, 0.14);
      p.targetSkewX = 0;
      p.targetSkewY = 0;
      p.targetRot = 0;
    }

    // Underdamped jelly oscillator for scale, skew, and rotation (high-elasticity jello feel)
    const jellyStiffness = 0.24;
    const jellyDamping = 0.73;

    p.vScaleX = (p.vScaleX + (p.targetScaleX - p.scaleX) * jellyStiffness) * jellyDamping;
    p.vScaleY = (p.vScaleY + (p.targetScaleY - p.scaleY) * jellyStiffness) * jellyDamping;
    p.scaleX += p.vScaleX;
    p.scaleY += p.vScaleY;

    p.vSkewX = (p.vSkewX + (p.targetSkewX - p.skewX) * 0.22) * 0.74;
    p.vSkewY = (p.vSkewY + (p.targetSkewY - p.skewY) * 0.22) * 0.74;
    p.skewX += p.vSkewX;
    p.skewY += p.vSkewY;

    p.vRot = (p.vRot + (p.targetRot - p.rot) * 0.22) * 0.75;
    p.rot += p.vRot;

    applyTransformToDOM();

    const kineticEnergy =
      Math.abs(p.vx) +
      Math.abs(p.vy) +
      Math.abs(p.x - p.targetX) +
      Math.abs(p.y - p.targetY) +
      (Math.abs(p.vScaleX) +
        Math.abs(p.vScaleY) +
        Math.abs(p.scaleX - 1) +
        Math.abs(p.scaleY - 1)) *
        100 +
      Math.abs(p.vSkewX) +
      Math.abs(p.vSkewY) +
      Math.abs(p.skewX) +
      Math.abs(p.vRot) +
      Math.abs(p.rot);

    if (isPointerDownRef.current || kineticEnergy > 0.08) {
      rafRef.current = requestAnimationFrame(stepPhysics);
    } else {
      p.x = p.targetX;
      p.y = p.targetY;
      p.scaleX = 1;
      p.scaleY = 1;
      p.skewX = 0;
      p.skewY = 0;
      p.rot = 0;
      applyTransformToDOM();
      rafRef.current = null;
    }
  }, [applyTransformToDOM]);

  const startPhysicsLoop = useCallback(() => {
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(stepPhysics);
    }
  }, [stepPhysics]);

  // Trigger a playful jelly squish impulse (e.g., on grab, release, or collapse toggle)
  const triggerJellyImpulse = useCallback(
    (impulseScaleX = 0.065, impulseScaleY = -0.065, impulseRot = 1.8) => {
      const p = physRef.current;
      p.vScaleX += impulseScaleX;
      p.vScaleY += impulseScaleY;
      p.vRot += impulseRot;
      startPhysicsLoop();
    },
    [startPhysicsLoop]
  );

  // Sync when savedOffset changes externally (e.g. "Скинути порядок")
  useEffect(() => {
    const p = physRef.current;
    p.targetX = savedOffset.x;
    p.targetY = savedOffset.y;
    setIsPinnedOffset(savedOffset.x !== 0 || savedOffset.y !== 0);
    triggerJellyImpulse(0.04, -0.04, 0);
  }, [savedOffset.x, savedOffset.y, triggerJellyImpulse]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const handlePointerDownHeader = (e: React.PointerEvent<HTMLDivElement>) => {
    // Ignore if user clicked a button inside the header
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);

    const p = physRef.current;
    isPointerDownRef.current = true;
    hoveredTargetRef.current = null;

    pointerStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      baseX: p.x,
      baseY: p.y,
    };
    lastPointerRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      time: performance.now(),
    };

    // Initial grab jelly pop
    p.vScaleX += 0.045;
    p.vScaleY -= 0.035;
    onStartPointerDrag(id);
    startPhysicsLoop();
  };

  const handlePointerMoveHeader = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;

    const dx = e.clientX - pointerStartRef.current.clientX;
    const dy = e.clientY - pointerStartRef.current.clientY;

    const p = physRef.current;
    p.targetX = pointerStartRef.current.baseX + dx;
    p.targetY = pointerStartRef.current.baseY + dy;

    lastPointerRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      time: performance.now(),
    };

    // Detect if pointer is over another widget card for slot swapping
    const elementsUnderPointer = document.elementsFromPoint(e.clientX, e.clientY);
    let foundWidgetId: string | null = null;
    for (const el of elementsUnderPointer) {
      const widgetCard = el.closest('[data-widget-id]') as HTMLElement | null;
      if (widgetCard) {
        const candidateId = widgetCard.getAttribute('data-widget-id');
        if (candidateId && candidateId !== id) {
          foundWidgetId = candidateId;
          break;
        }
      }
    }

    if (hoveredTargetRef.current !== foundWidgetId) {
      hoveredTargetRef.current = foundWidgetId;
      onHoverTargetWidget(foundWidgetId);
    }

    startPhysicsLoop();
  };

  const handlePointerUpOrCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {}

    const p = physRef.current;
    const targetWidget = hoveredTargetRef.current;

    if (targetWidget) {
      // Swapping places with target widget: reset offset to (0, 0) and play jelly bounce
      p.targetX = 0;
      p.targetY = 0;
      p.vScaleX += 0.09;
      p.vScaleY -= 0.09;
      p.vSkewX += clamp(p.vx * 0.4, -10, 10);
      onSaveOffset(id, { x: 0, y: 0 });
      setIsPinnedOffset(false);
      onEndPointerDrag(id, targetWidget);
    } else if (freePositionMode || isPinnedOffset) {
      // Stay at the dragged position with a jelly wobble
      const finalX = Math.round(p.targetX);
      const finalY = Math.round(p.targetY);
      p.targetX = finalX;
      p.targetY = finalY;
      p.vScaleX -= 0.075;
      p.vScaleY += 0.075;
      p.vRot += clamp(-p.vx * 0.25, -8, 8);
      onSaveOffset(id, { x: finalX, y: finalY });
      setIsPinnedOffset(finalX !== 0 || finalY !== 0);
      onEndPointerDrag(id, null);
    } else {
      // Elastic snap back to grid slot with pronounced jelly oscillation
      p.targetX = 0;
      p.targetY = 0;
      p.vScaleX += 0.085;
      p.vScaleY -= 0.085;
      onEndPointerDrag(id, null);
    }

    hoveredTargetRef.current = null;
    startPhysicsLoop();
  };

  const handleResetPin = () => {
    const p = physRef.current;
    p.targetX = 0;
    p.targetY = 0;
    setIsPinnedOffset(false);
    onSaveOffset(id, { x: 0, y: 0 });
    triggerJellyImpulse(0.08, -0.08, -2.5);
  };

  return (
    <div
      ref={containerRef}
      data-widget-id={id}
      style={{ willChange: 'transform' }}
      className={`group/widget relative rounded-2xl select-none ${
        isWide ? 'lg:col-span-2' : 'col-span-1'
      } ${isCollapsed ? 'self-start' : 'h-full flex flex-col'} ${
        isDragging
          ? 'z-50 shadow-[0_24px_60px_rgba(0,0,0,0.75)] ring-2 ring-amber-400/80'
          : isPinnedOffset
          ? 'z-30 shadow-[0_18px_42px_rgba(0,0,0,0.6)] ring-1 ring-amber-400/35'
          : 'z-10'
      } ${
        isDragOver
          ? 'ring-2 ring-amber-400 bg-amber-500/10 shadow-[0_0_32px_rgba(251,191,36,0.35)] transition-shadow duration-150'
          : ''
      }`}
    >
      {/* Top Drag & Collapse Control Bar (Pointer & Touch enabled) */}
      <div
        onPointerDown={handlePointerDownHeader}
        onPointerMove={handlePointerMoveHeader}
        onPointerUp={handlePointerUpOrCancel}
        onPointerCancel={handlePointerUpOrCancel}
        style={{ touchAction: 'none' }}
        className={`flex items-center justify-between gap-2 px-4 py-2.5 select-none transition-colors ${
          isCollapsed
            ? 'glass-panel rounded-2xl border border-white/15 hover:border-amber-400/50'
            : 'bg-stone-950/70 backdrop-blur-md border-x border-t border-white/15 rounded-t-2xl hover:bg-stone-900/75'
        } cursor-grab active:cursor-grabbing`}
        title="Потягніть мишкою або пальцем, щоб перемістити вікно з ефектом желе"
      >
        <div className="flex items-center gap-2 min-w-0 pointer-events-none">
          <GripVertical className="w-4 h-4 text-amber-300/80 group-hover/widget:text-amber-300 transition-colors shrink-0" />
          {icon && <span className="shrink-0">{icon}</span>}
          <span className="text-xs font-semibold text-stone-100 truncate">{title}</span>
          {isCollapsed && summary && (
            <>
              <span className="text-stone-500" aria-hidden="true">
                ·
              </span>
              <span className="text-xs text-amber-300 font-data-mono truncate">{summary}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Pin / Reset Free Offset Button */}
          {isPinnedOffset && (
            <button
              type="button"
              onClick={handleResetPin}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-amber-500/20 text-amber-200 border border-amber-400/40 hover:bg-amber-500/30 transition-colors cursor-pointer"
              title="Повернути вікно назад у сітку"
            >
              <Pin className="w-3 h-3" />
              <span className="hidden sm:inline">У сітку</span>
            </button>
          )}

          {/* Reorder Up/Down buttons */}
          {onMoveOffset && (
            <div className="flex items-center gap-0.5 mr-0.5">
              <button
                type="button"
                onClick={() => {
                  triggerJellyImpulse(0.06, -0.06, -2);
                  onMoveOffset(id, 'up');
                }}
                className="p-1 rounded-md text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Перемістити вище"
                aria-label={`Перемістити ${title} вище`}
              >
                <ArrowUp className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerJellyImpulse(0.06, -0.06, 2);
                  onMoveOffset(id, 'down');
                }}
                className="p-1 rounded-md text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Перемістити нижче"
                aria-label={`Перемістити ${title} нижче`}
              >
                <ArrowDown className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Column Span Toggle on Desktop */}
          {onToggleWide && !isCollapsed && (
            <button
              type="button"
              onClick={() => {
                triggerJellyImpulse(0.08, -0.06, 0);
                onToggleWide(id);
              }}
              className="hidden lg:flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title={isWide ? 'Зробити компактним (1 колонка)' : 'Розширити на 2 колонки'}
            >
              {isWide ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            </button>
          )}

          {/* Collapse / Expand Toggle Button with Jelly Bounce */}
          <button
            type="button"
            onClick={() => {
              triggerJellyImpulse(0.09, -0.08, 1.5);
              onToggleCollapse(id);
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium glass-pill text-stone-200 hover:text-amber-200 hover:border-amber-400/40 transition-colors cursor-pointer whitespace-nowrap"
            title={isCollapsed ? 'Розгорнути віджет' : 'Скрутити віджет'}
          >
            {isCollapsed ? (
              <>
                <span>Розгорнути</span>
                <ChevronDown className="w-3.5 h-3.5 text-amber-300" />
              </>
            ) : (
              <>
                <span>Скрутити</span>
                <ChevronUp className="w-3.5 h-3.5 text-stone-400" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Widget Body */}
      {!isCollapsed && (
        <div className="flex-1 flex flex-col [&>.glass-panel]:rounded-t-none [&>.glass-panel]:border-t-0">
          {children}
        </div>
      )}
    </div>
  );
};
