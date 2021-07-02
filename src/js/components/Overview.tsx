import * as React from 'react';
import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

import './Overview.css';

import * as levels from '../levels/index';
import { AppState } from '../AppState';
import { AssignmentInformation } from '../types';

import LevelIndicator from './LevelIndicator';
import Duration from './Duration';

interface ShowingAssignment extends AssignmentInformation {
  disabled?: boolean,
}

export default function Overview({ appState }: { appState: AppState }): JSX.Element {
  const batch = appState.getCurrentAssignmentBatch();
  disableAfterFirstUnsolved(batch);

  return (
    <main id="overview">
      <p>Score: { appState.userState.score }</p>
      <LevelIndicator appState={appState} />
      <Duration appState={appState} />
      <div className="assignments">
        { batch.map(renderAssignment) }
      </div>
    </main>
  );

  function renderAssignment(a: ShowingAssignment) {
    return (
      <AssignmentBox
        key={a.n}
        level={a.level}
        n={a.n}
        isChallenge={a.challenge}
        disabled={a.disabled ?? false}
        done={a.done}
        answeredCorrectly={a.answeredCorrectly}
        appState={appState}
      />
    );
  }
}

function disableAfterFirstUnsolved(assignments: ShowingAssignment[]) {
  let foundUnsolved = false;
  for (const a of assignments) {
    if (foundUnsolved) a.disabled = true;
    if (!a.done) foundUnsolved = true;
  }
}

interface AssignmentBoxProps {
  level: number,
  n: number,
  isChallenge: boolean,
  disabled: boolean,
  done: boolean,
  answeredCorrectly: boolean,
  appState: AppState,
}

function AssignmentBox(props: AssignmentBoxProps) {
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
  const sampleAssignment = levels.make(level, n);
  const image = sampleAssignment.image;

  const [makeChallenge, setMakeChallenge] = useState(false);

  const canMakeChallenge = !isChallenge && !done && level < levels.topLevel;

  const realLevel = makeChallenge ? appState.userState.level + 1 : level;

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
      <span className="level">level { realLevel }</span>
    </>
  );

  const makeChallengeRef = useRef<HTMLDivElement>(null);

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
            title="make this level a challenge"
          >
            <span role="img" aria-label="make a challenge">⭐️</span>
          </div>
        ) }
      </Link>
    );
  }

  function toggleChallenge(e: React.MouseEvent | React.KeyboardEvent) {
    setMakeChallenge(!makeChallenge);
    e.stopPropagation();
    e.preventDefault();
    makeChallengeRef.current?.blur();
  }
}
