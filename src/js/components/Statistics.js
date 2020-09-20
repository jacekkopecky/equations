import React from 'react';
import { Link } from 'react-router-dom';

import './Statistics.css';

import levels from '../levels/index';
import Random from '../tools/random';

const rng = new Random();
export default function Statistics({ appState }) {
  const batch = appState.doneAssignments;
  const userLevel = appState.level;

  return (
    <main id="statistics">
      <h1>Statistics</h1>
      <p>Score: { appState.score }</p>
      <p>
        Level:
        { ' ' }
        { userLevel }
        { userLevel < appState.topLevel
          ? ` (progress to next level ${appState.progressIndicator})`
          : ' (top level)' }
      </p>
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
        <tbody>
          { batch.flatMap(renderAssignment).reverse() }
        </tbody>
      </table>
    </main>
  );

  function renderAssignment(a, index, array) {
    const sampleAssignment = levels[a.level](rng);
    const image = sampleAssignment.image;

    const date = renderAssignmentDate(a, index, array);

    const classes = ['assignment'];
    if (a.answeredCorrectly) classes.push('correct');
    if (a.challenge) classes.push('challenge');

    const time = timeDurationString(getDuration(a)) || '—';

    return (
      [
        <tr className={classes.join(' ')} key={index}>
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
        </tr>,
        date,
      ]
    );
  }
}

function renderAssignmentDate(a, index, array) {
  if (a.startTime == null) return null;
  const dateOfA = dateToString(a);

  // return nothing (don't show date) if the next one has the same date
  const dateOfNext = index < array.length - 1 ? dateToString(array[index + 1]) : '';
  if (dateOfNext === dateOfA) return null;

  const duration = countDurationOnSameDay(array, index);

  return (
    <tr key={dateOfA}>
      <th colSpan={5} className="date">
        { dateOfA }
        { duration ? <span className="duration"> ({ duration })</span> : null }
      </th>
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
  // count time of all those with the same date
  const date = dateToString(array[index]);

  let sumTime = getDuration(array[index]);
  for (let i = index - 1; i >= 0; i -= 1) {
    if (dateToString(array[i]) !== date) break;
    sumTime += getDuration(array[i]) || 0;
  }

  return timeDurationString(sumTime);
}
