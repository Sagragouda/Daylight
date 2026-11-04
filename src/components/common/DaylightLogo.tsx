import React from 'react';
import { FocusUpLogo, FocusUpLogoProps } from './FocusUpLogo';

export type DaylightLogoProps = FocusUpLogoProps;

export const DaylightLogo: React.FC<DaylightLogoProps> = (props) => {
  return <FocusUpLogo {...props} />;
};

export { FocusUpLogo };
