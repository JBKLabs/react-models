import React, { useState, useEffect } from 'react';

import ModelContext from './ModelContext';
import { store, notify } from './store';

const ModelProvider = ({ children }) => {
  const [context, setContext] = useState({});

  useEffect(() => {
    store.subscribe(setContext);
    notify();
    return store.unsubscribe;
  }, []);

  return (
    <ModelContext.Provider value={context}>{children}</ModelContext.Provider>
  );
};

export default ModelProvider;
