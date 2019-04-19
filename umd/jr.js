(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.JR = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

module.exports = _arrayWithHoles;
},{}],2:[function(require,module,exports){
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    default: obj
  };
}

module.exports = _interopRequireDefault;
},{}],3:[function(require,module,exports){
function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

module.exports = _iterableToArrayLimit;
},{}],4:[function(require,module,exports){
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

module.exports = _nonIterableRest;
},{}],5:[function(require,module,exports){
var arrayWithHoles = require("./arrayWithHoles");

var iterableToArrayLimit = require("./iterableToArrayLimit");

var nonIterableRest = require("./nonIterableRest");

function _slicedToArray(arr, i) {
  return arrayWithHoles(arr) || iterableToArrayLimit(arr, i) || nonIterableRest();
}

module.exports = _slicedToArray;
},{"./arrayWithHoles":1,"./iterableToArrayLimit":3,"./nonIterableRest":4}],6:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _react = require("react");

/* eslint-disable no-use-before-define, max-len */
var DEV = true;

var createStore = function createStore() {
  return {
    state: {},
    updaters: {},
    context: {},
    reducers: {},
    onUpdate: function onUpdate(slice) {
      if (this.updaters[slice]) {
        for (var i = 0; i < this.updaters[slice].length; i++) {
          this.updaters[slice][i](this.state[slice]);
        }
      }
    }
  };
};

var store = createStore();

function createStateSetter(slice) {
  var setState = function setState(newState) {
    store.state[slice] = newState;
    store.onUpdate(slice);
  };

  return setState;
}

function useState(slice, initialState) {
  if (!slice) {
    throw new Error('useState requires a state slice name that you are going to operate on.');
  }

  if (typeof initialState !== 'undefined' && typeof store.state[slice] === 'undefined') {
    store.state[slice] = initialState;
  }

  var _useStateReact = (0, _react.useState)(store.state[slice]),
      _useStateReact2 = (0, _slicedToArray2["default"])(_useStateReact, 2),
      state = _useStateReact2[0],
      setLocalState = _useStateReact2[1];

  var setState = createStateSetter(slice);
  if (!store.updaters[slice]) store.updaters[slice] = [];

  if (!store.updaters[slice].find(function (u) {
    return u === setLocalState;
  })) {
    store.updaters[slice].push(setLocalState);
  }

  (0, _react.useEffect)(function () {
    return function () {
      store.updaters[slice] = store.updaters[slice].filter(function (u) {
        return u !== setLocalState;
      });
    };
  }, []);
  return [state, setState];
}

;

function useReducer(slice, actions) {
  createStateSetter(slice);
  Object.keys(actions).forEach(function (actionName) {
    store.reducers[actionName] = function (payload) {
      store.state[slice] = actions[actionName](store.state[slice], payload, store.context);
      store.onUpdate(slice);
    };

    if (!store.context[actionName]) {
      store.context[actionName] = function () {
        var _store$reducers;

        return (_store$reducers = store.reducers)[actionName].apply(_store$reducers, arguments);
      };
    }
  });
}

function context(effects) {
  Object.keys(effects).forEach(function (effectName) {
    store.context[effectName] = function (action) {
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
  return (selector || function (state) {
    return state;
  })(store.state);
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

var roger = {
  useState: useState,
  useReducer: useReducer,
  context: context,
  useContext: useContext,
  select: select,
  flush: flush,
  inspect: inspect
};
module.exports = roger;

},{"@babel/runtime/helpers/interopRequireDefault":2,"@babel/runtime/helpers/slicedToArray":5,"react":"react"}]},{},[6])(6)
});
