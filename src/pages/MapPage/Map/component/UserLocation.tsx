import { useState, useEffect } from 'react';
import { useMap, Marker, Circle } from 'react-leaflet';
import L from 'leaflet';

// Кастомна іконка — синя крапка з білою обводкою (як Google Maps)
const userIcon = L.divIcon({
  className: '',
  html: `
    <div style="
      width: 18px; height: 18px;
      background: #000;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 0 2px #000;
    "></div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

interface UserLocationProps {
  // ctrlTop — відступ від верху, щоб кнопка геолокації була під кнопкою шарів
  ctrlTop: number;
}

export const UserLocation: React.FC<UserLocationProps> = ({ ctrlTop }) => {
  const map = useMap();

  // position — координати користувача, null поки геолокацію не запрошено
  const [position, setPosition] = useState<[number, number] | null>(null);
  // accuracy — радіус точності в метрах (для кола навколо маркера)
  const [accuracy, setAccuracy] = useState<number>(0);
  // loading — true поки чекаємо відповідь від браузера
  const [loading, setLoading] = useState(false);
  // error — текст помилки якщо геолокація не спрацювала
  const [error, setError] = useState<string | null>(null);

  // Після того як позиція отримана — запускаємо watchPosition
  // щоб маркер оновлювався автоматично при русі користувача
  useEffect(() => {
    if (!position) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setPosition([latitude, longitude]);
        setAccuracy(accuracy);
      },
      () => {},
      { enableHighAccuracy: true }
    );

    // Зупиняємо слідкування при розмонтуванні компонента
    return () => navigator.geolocation.clearWatch(watchId);
  }, [!!position]); // залежність — лише факт наявності позиції, не самі координати

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setError('Геолокація не підтримується браузером');
      return;
    }

    setLoading(true);
    setError(null);

    // Перший запит геолокації — після отримання летимо до позиції користувача
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const latlng: [number, number] = [latitude, longitude];
        setPosition(latlng);
        setAccuracy(accuracy);
        setLoading(false);
        // Плавна анімація польоту до користувача
        map.flyTo(latlng, 15, { animate: true, duration: 1.2 });
      },
      (err) => {
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setError('Доступ до геолокації заборонено');
        } else {
          setError('Не вдалось визначити місцезнаходження');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Якщо позиція вже є — повторне натискання просто центрує карту
  const handleCenter = () => {
    if (position) {
      map.flyTo(position, 15, { animate: true, duration: 1.2 });
    }
  };

  return (
    <>
      {/* Маркер + коло точності — рендеряться тільки після отримання геолокації */}
      {position && (
        <>
          {/* Напівпрозоре коло — показує точність визначення позиції */}
          <Circle
            center={position}
            radius={accuracy}
            pathOptions={{ color: '#000', fillColor: '#000', fillOpacity: 0.1, weight: 1 }}
          />
          {/* Синій маркер позиції користувача */}
          <Marker position={position} icon={userIcon} />
        </>
      )}

      {/* Кнопка геолокації — розміщена на правому боці */}
      <div
        style={{
          position: 'absolute',
          top: ctrlTop,
          right: '16px',
          zIndex: 9999,
        }}
      >
        <div
          // Перший клік — запитує геолокацію; наступні — центрують карту
          onClick={position ? handleCenter : handleLocate}
          title={position ? 'Центрувати на мені' : 'Моя геолокація'}
          style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: loading ? 'wait' : 'pointer',
            border: position ? '1.5px solid #000' : '1px solid #e8e8e8',
            transition: 'border 0.2s',
          }}
        >
          {loading ? (
            // Спінер поки чекаємо відповідь браузера
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/>
              </path>
            </svg>
          ) : (
            // Іконка геолокації — синя якщо активна, сіра якщо ні
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                 stroke={position ? '#000' : '#555'}
                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
              <circle cx="12" cy="12" r="9" strokeOpacity="0.3"/>
            </svg>
          )}
        </div>

        {/* Повідомлення про помилку — з'являється ліворуч від кнопки */}
        {error && (
          <div style={{
            position: 'absolute',
            right: '52px',
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: '#fff3f3',
            border: '1px solid #ffcdd2',
            borderRadius: '8px',
            padding: '6px 10px',
            fontSize: '12px',
            color: '#c62828',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}>
            {error}
          </div>
        )}
      </div>
    </>
  );
};