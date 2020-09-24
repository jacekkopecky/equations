import React from 'react';
import { Link } from 'react-router-dom';

import './Statistics.css';

import levels from '../levels/index';
import Random from '../tools/random';
import LevelIndicator from './LevelIndicator';

const rng = new Random();
export default function Statistics({ appState }) {
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
        <Assignments appState={appState} />
      </table>
    </main>
  );
}

function Assignments({ appState }) {
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
}

function renderAssignment(a) {
  const sampleAssignment = levels[a.level](rng);
  const image = sampleAssignment.image;

  const classes = ['assignment'];
  if (a.answeredCorrectly) classes.push('correct');
  if (a.challenge) classes.push('challenge');

  const time = timeDurationString(getDuration(a)) || '—';

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
      <td>{ time }</td>
    </tr>
  );
}

const dateOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

export function dateToString(a) {
  const time = typeof a === 'number' ? a : a.startTime || a.created; // an old version in use by Maya used .created
  return new Date(time).toLocaleDateString(undefined, dateOptions);
}

function getDuration(a) {
  if (a == null) return null;
  const duration = Math.round((a.doneTime - (a.startTime ?? a.created)) / 1000);
  return duration;
}

function timeDurationString(duration) {
  if (duration == null || Number.isNaN(duration)) return null;

  const minutes = duration > 59 ? `${Math.floor(duration / 60)}min ` : '';
  const time = `${minutes}${duration % 60}s`;
  return time;
}

export function countDurationOnSameDay(array, index = array.length - 1) {
  // count time of all those with the same date as array[index]
  const date = dateToString(array[index]);

  // put all with the same date in assignmentsOnDay
  const assignmentsOnDay = [array[index]];
  for (let i = index - 1; i >= 0; i -= 1) {
    if (dateToString(array[i]) === date) {
      assignmentsOnDay.push(array[i]);
    } else {
      break;
    }
  }

  return sumDuration(assignmentsOnDay);
}

function sumDuration(assignments) {
  let sumTime = 0;
  for (const a of assignments) {
    sumTime += getDuration(a) || 0;
  }
  return timeDurationString(sumTime);
}
