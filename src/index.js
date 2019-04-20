/* eslint-disable no-use-before-define, max-len */
import { useState as useStateReact, useEffect as userEffectReact } from 'react';

const DEV = true;
const SAME_CONTEXT_METHOD_ERROR = name =>
  `JollyRoger: There is already a context method with name "${ name }". Check out the usage of "context" and "useReducer" in your application.`

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
  const setState = (newState) => {
    store.state[slice] = newState;
    store.onUpdate(slice);
  };

  return setState;
}

function useState(slice, initialState) {
  if (!slice) {
    throw new Error('JollyRoger: useState requires a state slice name that you are going to operate on.');
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
  Object.keys(actions).forEach(actionName => {
    if (store.reducers[actionName] || store.context[actionName]) {
      throw new Error(SAME_CONTEXT_METHOD_ERROR(actionName));
    }
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
    if (store.reducers[effectName]) {
      throw new Error(SAME_CONTEXT_METHOD_ERROR(effectName));
    }
    store.context[effectName] = (action) => {
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

const roger = {
  useState,
  useReducer,
  context,
  useContext,
  select,
  flush,
  inspect
}

export default roger;
