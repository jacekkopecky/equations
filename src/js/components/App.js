import React from 'react';
import {
  BrowserRouter as Router,
  Link,
  Switch,
  Route,
} from 'react-router-dom';

import SolveAssignment from './SolveAssignment';
import Overview from './Overview';
import { PropsFromRouteParams } from '../tools/react';

import './App.css';

import AppState from '../AppState';

export default function App() {
  const appState = new AppState();

  return (
    <Router>
      <header id="app-header">
        <h1><Link to="/">Equations</Link></h1>
        <Link to="/about">(About)</Link>
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
        <Route path="/about">
          <p>This is a simple app for practicing equations.</p>
        </Route>
        <Route path="*">
          <NotFound />
        </Route>
      </Switch>
    </Router>
  );
}

function NotFound() {
  return <p>404 page not found</p>;
}
