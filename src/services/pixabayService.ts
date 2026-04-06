import type {PixabayResponse} from '../types/pixabay.ts';

// Отримуємо ключ із нашого .env (Vite автоматично підтягне його)
const API_KEY = import.meta.env.VITE_PIXABAY_API_KEY;
const BASE_URL = 'https://pixabay.com/api/';

export const fetchPhotosByQuery = async (query: string, perPage: number = 12): Promise<PixabayResponse> => {
  if (!API_KEY) {
    throw new Error('API Key is missing! Check your .env file.');
  }

  // Використовуємо URLSearchParams для зручного формування запиту
  const params = new URLSearchParams({
    key: API_KEY,
    q: query,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: 'true',
    per_page: perPage.toString(),
    lang: 'uk'
  });

  try {
    const response = await fetch(`${BASE_URL}?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Pixabay API error: ${response.status} ${response.statusText}`);
    }

    const data: PixabayResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data from Pixabay:', error);
    throw error; // Прокидаємо помилку далі, щоб компонент міг її обробити
  }
};