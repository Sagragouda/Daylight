import React from 'react';
import { FocusUpLogo, FocusUpLogoProps } from './FocusUpLogo';

export type FloworaLogoProps = FocusUpLogoProps;

export const FloworaLogo: React.FC<FloworaLogoProps> = (props) => {
  return <FocusUpLogo {...props} />;
};

export { FocusUpLogo };
