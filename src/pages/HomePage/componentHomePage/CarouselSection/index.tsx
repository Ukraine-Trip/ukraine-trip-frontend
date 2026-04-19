import React from 'react';
import { Box } from '@mui/material';
import type { CarouselItemData } from '../ContentData/types.ts';
import { PageTitle } from '../../../../style/common.tsx';
import {
  CarouselSection as StyledCarouselSection,
  CarouselWrapper,
  CarouselHeader,
  CarouselSubtitle,
  CarouselContainer,
  CarouselCard,
  LocationBadge,
  BadgeText,
  DescriptionText,
  ExploreButton,
} from '../../style.tsx';

interface CarouselSectionProps {
  carousel: CarouselItemData[];
}

export const CarouselSection: React.FC<CarouselSectionProps> = ({
  carousel,
}) => {
  return (
    <StyledCarouselSection>
      <CarouselWrapper maxWidth="lg">
        <CarouselHeader>
          <PageTitle>Explore our trips</PageTitle>
          <CarouselSubtitle variant="h6">
            Incredible, breathtaking sensations
          </CarouselSubtitle>
        </CarouselHeader>

        <CarouselContainer>
          {carousel.map((item) => (
            <CarouselCard key={item.id} elevation={0}>
              <Box className="image-wrapper">
                <Box
                  component="img"
                  src={item.imageUrl}
                  alt={item.location}
                  className="card-image"
                />
                <Box className="gradient-overlay" />
              </Box>

              <LocationBadge>
                <BadgeText variant="caption">{item.location}</BadgeText>
              </LocationBadge>

              <Box className="card-content">
                <DescriptionText variant="h5">
                  {item.description}
                </DescriptionText>
                <ExploreButton variant="contained">Explore Trip</ExploreButton>
              </Box>
            </CarouselCard>
          ))}
        </CarouselContainer>
      </CarouselWrapper>
    </StyledCarouselSection>
  );
};
