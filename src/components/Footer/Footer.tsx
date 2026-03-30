import React from 'react';

// Використовуємо іменований експорт (export const), як ви просили.
// Тепер у Layout.tsx можна писати import { Footer } ...
export const Footer: React.FC = () => {
  return (
    // Задаємо базовий темний фон і світлий текст, щоб нагадувало референс
    <footer style={{ backgroundColor: '#111', color: '#fff', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      
      {/* 1. БЛОК-АКОРДЕОН (UKRAINE TRIP, USEFUL INFO, WHO/WHAT) */}
      {/* Поки що просто дизайн, плюсики не натискаються */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', padding: '15px 0' }}>
          <span style={{ fontWeight: 'bold', letterSpacing: '1px' }}>UKRAINE TRIP</span>
          <span style={{ fontSize: '20px' }}>+</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', padding: '15px 0' }}>
          <span style={{ fontWeight: 'bold', letterSpacing: '1px' }}>USEFUL INFORMATION</span>
          <span style={{ fontSize: '20px' }}>+</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', padding: '15px 0' }}>
          <span style={{ fontWeight: 'bold', letterSpacing: '1px' }}>WHO/WHAT</span>
          <span style={{ fontSize: '20px' }}>+</span>
        </div>
      </div>

      {/* 2. ПІДПИСКА НА НОВИНИ (NEWSLETTER) */}
      <div style={{ marginBottom: '40px' }}>
        <h4 style={{ fontSize: '12px', letterSpacing: '1px', marginBottom: '10px' }}>SIGN UP TO OUR NEWSLETTER</h4>
        <div style={{ display: 'flex', height: '40px' }}>
          <input 
            type="email" 
            placeholder="youremail@example.com" 
            // Додали color: '#000', щоб текст в інпуті був чорним
            style={{ flex: 1, padding: '10px', border: 'none', outline: 'none', color: '#000' }}
          />
          <button style={{ backgroundColor: '#000', color: '#fff', border: '1px solid #fff', borderLeft: 'none', padding: '0 20px', cursor: 'pointer' }}>
            {'>'}
          </button>
        </div>
      </div>

      {/* 3. СОЦМЕРЕЖІ (SOCIALS) */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '40px', fontSize: '20px' }}>
        {/* Поки що просто текст, потім замінимо на іконки */}
        <span>[IG]</span>
        <span>[YT]</span>
        <span>[IN]</span>
        <span>[SP]</span>
      </div>

      {/* 4. КОНТАКТИ ТА ЮРИДИЧНА ІНФОРМАЦІЯ */}
      <div style={{ fontSize: '11px', color: '#ccc', lineHeight: '1.6' }}>
        <p style={{ marginBottom: '10px' }}>Головний офіс, вулиця Хрещатик 22, Київ, 01001</p>
        
        <p style={{ marginBottom: '20px', fontWeight: 'bold', color: '#fff' }}>+380 44 123 45 67</p>
        
        <p style={{ fontStyle: 'italic' }}>
          Туристичні послуги надаються компанією Ukraine Trip як офіційним оператором в Україні.<br />
          Будь ласка, ознайомтеся з нашими умовами бронювання для отримання додаткової інформації.<br />
          &copy; 2026 Ukraine Trip.<br />
          Дзвінки можуть записуватися з метою навчання та контролю якості.
        </p>
      </div>

    </footer>
  );
};

// Зверни увагу: рядок "export default Footer;" ми видалили, як ти просив.