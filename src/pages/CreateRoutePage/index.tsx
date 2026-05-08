import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stack, useTheme, useMediaQuery, Button, Box } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import { PageWrapper } from '../../style/common';

import {
  MenuContainer,
  RegionsColumn,
  RegionItem,
  RegionText,
  CitiesColumn,
  CityItem,
  AnimatedCitiesWrapper,
} from './style';

const CITY_COORDS: Record<string, [number, number]> = {
  Vinnytsia: [49.233, 28.468], Zhmerynka: [49.039, 28.103], Tulchyn: [48.671, 28.845],
  Lutsk: [50.747, 25.325], Kovel: [51.216, 24.708], Volodymyr: [50.848, 24.319],
  Dnipro: [48.465, 35.046], 'Kryvyi Rih': [47.907, 33.386], Kamianske: [48.502, 34.623],
  Donetsk: [48.016, 37.803], Mariupol: [47.096, 37.543], Kramatorsk: [48.724, 37.552],
  Zhytomyr: [50.255, 28.659], Berdychiv: [49.899, 28.597], Korosten: [50.953, 28.656],
  Uzhhorod: [48.624, 22.295], Mukachevo: [48.441, 22.715], Berehove: [48.204, 22.643],
  Zaporizhzhia: [47.839, 35.140], Melitopol: [46.850, 35.371], Berdiansk: [46.759, 36.796],
  'Ivano-Frankivsk': [48.923, 24.711], Kolomyia: [48.528, 25.040], Yaremche: [48.453, 24.557],
  Kyiv: [50.450, 30.523], 'Bila Tserkva': [49.799, 30.117], Brovary: [50.512, 30.788],
  Kropyvnytskyi: [48.508, 32.262], Oleksandriia: [48.675, 33.114], Znamianka: [48.715, 32.671],
  Luhansk: [48.574, 39.308], Sievierodonetsk: [48.947, 38.492], Lysychansk: [48.906, 38.435],
  Lviv: [49.840, 24.030], Truskavets: [49.284, 23.506], Drohobych: [49.350, 23.506],
  Mykolaiv: [46.975, 31.995], Pervomaisk: [48.044, 30.857], Voznesensk: [47.560, 31.329],
  Odesa: [46.483, 30.723], Izmail: [45.344, 28.840], Chornomorsk: [46.301, 30.658],
  Poltava: [49.588, 34.551], Kremenchuk: [49.066, 33.419], Myrhorod: [49.975, 33.612],
  Rivne: [50.620, 26.252], Dubno: [50.408, 25.739], Ostroh: [50.338, 26.522],
  Sumy: [50.908, 34.798], Konotop: [51.235, 33.207], Shostka: [51.867, 33.480],
  Ternopil: [49.554, 25.595], Chortkiv: [49.013, 25.795], Kremenets: [50.094, 25.727],
  Kharkiv: [49.994, 36.230], Lozova: [48.888, 36.317], Izium: [49.208, 37.270],
  Kherson: [46.635, 32.617], 'Nova Kakhovka': [46.758, 33.375], Henichesk: [46.175, 34.820],
  Khmelnytskyi: [49.423, 26.988], 'Kamianets-Podilskyi': [48.678, 26.577], Shepetivka: [50.185, 27.065],
  Cherkasy: [49.444, 32.060], Uman: [48.748, 30.224], Smila: [49.221, 31.871],
  Chernivtsi: [48.292, 25.935], Khotyn: [48.506, 26.494], Storozhynets: [48.166, 25.721],
  Chernihiv: [51.498, 31.289], Nizhyn: [51.050, 31.882], Pryluky: [50.594, 32.387],
  Simferopol: [44.952, 34.102], Sevastopol: [44.589, 33.537], Yalta: [44.495, 34.166],
};

