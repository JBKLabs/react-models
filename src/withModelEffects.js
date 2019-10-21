import React from 'react';

import ModelContext from './ModelContext';

const withModelEffects = (mapEffects) => (Component) => (props) => {
  const componentWrapper = (context) => {
    const { effects } = context;
    const mappedProps = effects ? mapEffects(effects) : {};

    return <Component {...mappedProps} {...props} />;
  };

  return (
    <ModelContext.Consumer>
      {(ctx) => componentWrapper(ctx)}
    </ModelContext.Consumer>
  );
};

export default withModelEffects;
