import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stack, useTheme, useMediaQuery, Button, Box, CircularProgress } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import { PageWrapper } from '../../style/common';
import { getCities, type City } from '../../api/cities';

import {
  MenuContainer,
  RegionsColumn,
  RegionItem,
  RegionText,
  CitiesColumn,
  CityItem,
  AnimatedCitiesWrapper,
} from './style';

interface RegionGroup {
  region: string;
  cities: City[];
}

export const CreateRoutePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const [destinations, setDestinations] = useState<RegionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRegionIndex, setActiveRegionIndex] = useState<number | null>(0);
  const [activeCity, setActiveCity] = useState<string | null>(null);
  const [showCitiesMobile, setShowCitiesMobile] = useState(false);

  useEffect(() => {
    getCities().then((cities) => {
      const grouped = cities.reduce<Record<string, City[]>>((acc, city) => {
        if (!acc[city.region]) acc[city.region] = [];
        acc[city.region].push(city);
        return acc;
      }, {});

      setDestinations(
        Object.entries(grouped).map(([region, cities]) => ({ region, cities })),
      );
    }).finally(() => setLoading(false));
  }, []);

  const handleRegionClick = (index: number) => {
    setActiveRegionIndex(index);
    setActiveCity(null);
    if (isMobile) setShowCitiesMobile(true);
  };

  const handleCityClick = (city: City) => {
    setActiveCity(city.name);

    // Перенаправляємо на головну карту та центруємо на вибраному місті.
    // Маршрут не починаємо будувати (точку в маршрут не додаємо).
    navigate(`/map-page?lat=${city.lat}&lng=${city.lng}&zoom=12`);
  };

  const handleBackToRegions = () => {
    setShowCitiesMobile(false);
  };

  const activeRegionData = activeRegionIndex !== null ? destinations[activeRegionIndex] : null;

  if (loading) {
    return (
      <PageWrapper sx={{ pt: 14, pb: 12, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper sx={{ pt: 14, pb: 12 }}>
      <style>{`footer { display: none !important; }`}</style>

      <MenuContainer sx={{ m: 0, mx: { xs: 2, md: 8 }, alignItems: 'flex-start' }}>
        {(!isMobile || !showCitiesMobile) && (
          <RegionsColumn
            sx={{
              flex: { xs: 1, md: '0 0 350px' },
              pr: { xs: 0, md: 3 },
              width: '100%',
            }}
          >
            <Stack spacing={2}>
              {destinations.map((data, index) => (
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
                      key={city.id}
                      active={activeCity === city.name}
                      onClick={() => handleCityClick(city)}
                    >
                      {city.name}
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
