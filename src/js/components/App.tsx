import * as React from 'react';
import {
  BrowserRouter as Router,
  Link,
  Switch,
  Route,
  useParams,
} from 'react-router-dom';

import Overview from './Overview';
import SolveAssignment, { SolveAssignmentProps } from './SolveAssignment';
import Statistics from './Statistics';
import About from './About';

import './App.css';

import useAppState from '../AppState';

export default function App(): JSX.Element {
  const appState = useAppState();

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
          <SolveAssignmentWithParams appState={appState} back="/" />
        </Route>
        <Route path="/eq" exact>
          <SolveAssignment level={1} n={1} appState={appState} back="/" />
        </Route>
        <Route path="/stats" exact>
          <Statistics appState={appState} />
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

function SolveAssignmentWithParams(props: Pick<SolveAssignmentProps, 'appState'|'back'>): JSX.Element {
  const params = useParams<Record<'n'|'level', string>>();

  return (
    <SolveAssignment
      level={Number(params.level)}
      n={Number(params.n)}
      appState={props.appState}
      back={props.back}
    />
  );
}

function NotFound() {
  return <main>404 page not found</main>;
}
