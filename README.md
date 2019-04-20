# A micro-framework on top of React hooks. <!-- omit in toc -->

![Jolly Roger](jollyroger.png)

:rocket: [Online demo](https://poet.codes/e/gnlV6me2xfQ) :rocket:
  
- [Installation](#installation)
- [Concept](#concept)
  - [Sharing state](#sharing-state)
  - [Using a reducer](#using-a-reducer)
  - [Using the context](#using-the-context)

## Installation

`npm install jolly-roger` or `yarn add jolly-roger`

or

[https://unpkg.com/jolly-roger@latest/umd/jr.js](https://unpkg.com/jolly-roger@latest/umd/jr.js)

## Concept

The [hooks API](https://reactjs.org/docs/hooks-reference.html) is a wonderful idea. There are some slick patterns involved which pushes the React development to a more functional approach. I was really interesting to try that new API and decided to use it for my [latest project](https://igit.dev). It looked like I can't build my app only with hooks. I needed something else. And that's mainly because each hook works on a local component level. I can't really transfer state or exchange reducers between the components. That's why I created this library. It has similar helpers but works on a global app level.

### Sharing state

Let's have a look at the following example:

```js
import react, { useEffect, useState, Fragment } from 'react';
import roger from 'jolly-roger';

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

Here is a [online demo](https://poet.codes/e/gnlV6me2xfQ#SharedState.js).

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

The rest is the same. Here is a [online demo](https://poet.codes/e/gnlV6me2xfQ#Reducer.js) to play with.

What's this `useContext` read in the next section.

### Using the context

Because Roger works in the global space it can store some stuff for you. By default the actions that we define in our `useReducer` calls are automatically stored there. As we saw in the previous section the `yohoho` method is used by getting it from the Roger's context. We can do that with the help of `useContext` method.


