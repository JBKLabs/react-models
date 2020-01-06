let listener = null;
const subscribe = (cb) => listener = cb;
const unsubscribe = () => {
  listener = null;
}

export const store = {
  models: {},
  reducers: {},
  effects: {},
  _definitions: {},
  subscribe,
  unsubscribe
};
window.store = store; // DEBUG

export const notify = () => {
  if (listener) {
    listener({
      models: store.models,
      effects: store.effects
    });
  }
}

export const setModelState = (name, state, doNotify = true) => {
  store.models[name] = state;
  if (doNotify) notify();
}

const mapReducer = (key, reducer) => (param) => {
  const state = store.models[key];
  const result = reducer(state, param);
  setModelState(key, result);
};

const refreshEffects = () => {
  store.effects = Object
    .keys(store._definitions)
    .reduce((agg, next) => ({
      ...agg,
      [next]: store._definitions[next](store.reducers)
    }), {});
}

export const initializeModel = (name, state, reducers, effects) => {
  store._definitions[name] = effects;
  store.reducers[name] = Object
    .keys(reducers)
    .reduce((agg, next) => ({
      ...agg,
      [next]: mapReducer(name, reducers[next])
    }), {});
  refreshEffects();
  setModelState(name, state, false);
};