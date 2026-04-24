import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Card,
  CardMedia,
  CardActionArea,
  Collapse,
} from '@mui/material';
import type { CityCardData } from '../ContentData/types';
import { CardsSection, CityCard, CityNameOverlay } from '../../style.tsx';
import { PrimaryButton, CollapseButton } from '../../../../style/common.tsx';

interface CityCardsSectionProps {
  cities: CityCardData[];
}

export const CityCardsSection: React.FC<CityCardsSectionProps> = ({
  cities,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Фільтруємо унікальні міста
  const uniqueCities = useMemo(() => {
    const seenIds = new Set();
    return cities.filter((city) => {
      if (seenIds.has(city.id)) {
        return false;
      }
      seenIds.add(city.id);
      return true;
    });
  }, [cities]);

  // Розділяємо масив на дві частини: перші 3 міста та всі інші
  const initialCities = uniqueCities.slice(0, 3);
  const remainingCities = uniqueCities.slice(3);

  const handleToggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  // Спільні стилі для сітки, щоб не дублювати код
  const gridStyles = {
    display: 'grid',
    gap: 3,
    gridTemplateColumns: {
      xs: '1fr',
      sm: '1fr 1fr',
      md: '1fr 1fr 1fr',
    },
  };

  return (
    <CardsSection>
      <Container maxWidth="lg">
        {/* Завжди видимі перші 3 картки */}
        <Box sx={gridStyles}>
          {initialCities.map((city) => (
            <CityCard as={Card} key={city.id}>
              <CardActionArea href={city.linkUrl}>
                <CardMedia
                  component="img"
                  height="214"
                  image={city.imageUrl}
                  alt={city.cityName}
                />
                <CityNameOverlay variant="h3" component="div">
                  {city.cityName}
                </CityNameOverlay>
              </CardActionArea>
            </CityCard>
          ))}
        </Box>

        {/* Анімований блок для решти карток */}
        {remainingCities.length > 0 && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box sx={{ ...gridStyles, mt: 3 }}>
              {remainingCities.map((city) => (
                <CityCard as={Card} key={city.id}>
                  <CardActionArea href={city.linkUrl}>
                    <CardMedia
                      component="img"
                      height="214"
                      image={city.imageUrl}
                      alt={city.cityName}
                    />
                    <CityNameOverlay variant="h3" component="div">
                      {city.cityName}
                    </CityNameOverlay>
                  </CardActionArea>
                </CityCard>
              ))}
            </Box>
          </Collapse>
        )}

        {/* Кнопки розгортання/згортання */}
        {uniqueCities.length > 3 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            {!isExpanded ? (
              <PrimaryButton onClick={handleToggleExpand}>
                View more
              </PrimaryButton>
            ) : (
              <CollapseButton
                isOpen={isExpanded}
                onClick={handleToggleExpand}
              />
            )}
          </Box>
        )}
      </Container>
    </CardsSection>
  );
};