const destinationsData = [
  { region: 'VINNYTSIA OBLAST', cities: ['Vinnytsia', 'Zhmerynka', 'Tulchyn'] },
  { region: 'VOLYN OBLAST', cities: ['Lutsk', 'Kovel', 'Volodymyr'] },
  {
    region: 'DNIPROPETROVSK OBLAST',
    cities: ['Dnipro', 'Kryvyi Rih', 'Kamianske'],
  },
  { region: 'DONETSK OBLAST', cities: ['Donetsk', 'Mariupol', 'Kramatorsk'] },
  { region: 'ZHYTOMYR OBLAST', cities: ['Zhytomyr', 'Berdychiv', 'Korosten'] },
  {
    region: 'ZAKARPATTIA OBLAST',
    cities: ['Uzhhorod', 'Mukachevo', 'Berehove'],
  },
  {
    region: 'ZAPORIZHZHIA OBLAST',
    cities: ['Zaporizhzhia', 'Melitopol', 'Berdiansk'],
  },
  {
    region: 'IVANO-FRANKIVSK OBLAST',
    cities: ['Ivano-Frankivsk', 'Kolomyia', 'Yaremche'],
  },
  { region: 'KYIV OBLAST', cities: ['Kyiv', 'Bila Tserkva', 'Brovary'] },
  {
    region: 'KIROVOHRAD OBLAST',
    cities: ['Kropyvnytskyi', 'Oleksandriia', 'Znamianka'],
  },
  {
    region: 'LUHANSK OBLAST',
    cities: ['Luhansk', 'Sievierodonetsk', 'Lysychansk'],
  },
  { region: 'LVIV OBLAST', cities: ['Lviv', 'Truskavets', 'Drohobych'] },
  {
    region: 'MYKOLAIV OBLAST',
    cities: ['Mykolaiv', 'Pervomaisk', 'Voznesensk'],
  },
  { region: 'ODESA OBLAST', cities: ['Odesa', 'Izmail', 'Chornomorsk'] },
  { region: 'POLTAVA OBLAST', cities: ['Poltava', 'Kremenchuk', 'Myrhorod'] },
  { region: 'RIVNE OBLAST', cities: ['Rivne', 'Dubno', 'Ostroh'] },
  { region: 'SUMY OBLAST', cities: ['Sumy', 'Konotop', 'Shostka'] },
  { region: 'TERNOPIL OBLAST', cities: ['Ternopil', 'Chortkiv', 'Kremenets'] },
  { region: 'KHARKIV OBLAST', cities: ['Kharkiv', 'Lozova', 'Izium'] },
  {
    region: 'KHERSON OBLAST',
    cities: ['Kherson', 'Nova Kakhovka', 'Henichesk'],
  },
  {
    region: 'KHMELNYTSKYI OBLAST',
    cities: ['Khmelnytskyi', 'Kamianets-Podilskyi', 'Shepetivka'],
  },
  { region: 'CHERKASY OBLAST', cities: ['Cherkasy', 'Uman', 'Smila'] },
  {
    region: 'CHERNIVTSI OBLAST',
    cities: ['Chernivtsi', 'Khotyn', 'Storozhynets'],
  },
  { region: 'CHERNIHIV OBLAST', cities: ['Chernihiv', 'Nizhyn', 'Pryluky'] },
  { region: 'AR CRIMEA', cities: ['Simferopol', 'Sevastopol', 'Yalta'] },
];

export const CreateRoutePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const [activeRegionIndex, setActiveRegionIndex] = useState<number | null>(0);
  const [activeCity, setActiveCity] = useState<string | null>(null);
  const [showCitiesMobile, setShowCitiesMobile] = useState(false);

  const handleRegionClick = (index: number) => {
    setActiveRegionIndex(index);
    setActiveCity(null);
    if (isMobile) {
      setShowCitiesMobile(true);
    }
  };

  const handleCityClick = (city: string) => {
    setActiveCity(city);
    const region = activeRegionIndex !== null ? destinationsData[activeRegionIndex].region : '';
    const coords = CITY_COORDS[city];
    navigate(
      `/city/${encodeURIComponent(city)}?region=${encodeURIComponent(region)}`,
      coords ? { state: { lat: coords[0], lng: coords[1] } } : undefined,
    );
  };

  const handleBackToRegions = () => {
    setShowCitiesMobile(false);
  };

  const activeRegionData =
    activeRegionIndex !== null ? destinationsData[activeRegionIndex] : null;

  return (
    <PageWrapper sx={{ pt: 14, pb: 12 }}>
      <style>{`footer { display: none !important; }`}</style>

      <MenuContainer
        sx={{ m: 0, mx: { xs: 2, md: 8 }, alignItems: 'flex-start' }}
      >
        {/* КОЛОНКА 1: ОБЛАСТІ */}
        {(!isMobile || !showCitiesMobile) && (
          <RegionsColumn
            sx={{
              flex: { xs: 1, md: '0 0 350px' },
              pr: { xs: 0, md: 3 },
              width: '100%',
            }}
          >
            <Stack spacing={2}>
              {destinationsData.map((data, index) => (
                <RegionItem
                  key={data.region}
                  active={activeRegionIndex === index}
                  onClick={() => handleRegionClick(index)}
                >
                  <RegionText>{data.region}</RegionText>
                  <ChevronRightIcon fontSize="small" />
                </RegionItem>
              ))}
            </Stack>
          </RegionsColumn>
        )}

        {/* КОЛОНКА 2: МІСТА */}
        {(!isMobile || showCitiesMobile) && (
          <CitiesColumn
            sx={{
              flex: 1,
              width: '100%',
              minWidth: { xs: '100%', md: '300px' },
              position: { xs: 'static', md: 'sticky' },
              top: '120px',
            }}
          >
            {isMobile && (
              <Box sx={{ mb: 3 }}>
                <Button
                  onClick={handleBackToRegions}
                  sx={{ color: 'text.secondary', fontWeight: 'bold', pl: 0 }}
                >
                  ← Back to Regions
                </Button>
              </Box>
            )}

            {activeRegionData && (
              <AnimatedCitiesWrapper key={activeRegionData.region}>
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
              </AnimatedCitiesWrapper>
            )}
          </CitiesColumn>
        )}
      </MenuContainer>
    </PageWrapper>
  );
};
