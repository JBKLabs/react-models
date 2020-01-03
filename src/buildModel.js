import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import ModelContext from './ModelContext';
import defaultTransform from './defaultTransform';

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

  /* eslint-disable react-hooks/rules-of-hooks */
  const modelHook = (...args) => {
    if (args.length > 1) {
      throw new Error(
        'Unexpected number of args for model hook.\nRefer to the documentation for model hooks.'
      );
    }

    const param = args.length === 1 ? args[0] : null;
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
      [param]
    );

    const ctx = useContext(ModelContext);

    useEffect(() => {
      ctx.newModel(name, state, reducers, effects);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const model = useMemo(() => ctx.models ? ctx.models[name] : null, [ctx]);
    const [result, setResult] = useState([]);

    useEffect(() => {
      if (model) {
        const allItems = mapStateToList(model);
        setResult(transform(allItems));
      }
    }, [model, transform]);

    return result;
  };

  return modelHook;
  /* eslint-enable react-hooks/rules-of-hooks */
};

export default buildModel;
