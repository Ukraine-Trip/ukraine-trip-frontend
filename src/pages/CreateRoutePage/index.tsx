import React, { useState } from 'react';
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
