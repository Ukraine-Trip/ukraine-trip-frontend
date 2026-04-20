import React from 'react';
import { TitleBlockSection, AnimatedRevealText } from '../../style';

export const TitleBlock: React.FC = () => {
  return (
    <TitleBlockSection>
      <AnimatedRevealText>
        <div className="static-text">Start</div>
        <div className="reveal-wrapper">
          <span>&nbsp;your journey now!</span>
        </div>
      </AnimatedRevealText>
    </TitleBlockSection>
  );
};
