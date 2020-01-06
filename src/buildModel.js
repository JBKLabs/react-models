import { useCallback, useContext, useEffect, useState } from 'react';

import ModelContext from './ModelContext';
import defaultTransform from './defaultTransform';
import { initializeModel } from './store';

const buildModel = ({
  name,
  state = {},
  reducers = {},
  effects = () => ({}),
  mapStateToList = (modelState) => Object.values(modelState)
}) => {
  if (!name) {
    throw new Error('Name is a required key for buildModel');
  }

  initializeModel(name, state, reducers, effects);

  /* eslint-disable react-hooks/rules-of-hooks */
  const modelHook = (...args) => {
    if (args.length > 1) {
      throw new Error(
        'Unexpected number of args for model hook.\nRefer to the documentation for model hooks.'
      );
    }

    const param = args.length === 1 ? args[0] : null;
    const savedParam =
      typeof param === 'object' ? JSON.stringify(param) : param.toString();

    const transform = useCallback(
      (items) => {
        if (!param) {
          return items;
        }

        if (typeof param === 'object') {
          return defaultTransform(param)(items);
        }

        if (typeof param === 'function') {
          return param(items);
        }

        throw new Error(
          'Invalid callback provided. Expected either an object or a callback function.\nRefer to the documentation for model hooks.'
        );
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [savedParam]
    );

    const ctx = useContext(ModelContext);
    const models = ctx.models || {};
    const current = models[name];
    const [result, setResult] = useState([]);

    useEffect(() => {
      if (current) {
        const allItems = mapStateToList(current);
        setResult(transform(allItems));
      }
    }, [current, transform]);

    return result;
  };

  return modelHook;
  /* eslint-enable react-hooks/rules-of-hooks */
};

export default buildModel;
