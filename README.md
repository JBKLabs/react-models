# React Models

Global state management in the world of hooks.

**Wrap your app**

```jsx
import { ModelProvider } from '@jbknowledge/react-models';

ReactDOM.render(
  <ModelProvider>
    <App />
  </ModelProvider>,
  document.getElementById('root')
);
```

**Define a Model**

```jsx
import { buildModel } from '@jbknowledge/react-models';

const model = {
  name: 'users',
  state: {
    // initial state
    0: {
      id: 0,
      firstName: 'John',
      lastName: 'Doe'
    },
    1: {
      id: 1,
      firstName: 'Jane',
      lastName: 'Doe'
    }
  },
  reducers: {
    setUser: (state, param) => state // immutable reducers
  },
  effects: (dispatch) => ({
    // run async side effects
    addUserAsync: async (user) => {
      // access reducers for all models
      dispatch.users.setUser({
        id: uuid(),
        ...user
      });
    }
  })
};

export const useUsers = buildModel(model);
```

**Read from Global State**

```jsx
import useUsers from './modelDefinition';

const ListView = () => {
  const allUsers = useUsers();
  ...
}
```

**Pass in Model effects as props**

```jsx
import { withModelEffects } from '@jbknowledge/react-models';

const Component = ({ addUserAsync }) => {...};

const mapEffects = ({
  users: { addUserAsync }
}) => ({
  addUserAsync
});

export default withModelEffects(mapEffects)(Component);
```

## Installation

```bash
npm install @jbknowledge/react-models
```

## API

This library exports the following:

- `buildModel`
- `ModelProvider`
- `withModelEffects`

### **buildModel(modelDefinition)**

`buildModel` is a react hook factory.

```jsx
const useItems = buildModel(itemDefinition);

const Component = () => {
  const allItems = useItems();
};
```

`buildModel` expects a single argument: `modelDefinition` which must match the following schema.

```json
{
  "name": "[string.unique.required]",
  "state": "[any.optional]",
  "reducers": {
    "*": "[function.optional]"
  },
  "effects": "[function.optional]",
  "mapStateToList": "[function.optional]"
}
```

**name**: A unique identifier for the model. This is used when accessing reducers from effects and when accessing effects from `withModelEffects`. This param is the only required param and **should almost always be unique**.

i.e.

```jsx
const modelDefinition = {
  ...,
  name: 'unique',
  reducers: {
    apply: (state, param) => state,
  },
  effects: dispatch => ({
    applyAsync: async (param) => {
      dispatch.unique.apply(param);
      /*
        Our effect is able to access the reducer "apply" via
        dispatch[name][reducerName].
      */
    }
  })
}

const Component = ({ applyAsync }) => (...);

const mapEffects = (models) => ({
  applyAsync: models.unique.applyAsync,
});
/*
  Our mapping function which is passed into "withModelEffects"
  has access to the effect "applyAsync" via models[name][effectName].
*/

export default withModelEffects(mapEffects)(Component);
```

**state**: Optionally declare your model's initial state. If excluded, your initial state will default to an empty object.

**reducers**: Optionally declare one or more reducers for your model state. Each key should be a function which takes the current state and a param and returns the new state:

```js
const reducer = (oldState, param) => {
  const newState = ...;
  return newState;
}
```

These reducers are accessible to all model `effects` via `dispatch[modelName][reducerName]`. For example:

```js
const model = {
  ...,
  name: 'items',
  reducers: {
    apply: (state, param) => state
  }
};
```

will be accessible to model `effects` as `dispatch.items.apply`.

_Note_: model `reducers` can have at most two args, the current state, and a param. If you need to pass in multiple values, we recommend using an object as your param, i.e.

```js
const model = {
  ...,
  name: 'items',
  effects: dispatch => ({
    applyAsync: async () => {
      dispatch.items.apply({
        arg1: 'value',
        arg2: true,
      });
    }
  })
}
```

In this case, your reducer definition will receive a `param` which is equal to: `{ arg1: 'value', arg2: true }`.

**effects**: Optionally declare one or more model side effects via an object factory. The `effects` key must be a function and will recieve a single argument, `dispatch`, which contains all reducers for **all models**, not just the model being defined.

