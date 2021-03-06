import React from 'react';
import PropTypes from 'prop-types';
import { SeparatedList } from '@components';

export const SeriesLanguages = ({ metadata, ...props }) => {
  return <SeparatedList items={metadata.languages || []} {...props} />;
};

SeriesLanguages.propTypes = {
  metadata: PropTypes.object.isRequired,
};
