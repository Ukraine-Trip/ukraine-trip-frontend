import { useState } from 'react';
import { Stack } from '@mui/material';

import { PageWrapper } from '../../style/common';

import {
  MenuContainer,
  RegionsColumn,
  RegionItem,
  RegionText,
  CitiesColumn,
  CityItem,
} from './style';

const destinationsData = [
  { region: 'ВІННИЦЬКА ОБЛАСТЬ', cities: ['Вінниця', 'Жмеринка', 'Тульчин'] },
  { region: 'ВОЛИНСЬКА ОБЛАСТЬ', cities: ['Луцьк', 'Ковель', 'Володимир'] },
  {
    region: 'ДНІПРОПЕТРОВСЬКА ОБЛАСТЬ',
    cities: ['Дніпро', 'Кривий Ріг', "Кам'янське"],
  },
  {
    region: 'ДОНЕЦЬКА ОБЛАСТЬ',
    cities: ['Донецьк', 'Маріуполь', 'Краматорськ'],
  },
  {
    region: 'ЖИТОМИРСЬКА ОБЛАСТЬ',
    cities: ['Житомир', 'Бердичів', 'Коростень'],
  },
  {
    region: 'ЗАКАРПАТСЬКА ОБЛАСТЬ',
    cities: ['Ужгород', 'Мукачево', 'Берегове'],
  },
  {
    region: 'ЗАПОРІЗЬКА ОБЛАСТЬ',
    cities: ['Запоріжжя', 'Мелітополь', 'Бердянськ'],
  },
  {
    region: 'ІВАНО-ФРАНКІВСЬКА ОБЛАСТЬ',
    cities: ['Івано-Франківськ', 'Коломия', 'Яремче'],
  },
  { region: 'КИЇВСЬКА ОБЛАСТЬ', cities: ['Київ', 'Біла Церква', 'Бровари'] },
  {
    region: 'КІРОВОГРАДСЬКА ОБЛАСТЬ',
    cities: ['Кропивницький', 'Олександрія', "Знам'янка"],
  },
  {
    region: 'ЛУГАНСЬКА ОБЛАСТЬ',
    cities: ['Луганськ', 'Сєвєродонецьк', 'Лисичанськ'],
  },
  { region: 'ЛЬВІВСЬКА ОБЛАСТЬ', cities: ['Львів', 'Трускавець', 'Дрогобич'] },
  {
    region: 'МИКОЛАЇВСЬКА ОБЛАСТЬ',
    cities: ['Миколаїв', 'Первомайськ', 'Вознесенськ'],
  },
  { region: 'ОДЕСЬКА ОБЛАСТЬ', cities: ['Одеса', 'Ізмаїл', 'Чорноморськ'] },
  {
    region: 'ПОЛТАВСЬКА ОБЛАСТЬ',
    cities: ['Полтава', 'Кременчук', 'Миргород'],
  },
  { region: 'РІВНЕНСЬКА ОБЛАСТЬ', cities: ['Рівне', 'Дубно', 'Острог'] },
  { region: 'СУМСЬКА ОБЛАСТЬ', cities: ['Суми', 'Конотоп', 'Шостка'] },
  {
    region: 'ТЕРНОПІЛЬСЬКА ОБЛАСТЬ',
    cities: ['Тернопіль', 'Чортків', 'Кременець'],
  },
  { region: 'ХАРКІВСЬКА ОБЛАСТЬ', cities: ['Харків', 'Лозова', 'Ізюм'] },
  {
    region: 'ХЕРСОНСЬКА ОБЛАСТЬ',
    cities: ['Херсон', 'Нова Каховка', 'Генічеськ'],
  },
  {
    region: 'ХМЕЛЬНИЦЬКА ОБЛАСТЬ',
    cities: ['Хмельницький', "Кам'янець-Подільський", 'Шепетівка'],
  },
  { region: 'ЧЕРКАСЬКА ОБЛАСТЬ', cities: ['Черкаси', 'Умань', 'Сміла'] },
  {
    region: 'ЧЕРНІВЕЦЬКА ОБЛАСТЬ',
    cities: ['Чернівці', 'Хотин', 'Сторожинець'],
  },
  { region: 'ЧЕРНІГІВСЬКА ОБЛАСТЬ', cities: ['Чернігів', 'Ніжин', 'Прилуки'] },
  { region: 'АР КРИМ', cities: ['Сімферополь', 'Севастополь', 'Ялта'] },
];

export const CreateRoutePage = () => {
  const [activeRegionIndex, setActiveRegionIndex] = useState<number | null>(0);
  const [activeCity, setActiveCity] = useState<string | null>(null);

  const handleRegionClick = (index: number) => {
    setActiveRegionIndex(index);
    setActiveCity(null);
  };

  const handleCityClick = (city: string) => {
    setActiveCity(city);
  };

  const activeRegionData =
    activeRegionIndex !== null ? destinationsData[activeRegionIndex] : null;

  return (
    // Прибрали фіксовану висоту і overflow: hidden, тепер сторінка скролиться природно
    <PageWrapper sx={{ pt: 14, pb: 8 }}>
      {/* МАГІЯ: Цей стиль приховає футер глобально, але тільки поки відкрита ця сторінка */}
      <style>{`footer { display: none !important; }`}</style>

      {/* alignItems: 'flex-start' дуже важливий для того, щоб sticky працював правильно */}
      <MenuContainer
        sx={{ m: 0, ml: { xs: 2, md: 8 }, alignItems: 'flex-start' }}
      >
        {/* КОЛОНКА 1: ОБЛАСТІ */}
        <RegionsColumn sx={{ flex: '0 0 350px', pr: 3 }}>
          <Stack spacing={2}>
            {destinationsData.map((data, index) => (
              <RegionItem
                key={data.region}
                active={activeRegionIndex === index}
                onClick={() => handleRegionClick(index)}
              >
                <RegionText>{data.region}</RegionText>
                <RegionText>{'>'}</RegionText>
              </RegionItem>
            ))}
          </Stack>
        </RegionsColumn>

        {/* КОЛОНКА 2: МІСТА (Зробили липкою) */}
        <CitiesColumn
          sx={{
            flex: 1,
            minWidth: '300px',
            position: 'sticky', // Колонка прилипає до екрана
            top: '120px', // Відступ зверху (щоб не залазила під хедер)
          }}
        >
          {activeRegionData && (
            <Stack spacing={2.5}>
              {activeRegionData.cities.map((city) => (
                <CityItem
                  key={city}
                  active={activeCity === city}
                  onClick={() => handleCityClick(city)}
                >
                  {city}
                </CityItem>
              ))}
            </Stack>
          )}
        </CitiesColumn>
      </MenuContainer>
    </PageWrapper>
  );
};
