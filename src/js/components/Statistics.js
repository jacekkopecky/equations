import React from 'react';
import { Link } from 'react-router-dom';

import './Statistics.css';

import levels from '../levels/index';
import { useQuery } from '../tools/react';
import Random from '../tools/random';
import { dateToString, sumDuration } from '../tools/durations';
import LevelIndicator from './LevelIndicator';

const rng = new Random();
export default function Statistics({ appState }) {
  const query = useQuery();
  return (
    <main id="statistics">
      <h1>Statistics</h1>
      <p>Score: { appState.score }</p>
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
        <Assignments appState={appState} allInformation={query.get('all') != null} />
      </table>
    </main>
  );
}

function Assignments({ appState, allInformation }) {
  // reverse() is safe because doneAssignments gives a new array
  const assignments = appState.doneAssignments.reverse();

  // group assignments by their date
  const assignmentsPerDay = new Map();

  for (const assignment of assignments) {
    const date = dateToString(assignment);
    if (!assignmentsPerDay.has(date)) {
      assignmentsPerDay.set(date, []);
    }
    const thisDay = assignmentsPerDay.get(date);
    thisDay.push(assignment);
  }

  // put each day worth of assignments in a separate tbody
  const tbodies = [];
  for (const date of assignmentsPerDay.keys()) {
    const thisDay = assignmentsPerDay.get(date);
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

  return tbodies;

  function renderAssignment(a) {
    const sampleAssignment = levels[a.level](rng);
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
          { allInformation && pauses.length > 0 && (
            <div className="pauses">
              pauses: { pauses.join(', ') }
            </div>
          ) }
        </td>
      </tr>
    );
  }
}
