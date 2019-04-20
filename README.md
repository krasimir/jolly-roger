# A micro-framework on top of React hooks. <!-- omit in toc -->

![Jolly Roger](jollyroger.png)

:rocket: [Online demo](https://poet.codes/e/gnlV6me2xfQ) :rocket:
  
- [Installation](#installation)
- [Concept](#concept)
  - [Sharing state](#sharing-state)

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

https://poet.codes/e/gnlV6me2xfQ#SharedState.js