```js
// items model definition
const items = {
  ...,
  name: 'items',
  reducers: {
    setItem: ...
  }
};

// things model definition
const things = {
  ...,
  name: 'things',
  reducers: {
    setThing: ...
  },
  effects: dispatch => ({
    applyAsync: async () => {
      dispatch.items.setItem();
      dispatch.things.setThing();
      /*
        All effects can access all model's reducers
      */
    }
  })
}
```

**mapStateToList**: Optionally declare a mapping function to convert your state into a list of items. By default, it is assumed that your state is structured like the following:

```js
{
  [id]: [entity],
  [id]: [entity],
  ...
}
```

i.e.

```js
{
  0: { "id": 0, "firstName": "john", "lastName": "doe" },
  1: { "id": 1, "firstName": "jane", "lastName": "doe" }
}
```

If your state matches this structure, then you do not need to specify `mapStateToList`. In all other cases, you will need to declare `mapStateToList` as a function which takes your state and returns an array of entities.

i.e.

```js
const model = {
  ...,
  state: {
    nextId: 0,
    items: [
      {...},
      {...},
      ...
    ]
  },
  mapStateToList: state => state.items,
}
```

**buildModel generated hooks**

`buildModel`'s return value is a react hook which can be used to pull entities of that type out of global state.

```js
const useItems = buildModel(itemDefinition);

const Component = () => {
  const allItems = useItems();
};
```

More specifically, it returns a function `useModel(param)`.

**param**: Optionally pass in to filter/transform/sort/etc your items. `param` itself can be either an `object` or a `function`.

**typeof param === 'object'**

If you call the built model hook with an object parameter, then you will recieve all entities which exactly match each specified key. For example:

```jsx
const model = {
  ...,
  state: {
    0: { firstName: 'John', lastName: 'Doe' },
    1: { firstName: 'George', lastName: 'Washington' },
    2: { firstName: 'Jane', lastName: 'Doe' },
  }
}

const useModel = buildModel(model);

const Component = () => {
  const filteredUsers = useModel({ lastName: 'Doe' });
  /*
    useModel will return all entities which have the key "firstName" which
    exactly matches "Doe". In this case, it would return:
    [
      { firstName: 'John', lastName: 'Doe' },
      { firstName: 'Jane', lastName: 'Doe' }
    ]
  */
}
```

**typeof param === 'function'**

Alternative to the more restrictive object param which filters by exact matches, you can pass in a callback function instead. This function will be called with all entities currently in your global state and will pass the return value as the output of the useModel hook. In this callback, you can filter via more complex rules, sort, transform/map your entities, or anything else you desire.

```js
const Component = () => {
  const sorted = useModel(items => items.sort(...));
  const numJohns = useModel(items => items.filter(...).reduce(..., 0));
  // etc
}
```

### **ModelProvider**

`ModelProvider` takes no props and implicitly manages all of your global state for each model on your behalf. It is recommended to wrap your entire App like the following:

```jsx
import { ModelProvider } from '@jbnowledge/react-models';

ReactDOM.render(
  <ModelProvider>
    <App />
  </ModelProvider>,
  document.getElementById('root')
);
```

### **withModelEffects(mapEffects)(Component)**

`withModelEffects` is an HoC which allows you to inject any model's effects into your component as props.

**mapEffects**: A Function which is provided all effects nested by model, i.e. `models.items.applyAsync`, and expects an object to be returned.

```js
const mapEffects = (models) => ({
  apply: models.items.applyAsync
});
```

The object that is returned will be applied to the `Component` your provide as an argument as props.

**Component**: The react component which needs model `effects` to be injected in.

```js

const Component = ({ someEffect }) => (...);

const mapEffects = ({
  items: { someEffect },
}) => ({ someEffect });

export default withModelEffects(mapEffects)(Component);
/*
  This results in the component <Component someEffect={models.items.someEffect} />
*/
```

## Contributors

`react-models` was built and is maintained by JBKLabs, [JBKnowledge Inc's](https://jbknowledge.com/) research and development team.

## Licensing

This package is licensed under Apache License, Version 2.0. See [LICENSE](./LICENSE) for the full license text.
