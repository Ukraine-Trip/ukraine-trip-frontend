import React from 'react';

type LayerType = 'grey' | 'satellite' | 'none';

interface LayerPanelProps {
  activeLayer: LayerType;
  onLayerSelect: (layer: LayerType) => void;
  onClose: () => void;
  position: {
    top: number;
    right: number;
  };
}

export const LayerPanel: React.FC<LayerPanelProps> = ({
  activeLayer,
  onLayerSelect,
  onClose,
  position,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        right: `${position.right}px`,
        zIndex: 999,
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        padding: '20px',
        width: '280px',
        fontFamily: 'inherit',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px',
        }}
      >
        <span
          style={{
            fontWeight: 700,
            fontSize: '15px',
            color: '#1a1a2e',
            letterSpacing: 0.2,
          }}
        >
          Базові шари
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#666',
            fontSize: '20px',
            lineHeight: 1,
            padding: '2px 6px',
            borderRadius: '6px',
          }}
        >
          ×
        </button>
      </div>

      <div
        style={{
          height: '1px',
          background: '#f0f0f0',
          marginBottom: '14px',
        }}
      />

      <div
        onClick={() => {
          onLayerSelect('grey');
          onClose();
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px',
          borderRadius: '10px',
          cursor: 'pointer',
          marginBottom: '8px',
          backgroundColor: activeLayer === 'grey' ? '#e8f0fe' : 'transparent',
          border: activeLayer === 'grey' ? '1.5px solid #3b5bdb' : '1.5px solid transparent',
          transition: 'background 0.15s',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '8px',
            overflow: 'hidden',
            flexShrink: 0,
            border: '1px solid #ddd',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              background:
                'linear-gradient(135deg,#efefef 0%,#e0e0e0 40%,#d8d8d8 60%,#e8e8e8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" fill="#e8e8e8" />
              <path
                d="M4 12 Q12 8 20 14 Q28 20 28 24"
                stroke="#ccc"
                strokeWidth="1.5"
                fill="none"
              />
              <path d="M4 20 Q10 16 18 18 Q24 20 28 18" stroke="#ccc" strokeWidth="1" fill="none" />
              <rect x="6" y="6" width="8" height="5" rx="1" fill="#ddd" />
              <rect x="18" y="14" width="6" height="4" rx="1" fill="#ddd" />
            </svg>
          </div>
        </div>
        <span
          style={{
            fontSize: '14px',
            fontWeight: 500,
            color: activeLayer === 'grey' ? '#3b5bdb' : '#222',
          }}
        >
          Сіра карта
        </span>
      </div>

      <div
        onClick={() => {
          onLayerSelect('satellite');
          onClose();
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px',
          borderRadius: '10px',
          cursor: 'pointer',
          marginBottom: '4px',
          backgroundColor: activeLayer === 'satellite' ? '#e8f0fe' : 'transparent',
          border:
            activeLayer === 'satellite' ? '1.5px solid #3b5bdb' : '1.5px solid transparent',
          transition: 'background 0.15s',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '8px',
            overflow: 'hidden',
            flexShrink: 0,
            border: '1px solid #bbb',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
              background:
                'linear-gradient(135deg,#4a6741 0%,#3d5c36 25%,#5a7a4a 40%,#6b8c5b 55%,#4e6645 70%,#3a5530 85%,#567048 100%)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '30%',
                left: '20%',
                width: '18px',
                height: '10px',
                borderRadius: '3px',
                background: 'rgba(90,120,80,0.6)',
                transform: 'rotate(-15deg)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '55%',
                left: '50%',
                width: '14px',
                height: '8px',
                borderRadius: '2px',
                background: 'rgba(60,90,50,0.7)',
                transform: 'rotate(10deg)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '15%',
                right: '15%',
                width: '10px',
                height: '6px',
                borderRadius: '2px',
                background: 'rgba(120,160,100,0.5)',
              }}
            />
          </div>
        </div>
        <span
          style={{
            fontSize: '14px',
            fontWeight: 500,
            color: activeLayer === 'satellite' ? '#3b5bdb' : '#222',
          }}
        >
          Ortophoto 1:10K
        </span>
      </div>

      <div
        style={{
          height: '1px',
          background: '#f0f0f0',
          margin: '12px 0',
        }}
      />

      <div
        onClick={() => {
          onLayerSelect('none');
          onClose();
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 10px',
          borderRadius: '10px',
          cursor: 'pointer',
          backgroundColor: activeLayer === 'none' ? '#e8f0fe' : 'transparent',
          transition: 'background 0.15s',
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#555"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
        <span
          style={{
            fontSize: '14px',
            fontWeight: 500,
            color: activeLayer === 'none' ? '#3b5bdb' : '#555',
          }}
        >
          Приховати шар
        </span>
      </div>
    </div>
  );
};
