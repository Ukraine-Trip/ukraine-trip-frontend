import React from 'react';
import type { ItineraryPoint } from '../../../../types/types';

interface RoutePointsListProps {
  points: ItineraryPoint[];
  onSelectPoint: (point: ItineraryPoint) => void;
  onDragStart: (idx: number) => void;
  onDragOver: (e: React.DragEvent, idx: number) => void;
  onDrop: (e: React.DragEvent, idx: number) => void;
  onDragEnd: () => void;
  onTouchStart: (idx: number) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  draggingIdx: number | null;
  dragOverIdx: number | null;
  compact?: boolean;
}

export const RoutePointsList: React.FC<RoutePointsListProps> = ({
  points,
  onSelectPoint,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  draggingIdx,
  dragOverIdx,
  compact = false,
}) => {
  return (
    <ol
      style={{
        listStyle: 'none',
        margin: '0 0 10px',
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: compact ? '3px' : '4px',
        userSelect: 'none',
      }}
    >
      {points.map((p, i) => (
        <li
          key={p.id}
          data-map-route-idx={i}
          draggable
          onDragStart={() => onDragStart(i)}
          onDragOver={(e) => onDragOver(e, i)}
          onDrop={(e) => onDrop(e, i)}
          onDragEnd={onDragEnd}
          onTouchStart={() => onTouchStart(i)}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: compact ? '7px' : '8px',
            padding: compact ? '7px 8px' : '8px 10px',
            borderRadius: '8px',
            borderTop:
              dragOverIdx === i && draggingIdx !== i
                ? '2px solid #000'
                : '2px solid transparent',
            background:
              dragOverIdx === i && draggingIdx !== i
                ? '#f0f0f0'
                : i === 0
                  ? '#f0f7f4'
                  : i === points.length - 1
                    ? '#f7f0f0'
                    : compact
                      ? '#fafafa'
                      : 'transparent',
            opacity: draggingIdx === i ? 0.35 : 1,
            cursor: 'grab',
            touchAction: 'none',
            transition: 'opacity 0.15s, background 0.1s',
          }}
        >
          <svg
            width={compact ? '8' : '10'}
            height={compact ? '12' : '14'}
            viewBox="0 0 10 14"
            style={{ flexShrink: 0 }}
          >
            <circle cx="3" cy="3" r="1.3" fill="#ccc" />
            <circle cx="7" cy="3" r="1.3" fill="#ccc" />
            <circle cx="3" cy="7" r="1.3" fill="#ccc" />
            <circle cx="7" cy="7" r="1.3" fill="#ccc" />
            <circle cx="3" cy="11" r="1.3" fill="#ccc" />
            <circle cx="7" cy="11" r="1.3" fill="#ccc" />
          </svg>
          <span
            style={{
              width: compact ? '20px' : '22px',
              height: compact ? '20px' : '22px',
              borderRadius: '50%',
              background:
                i === 0
                  ? '#2e7d5a'
                  : i === points.length - 1
                    ? '#c0392b'
                    : '#e8e8e8',
              color:
                i === 0 || i === points.length - 1
                  ? '#fff'
                  : '#555',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: compact ? '10px' : '11px',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {i + 1}
          </span>
          <span
            style={{
              fontSize: compact ? '12px' : '13px',
              color: '#222',
              fontWeight: 500,
              flex: 1,
            }}
          >
            {p.name}
          </span>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => onSelectPoint(p)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#bbb',
              fontSize: compact ? '16px' : '18px',
              padding: compact ? '0 2px' : '0 4px',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </li>
      ))}
    </ol>
  );
};
