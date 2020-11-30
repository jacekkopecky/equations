import React from 'react';
import {
  BrowserRouter as Router,
  Link,
  Switch,
  Route,
} from 'react-router-dom';

import Overview from './Overview';
import SolveAssignment from './SolveAssignment';
import Statistics from './Statistics';
import About from './About';

import { PropsFromRouteParams } from '../tools/react';

import './App.css';

import AppState from '../AppState';

export default function App() {
  const appState = new AppState();

  return (
    <Router>
      <header id="app-header">
        <h1><Link to="/">bananas for maths (…and apples)</Link></h1>
        { /* when changing the title above, also change it in index.html and 404.html */ }
        <div>
          <Link to="/stats">Stats</Link> | <Link to="/about">About</Link>
        </div>
      </header>

      <Switch>
        <Route exact path="/">
          <Overview appState={appState} />
        </Route>
        <Route exact path="/eq/:level(\d+)/:n(\d+)">
          <PropsFromRouteParams>
            <SolveAssignment appState={appState} back="/" />
          </PropsFromRouteParams>
        </Route>
        <Route path="/eq" exact>
          <SolveAssignment level={1} n={1} appState={appState} back="/" />
        </Route>
        <Route path="/stats" exact>
          <Statistics appState={appState} back="/" />
        </Route>
        <Route path="/about">
          <About />
        </Route>
        <Route path="*">
          <NotFound />
        </Route>
      </Switch>
    </Router>
  );
}

function NotFound() {
  return <main>404 page not found</main>;
}
