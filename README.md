# Jolly Roger <!-- omit in toc -->

![Jolly Roger](jollyroger.png)

~2KB micro-framework on top of React hooks.

* [Online demo](https://poet.krasimir.now.sh/e/gnlV6me2xfQ) :rocket:
* [Jolly Roger visualized](https://poet.krasimir.now.sh/e/mq2PoRVJ4CG/frame/1300px/930px) :mag:
  
---

- [Installation](#installation)
- [Concepts](#concepts)
  - [Sharing state](#sharing-state)
  - [Using a reducer](#using-a-reducer)
  - [Using the context](#using-the-context)
- [API](#api)
  - [useState(slice, initial value)](#usestateslice-initial-value)
  - [useReducer(slice, actions)](#usereducerslice-actions)
  - [useContext()](#usecontext)
  - [context(functions)](#contextfunctions)

## Installation

`npm install jolly-roger` or `yarn add jolly-roger`

or

[https://unpkg.com/jolly-roger@latest/umd/jr.js](https://unpkg.com/jolly-roger@latest/umd/jr.js)

## Concepts

The [hooks API](https://reactjs.org/docs/hooks-reference.html) is a wonderful idea. There are some slick patterns involved which pushes the React development to a more functional approach. I was really interesting to try that new API and decided to use it for my [latest project](https://igit.dev). It looked like I can't build my app only with hooks. I needed something else. And that's mainly because each hook works on a local component level. I can't really transfer state or exchange reducers between the components. That's why I created this library. It has similar helpers but works on a global app level.

### Sharing state

Let's have a look at the following example:

```js
import react, { useEffect, useState } from 'react';

const App = function () {
  const [ time, setTime ] = useState(new Date());
  
  useEffect(() => {
    setInterval(() => setTime(new Date()), 1000);
  }, [])
  
  return (
    ...
  );
}
```

It's a component that has a local state called `time`. Once we mount it we trigger an interval callback and change the state every second. Now imagine that we want to use the value of `time` in another component. What if we want to render it by using a `Clock` and a `Watch` components like so:

```js
function Clock() {
  const [ time ] = useState(<?>);
  
  return <p>Clock: { time.toTimeString() }</p>;
}

function Watch() {
  const [ time ] = useState(<?>);
  
  return <p>Watch: { time.toTimeString() }</p>;
}
```

That's not really possible because the idea of the `useState` hook is to create a local component state. So `time` is available only for the `App` but not `Clock` and `Watch`. This is the first problem that this library solves. It gives you a mechanism to share state between components.

```js
function Clock() {
  const [ time ] = roger.useState('time');
  
  return <p>Clock: { time.toTimeString() }</p>;
}

function Watch() {
  const [ time ] = roger.useState('time');
  
  return <p>Watch: { time.toTimeString() }</p>;
}

const App = function () {
  const [ time, setTime ] = roger.useState('time', new Date());
  
  useEffect(() => {
    setInterval(() => setTime(new Date()), 1000);
  }, [])
  
  return (
    <Fragment>
      <Clock />
      <Watch />
    </Fragment>
  );
}
```

Here is a [online demo](https://poet.krasimir.now.sh/e/gnlV6me2xfQ#SharedState.js).

The API is almost the same except we have to give the state a name. In this case that is the first argument of the Roger's `useState` equal to `time`. We have to give it a name because we need an identifier to access it from within the other components.

### Using a reducer

Now when we have a global state we may define a reducer for it. You know that nice [idea](https://redux.js.org/basics/reducers) of having a function that accepts your current state and an action and returns the new version of the state in a immutable fashion. Let's build on top of the previous example and say that we will set the time manually. We are going to dispatch an action giving the new time value and the reducer has to update the state.

```js
roger.useReducer('time', {
  yohoho(currentTime, payload) {
    console.log('Last update at ' + currentTime);
    console.log('New ' + payload.now);
    return payload.now;
  }
});
```

Again the important bit here is the name `time` because that's how Roger knows which slice of the global state to manipulate. In here we are creating an action with a name `yohoho` that receives the current time and some payload. In this example we don't want to do anything else but simply set a new time so we just return what's in the `now` field. We will also create a new component that will trigger this action:

```js
function SetNewTime() {
  const { yohoho } = roger.useContext();
  
  return (
    <button onClick={ () => yohoho({ now: new Date() }) }>
      click me
    </button>
  );
}
```

The rest is the same. Here is a [online demo](https://poet.krasimir.now.sh/e/gnlV6me2xfQ#Reducer.js) to play with.

What's this `useContext` read in the next section.

### Using the context

Because Roger works as a global singleton it can store some stuff for you. By default the actions that we define in our `useReducer` calls are automatically stored there. As we saw in the previous section the `yohoho` method is used by getting it from the Roger's context. We can do that with the help of `useContext` method. Let's continue with our little time app and get the time from a external API via a `fetch` call. In this case we may create a function in the Roger's context that does the request for us and fires the `yohoho` action.

```js
roger.context({
  async getTime(url, { yohoho }) {
   	const result = await fetch(url);
    const data = await result.json();
    
    yohoho({ now: new Date(data.now)})
  }
});
```

Every context method accepts two arguments. The first one is reserved for anything that may need to be injected as a dependency and the second one is always the Roger's context itself. In our case `getTime` has one dependency and that's the endpoint URL. We need the `yohoho` action defined in our `useReducer` call. We get the data and dispatch the action.

Here is the same `<SetNewTime>` component using the new `getTime` helper:

```js
function SetNewTime() {
  const [ inProgress, setProgress ] = useState(false);
  const { getTime } = roger.useContext();
  
  const onClick = async () => {
    setProgress(true);
    await getTime('https://igit.dev/now');
    setProgress(false);
  }
  
  return (
    <button onClick={ onClick } disabled={ inProgress }>
      { inProgress ? 'getting the time' : 'click me' }
   	</button>
  );
}
```

Notice that Jolly Roger plays absolutely fine with the native React hooks. Like we did here we set a `inProgress` flag to indicate that there is a request in progress. Check out how it works [here](https://poet.krasimir.now.sh/e/gnlV6me2xfQ#useContext.js).

## API

### useState(slice, initial value)

|               | type          | description  |
| ------------- |:-------------:| -----|
| slice         | `<string>`    | A name of the slice in the application state |
| initial value | `<any>`       | Initial value which is set in the state |
| returns       | `<array>`     | Returns an array where the first item is the state value and the second a function to change it |

Example: 

```js
// inside your component
const [ counter, setCounter ] = roger.useState('counter', 10);

// later in the same component
setState(20);
...

return <p>{ counter }</p>; // after re-render you'll get: <p>20</p>
```

[Online demo](https://poet.krasimir.now.sh/e/gnlV6me2xfQ#SharedState.js)

### useReducer(slice, actions)

|               | type          | description  |
| ------------- |:-------------:| -----|
| slice         | `<string>`    | A name of the slice in the application state |
| actions       | `<object>`   | An object which keys are the name of the actions and values are the actual reducer functions. Every reducer receives the current state value and should return the new one. As second argument the reducer accepts the action's payload (if any)  |
| returns       | nothing       |

Example:

```js
// this is out of your React components
roger.useReducer('counter', {
  increment(number, payload) {
    return number + payload.amount;
  }
});

// in your React component
const [ counter ] = roger.useState('counter', 10);
const { increment } = roger.useContext();

// later in the same component
increment({ amount: 4 });
...

return <p>{ counter }</p>; // after re-render you'll get: <p>14</p>
```

[Online demo](https://poet.krasimir.now.sh/e/gnlV6me2xfQ#Reducer.js)

### useContext()

|               | type          | description  |
| ------------- |:-------------:| -----|
| returns       | <object>      | A Jolly Roger context where you'll find all the reducer actions + all the functions defined via the [`context`](#contextfunctions) method.

Example:

```js
// outside of your React components
roger.context({
  greeting(name) {
    return `Hello ${ name }`;
  }
});

// in your React component
const { greeting } = roger.useContext();

return <p>{ greeting('John') }</p>; // <p>Hello John</p>
```

[Online demo](https://poet.krasimir.now.sh/e/gnlV6me2xfQ#useContext.js)

### context(functions)

|               | type          | description  |
| ------------- |:-------------:| -----|
| functions     | `<object>`   | An object which keys are the function names and values are the actual function definitions. Every function receives a parameter as a first argument. As second argument it accepts the Roger's context. In that context object you'll find the other context functions and also the reducer actions defined while using `useReducer`. |
| returns       | nothing       |

```js
roger.useReducer('time', {
  setTime(currentTime, { newTime }) {
    return newTime;
  }
})
roger.context({
 	logTime(time) {
    console.log(time);
  },
  async getTime(url, { logTime, setTime }) {
   	const result = await fetch(url);
    const data = await result.json();
    
    logTime(data.now); // another context method
    setTime(data.now); // reducer action
  }
});
```

[Online demo](https://poet.krasimir.now.sh/e/gnlV6me2xfQ#context.js)