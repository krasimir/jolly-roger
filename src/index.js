/* eslint-disable no-use-before-define, max-len */
import { useState as useStateReact, useEffect as userEffectReact } from 'react';

const DEV = true;

const createStore = () => ({
  state: {},
  updaters: {},
  context: {},
  reducers: {},
  onUpdate(slice) {
    if (this.updaters[slice]) {
      for (let i = 0; i < this.updaters[slice].length; i++) {
        this.updaters[slice][i](this.state[slice]);
      }
    }
  }
});
var store = createStore();

function createStateSetter(slice) {
  const setStateMethodName = `set${ slice.charAt(0).toUpperCase() + slice.substr(1) }`;
  const setState = (newState) => {
    store.state[slice] = newState;
    store.onUpdate(slice);
  };

  if (!store.context[setStateMethodName]) {
    store.context[setStateMethodName] = setState;
  }
  return setState;
}

function useState(slice, initialState) {
  if (!slice) {
    throw new Error('useState requires a state slice name that you are going to operate on.');
  }
  if (typeof initialState !== 'undefined' && typeof store.state[slice] === 'undefined') {
    store.state[slice] = initialState;
  }
  const [ state, setLocalState ] = useStateReact(store.state[slice]);
  const setState = createStateSetter(slice);

  if (!store.updaters[slice]) store.updaters[slice] = [];
  if (!store.updaters[slice].find(u => u === setLocalState)) {
    store.updaters[slice].push(setLocalState);
  }

  userEffectReact(() => {
    return () => {
      store.updaters[slice] = store.updaters[slice].filter(u => u !== setLocalState);
    };
  }, []);
  return [ state, setState ];
};

function useReducer(slice, actions) {
  createStateSetter(slice);
  Object.keys(actions).forEach(actionName => {
    store.reducers[actionName] = (payload) => {
      store.state[slice] = actions[actionName](store.state[slice], payload, store.context);
      store.onUpdate(slice);
    };
    if (!store.context[actionName]) {
      store.context[actionName] = (...args) => store.reducers[actionName](...args);
    }
  });
}

function context(effects) {
  Object.keys(effects).forEach(effectName => {
    store.context[effectName] = (action) => {
      if (store.reducers[effectName]) {
        store.reducers[effectName](action);
      }
      return effects[effectName](action, store.context);
    };
  });
}

function useContext() {
  return store.context;
}

function select(selector) {
  return (selector || (state => state))(store.state);
}

function flush() {
  store = createStore();
}

function inspect() {
  return store;
}

if (DEV) {
  window.__store = store;
}

export default {
  useState,
  useReducer,
  context,
  useContext,
  select,
  flush,
  inspect
};
