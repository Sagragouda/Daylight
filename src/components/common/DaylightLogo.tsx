import React from 'react';
import { FloworaLogo, FloworaLogoProps } from './FloworaLogo';

export type DaylightLogoProps = FloworaLogoProps;

export const DaylightLogo: React.FC<DaylightLogoProps> = (props) => {
  return <FloworaLogo {...props} />;
};

export { FloworaLogo };
