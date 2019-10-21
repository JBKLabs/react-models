import React, { useState, useCallback, useEffect, useMemo } from 'react';

import ModelContext from './ModelContext';

const ModelProvider = ({ children }) => {
  const [global, setGlobal] = useState({});

  const newModel = useCallback(
    (name, state, reducers, effects) =>
      setGlobal((prev) => ({
        ...prev,
        models: {
          ...prev.models,
          [name]: state
        },
        _definitions: {
          ...prev._definitions,
          [name]: {
            reducers,
            effects
          }
        }
      })),
    []
  );

  const replaceModel = useCallback(
    (name, state) =>
      setGlobal((prev) => ({
        ...prev,
        models: {
          ...prev.models,
          [name]: state
        }
      })),
    []
  );

  useEffect(() => {
    if (!global.models) {
      return;
    }

    const reducers = Object.keys(global.models).reduce(
      (appReducers, nextModel) => ({
        ...appReducers,
        [nextModel]: Object.keys(
          global._definitions[nextModel].reducers
        ).reduce(
          (modelReducers, nextFunc) => ({
            ...modelReducers,
            [nextFunc]: (param) => {
              const nextState = global._definitions[nextModel].reducers[
                nextFunc
              ](global.models[nextModel], param);
              replaceModel(nextModel, nextState);
            }
          }),
          {}
        )
      }),
      {}
    );

    const effects = Object.keys(global.models).reduce(
      (appEffects, nextModel) => ({
        ...appEffects,
        [nextModel]: global._definitions[nextModel].effects(reducers)
      }),
      {}
    );

    setGlobal((prev) => ({
      ...prev,
      reducers,
      effects
    }));
  }, [global.models, global._definitions, replaceModel]);

  const value = useMemo(
    () => ({
      models: global.models,
      effects: global.effects,
      newModel
    }),
    [global.models, global.effects, newModel]
  );

  return (
    <ModelContext.Provider value={value}>{children}</ModelContext.Provider>
  );
};

export default ModelProvider;
