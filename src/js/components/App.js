import React from 'react';
import {
  BrowserRouter as Router,
  Link,
  Switch,
  Route,
  useParams,
} from 'react-router-dom';

import SolveAssignment from './SolveAssignment';

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
          <AssignmentParams />
        </Route>
        <Route path="/eq">
          <AssignmentParams />
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

function AssignmentParams() {
  const params = useParams();
  const level = Number(params.level ?? 1);
  const n = Number(params.n ?? 1);

  if (Number.isInteger(level) && Number.isInteger(n)) {
    return <SolveAssignment level={level} n={n} />;
  } else {
    return <NotFound />;
  }
}

function NotFound() {
  return <p>404 page not found</p>;
}
