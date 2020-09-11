import React from 'react';
import {
  BrowserRouter as Router,
  Link,
  Switch,
  Route,
} from 'react-router-dom';

import SolveEquation from './solve-equation';

export default function App() {
  return (
    <Router>
      <header>
        <h1><Link to="/">Equations</Link></h1>
        <Link to="/about">(About)</Link>
      </header>

      <Switch>
        <Route exact path="/">
          <Link to="/eq">Get started</Link>
        </Route>
        <Route path="/eq/:level/:n">
          <SolveEquation />
        </Route>
        <Route path="/eq">
          <SolveEquation />
        </Route>
        <Route path="/about">
          <p>This is a simple app for practicing equations.</p>
        </Route>
        <Route>
          <p>404 page not found</p>
        </Route>
      </Switch>
    </Router>
  );
}
