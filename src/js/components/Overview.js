import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

import './Overview.css';

import levels from '../levels/index';
import Random from '../tools/random';

const rng = new Random();
export default function Overview({ appState }) {
  const batch = appState.getUpcomingAssignments();
  const newcomer = batch[0].n === 1 && !batch[0].done;
  const userLevel = appState.level;
  disableAfterFirstUnsolved(batch);

  return (
    <main id="overview">
      <h1>Hello { newcomer ? 'newcomer' : 'back' }</h1>
      <p>Score: { appState.score }</p>
      <p>
        Level:
        { ' ' }
        { userLevel }
        { userLevel < appState.topLevel
          ? ` (progress to next level ${appState.progressIndicator})`
          : ' (top level)' }
      </p>
      <div className="assignments">
        { batch.map(renderAssignment) }
      </div>
    </main>
  );

  function renderAssignment(a) {
    return (
      <Assignment
        key={a.n}
        level={a.level}
        n={a.n}
        isChallenge={a.challenge}
        disabled={a.disabled}
        done={a.done}
        answeredCorrectly={a.answeredCorrectly}
        appState={appState}
      />
    );
  }
}

function disableAfterFirstUnsolved(assignments) {
  let foundUnsolved = false;
  for (const a of assignments) {
    if (foundUnsolved) a.disabled = true;
    if (!a.done) foundUnsolved = true;
  }
}

function Assignment(props) {
  const {
    level,
    n,
    isChallenge,
    disabled,
    done,
    answeredCorrectly,
    appState,
  } = props;

  // create a sample assignment at given level
  // todo use `n` for rng; this should be in levels/index.js anyway
  const sampleAssignment = levels[level](rng);
  const image = sampleAssignment.image;

  const [makeChallenge, setMakeChallenge] = useState(false);

  const canMakeChallenge = !isChallenge && !done && level < appState.topLevel;

  const realLevel = makeChallenge ? level + 1 : level;

  const classes = ['assignment'];
  if (isChallenge || makeChallenge) classes.push('challenge');
  if (makeChallenge) classes.push('made-challenge');
  if (disabled) classes.push('disabled');
  if (done) {
    classes.push('done');
    classes.push(answeredCorrectly ? 'correctly' : 'asked');
  }

  const content = (
    <>
      { image && (
        <img className="icon" src={image} alt="level icon" draggable="false" />
      ) }
      <span className="n">{ n }</span>
    </>
  );

  const makeChallengeRef = useRef();

  if (disabled) {
    return (
      <div className={classes.join(' ')}>
        { content }
      </div>
    );
  } else {
    return (
      <Link to={`/eq/${realLevel}/${n}`} className={classes.join(' ')} draggable="false">
        { content }
        { canMakeChallenge && (
          <div
            className="make-challenge"
            role="button"
            tabIndex={0}
            onClick={toggleChallenge}
            onKeyPress={toggleChallenge}
            ref={makeChallengeRef}
          >
            <span role="img" aria-label="make a challenge">⭐️</span>
          </div>
        ) }
      </Link>
    );
  }

  function toggleChallenge(e) {
    setMakeChallenge(!makeChallenge);
    e.stopPropagation();
    e.preventDefault();
    makeChallengeRef.current.blur();
  }
}
