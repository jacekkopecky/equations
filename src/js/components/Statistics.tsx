import * as React from 'react';
import { Link } from 'react-router-dom';

import './Statistics.css';

import * as levels from '../levels/index';
import { useQuery } from '../tools/react';
import { dateToString, sumDuration } from '../shared-with-server/durations';

import LevelIndicator from './LevelIndicator';
import Spinner from './Spinner';

import { AppState } from '../AppState';
import { Assignment } from '../types';

export default function Statistics({ appState }: { appState: AppState }): JSX.Element {
  const query = useQuery();
  return (
    <main id="statistics">
      <h1>Statistics</h1>
      <p>Score: { appState.userState.score }</p>
      <LevelIndicator appState={appState} />
      <table className="assignments">
        <thead>
          <tr>
            <th aria-label="number" />
            <th>level</th>
            <th>success</th>
            <th>attempts</th>
            <th>time</th>
          </tr>
        </thead>
        <Assignments appState={appState} showAll={query.get('all') != null} />
      </table>
    </main>
  );
}

interface AssignmentsProps {
  appState: AppState,
  showAll: boolean,
}

function Assignments({ appState, showAll }: AssignmentsProps): JSX.Element {
  const { doneAssignments, loadingMore } = appState.useDoneAssignments();

  // get non-null assignments (the first one may be null)
  // then reverse so we show everything counterchronologically
  const assignments = doneAssignments.filter(a => a).reverse();

  // group assignments by their date
  const assignmentsPerDay = new Map<string, Assignment[]>();

  for (const assignment of assignments) {
    const date = dateToString(assignment);
    let thisDay = assignmentsPerDay.get(date);
    if (thisDay == null) {
      thisDay = [];
      assignmentsPerDay.set(date, thisDay);
    }
    thisDay.push(assignment);
  }

  // put each day worth of assignments in a separate tbody
  const tbodies = [];
  for (const [date, thisDay] of assignmentsPerDay.entries()) {
    const duration = sumDuration(thisDay);
    tbodies.push((
      <tbody key={date}>
        <tr>
          <th colSpan={5} className="date">
            <span className="date">{ date }</span>
            { duration ? <span className="duration"> ({ duration })</span> : null }
          </th>
        </tr>
        { thisDay.map(renderAssignment) }
      </tbody>
    ));
  }

  return (
    <>
      { tbodies }
      { loadingMore && <tbody><tr><td colSpan={5}><Spinner /></td></tr></tbody> }
    </>
  );

  function renderAssignment(a: Assignment) {
    const sampleAssignment = levels.make(a.level, a.n);
    const image = sampleAssignment.image;

    const classes = ['assignment'];
    if (a.answeredCorrectly) classes.push('correct');
    if (a.challenge) classes.push('challenge');

    const time = sumDuration(a) || '—';
    const pauses = (a.interactionPauses ?? []).filter((x) => x !== 0);

    return (
      <tr className={classes.join(' ')} key={a.n}>
        <td>
          { image && (
            <img className="icon" src={image} alt="level icon" draggable="false" />
          ) }
          <Link to={`/eq/${a.level}/${a.n}`} className="n">{ a.n }</Link>
        </td>
        <td>{ a.level }</td>
        <td className="answered-correctly">{ /* filled in by CSS */ }</td>
        <td>{ a.attemptCount }</td>
        <td>
          { time }
          { showAll && pauses.length > 0 && (
            <div className="pauses">
              pauses: { pauses.join(', ') }
            </div>
          ) }
        </td>
      </tr>
    );
  }
}
