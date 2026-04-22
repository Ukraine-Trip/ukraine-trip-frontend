import React, { useState, useMemo } from 'react';
import { Box, Container, Card, CardMedia, CardActionArea } from '@mui/material';
import type { CityCardData } from '../ContentData/types';
import { CardsSection, CityCard, CityNameOverlay } from '../../style.tsx';
<<<<<<< Updated upstream
import { PrimaryButton } from '../../../../style/common.tsx';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
=======
import {PrimaryButton} from "../../../../style/common.tsx";
import {Link} from "react-router-dom";
>>>>>>> Stashed changes

interface CityCardsSectionProps {
  cities: CityCardData[];
}

export const CityCardsSection: React.FC<CityCardsSectionProps> = ({
  cities,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

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

  const visibleCities = isExpanded ? uniqueCities : uniqueCities.slice(0, 3);

  const handleShowMore = () => {
    setIsExpanded(true);
  };

  const handleCollapse = () => {
    setIsExpanded(false);
  };

  return (
    <CardsSection>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
              md: '1fr 1fr 1fr',
            },
            mb: 3,
          }}
        >
          {visibleCities.map((city) => (
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

<<<<<<< Updated upstream
        {!isExpanded && uniqueCities.length > 3 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <PrimaryButton onClick={handleShowMore}>View more</PrimaryButton>
          </Box>
        )}

        {isExpanded && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <PrimaryButton
              onClick={handleCollapse}
              startIcon={<ExpandLessIcon />}
            </PrimaryButton>
          </Box>
        )}
=======
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>          <PrimaryButton
            component={Link}
            to="/*"
            sx={{ mt: 4 }}
        >
            View more
        </PrimaryButton>
        </Box>
>>>>>>> Stashed changes
      </Container>
    </CardsSection>
  );
};
