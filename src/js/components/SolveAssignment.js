import React, { useState, useLayoutEffect } from 'react';
import { Link, Redirect, useHistory } from 'react-router-dom';

import './SolveAssignment.css';

import * as Equations from '../tools/equations';
import { useAutofocusRef, useLocalStorage } from '../tools/react';

import LevelIndicator from './LevelIndicator';
import Duration from './Duration';

export default function SolveAssignment(props) {
  const level = Number(props.level);
  const n = Number(props.n);

  const [answers, setAnswers] = useState(new Map());
  const [startTime, setStartTime] = useState(Date.now());

  const [noteInteractionPause, resetInteractionPauses] = useInteractionPauses();

  const history = useHistory();

  const appState = props.appState;
  const assignment = appState.getAssignment(level, n, startTime);
  const nextAssignment = appState.getNextAssignment(n);

  const varNames = Array.from(Equations.extractVariables(assignment.equations));

  // autofocus when moving to a new assignment
  const textAreaRef = useAutofocusRef([level, n]);

  // resize text area after render to fit content
  useLayoutEffect(() => {
    if (textAreaRef.current) {
      resizeTextArea(textAreaRef.current);
    }
  });

  const [
    storedAttemptText,
    setStoredAttemptText,
    deleteStoredAttemptText,
  ] = useLocalStorage(`currentEquation/${level}/${n}`, '');

  const [justCheckedOrShowing, setAskedToCheckOrShowAnswers] = useState(false);
  const [transitioningTimeout, setTransitioning] = useState(null);

  const transitioning = transitioningTimeout != null;

  if (assignment.level !== level) {
    return <Redirect to={`/eq/${assignment.level}/${n}`} />;
    // todo this will not bring up storedAttemptText for some reason
    // but it shouldn't be a problem because you should actually never go to the wrong level
  }

  const finished = Boolean(assignment.done);
  const justFinished = finished && justCheckedOrShowing;
  const justWon = justFinished && assignment.answeredCorrectly;
  const canCheckAnswers = (
    !transitioning && !finished
    && Equations.areAllVariablesAnswered(assignment.equations, answers)
  );

  const classes = [];
  if (assignment.challenge) classes.push('challenge');
  if (justWon) classes.push('won');
  if (transitioning) classes.push('transitioning');

  return (
    <>
      <main id="solve-assignment" className={classes.join(' ')}>
        <div className="info">
          { assignment.image && (
            <img
              src={assignment.image}
              className="assignment-icon"
              alt="assignment icon"
              title={assignment.challenge ? 'challenge assignment' : ''}
            />
          ) }
          <span className="n">{ n }</span>
        </div>

        <span className="difficulty">Difficulty level { level }{ assignment.challenge && ' (challenge)' }, assignment { n }:</span>

        { assignment.text && Equations.formatEquationsText(assignment.text) }
        { !assignment.onlyText && (
          assignment.equations.map(renderEquation)
        ) }

        {
          finished ? <pre className="equation">{ assignment.attemptText }</pre> : (
            <textarea
              className="equation"
              onChange={saveAttemptText}
              autoFocus
              ref={textAreaRef}
              value={storedAttemptText}
              disabled={finished}
            />
          )
        }

        <div className="answers">
          <div>
            { varNames.map(renderAnswerInput) }
          </div>

          { (finished && assignment.answeredCorrectly) && (
            <div className="correctness">
              { justFinished ? 'Correct' : 'Solved correctly' }
            </div>
          ) }
          { (finished && !assignment.answeredCorrectly) && (
            <div className="correctness">
              { justFinished ? 'Next one may be easier' : 'Not solved, asked to show answers' }
            </div>
          ) }
          { (!finished && justCheckedOrShowing) && (
            <div className="correctness">
              Sorry, not right, keep trying
            </div>
          ) }
        </div>

        <div className="buttons">
          <button
            type="button"
            onClick={checkAnswers}
            disabled={!canCheckAnswers}
          >
            Check answers
          </button>

          { props.back && (
            <Link to={props.back} onClick={clearState}>
              <button tabIndex={-1} type="button">Back to overview</button>
            </Link>
          ) }

          { nextAssignment && (
            <button
              type="button"
              onClick={goToNext}
              disabled={transitioning}
            >
              Next assignment
            </button>
          ) }

          <button
            id="show-answers"
            type="button"
            onClick={showAnswers}
            disabled={transitioning || finished}
          >
            Show me the answers
          </button>
        </div>
      </main>
      <footer>
        <p>Score: { appState.score }</p>
        <LevelIndicator
          appState={appState}
          justWonAStar={justWon && assignment.challenge}
        />
        <Duration appState={appState} onlyToday />
      </footer>
    </>
  );

  function goToNext() {
    if (!transitioning) {
      setTransitioning(setTimeout(doGoToNext, 150));
    }
  }

  function doGoToNext() {
    clearState();
    resetInteractionPauses();
    setStartTime(Date.now());
    history.push(`/eq/${nextAssignment.level}/${nextAssignment.n}`);
  }

  function setAnswer(variable, value) {
    noteInteractionPause();
    const copy = new Map(answers);
    if (Number.isNaN(value)) {
      delete copy.delete(variable);
    } else {
      copy.set(variable, value);
    }
    clearState();
    setAnswers(copy);
  }

  function checkAnswers() {
    const pauses = noteInteractionPause();
    const correct = Equations.checkAnswers(assignment.equations, answers);
    assignment.attemptCount = (assignment.attemptCount ?? 0) + 1;
    if (correct) {
      assignment.attemptText = storedAttemptText.trim();
      assignment.answeredCorrectly = true;
      assignment.done = true;
      assignment.doneTime = Date.now();
      assignment.interactionPauses = pauses;
      deleteStoredAttemptText();
      clearState();
    } else {
      assignment.attemptAnswers = assignment.attemptAnswers ?? [];
      assignment.attemptAnswers.push(mapToObject(answers));
      assignment.interactionPauses = pauses;
    }
    setAskedToCheckOrShowAnswers(true);
    assignment.save();
  }

  function showAnswers() {
    const pauses = noteInteractionPause();
    assignment.attemptText = storedAttemptText.trim();
    assignment.answeredCorrectly = false;
    assignment.done = true;
    assignment.doneTime = Date.now();
    assignment.interactionPauses = pauses;
    assignment.save();
    deleteStoredAttemptText();
    clearState();
    setAskedToCheckOrShowAnswers(true);
  }

  function saveAttemptText(e) {
    noteInteractionPause();
    resizeTextArea(e.target);
    setStoredAttemptText(e.target.value);
  }

  function renderAnswerInput(varName) {
    return (
      <div className="answer" key={varName}>
        { varName }
        { ' = ' }
        { finished ? assignment.solution[varName] : (
          <input type="number" onChange={(e) => setAnswer(varName, e.target.valueAsNumber)} />
        ) }
      </div>
    );
  }

  function renderEquation(eq, index) {
    return (
      <div key={index}>{ Equations.formatEquation(eq, index + 1) }</div>
    );
  }

  function clearState() {
    setAskedToCheckOrShowAnswers(false);
    setAnswers(new Map());
    if (transitioning) clearTimeout(transitioningTimeout);
    setTransitioning(null);
  }
}

function reverseComparator(a, b) {
  return b - a;
}

const textareaExtraSize = 10;
function resizeTextArea(el) {
  if (el.scrollHeight > el.clientHeight) {
    el.style.height = `${el.scrollHeight + textareaExtraSize}px`;
  }
}

function mapToObject(map) {
  const retval = {};
  for (const [key, value] of map.entries()) {
    retval[key] = value;
  }
  return retval;
}

function useInteractionPauses() {
  const PAUSE_COUNT = 10;

  const [pauses, setPauses] = useState(new Array(PAUSE_COUNT).fill(0));
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());

  function noteInteractionPause() {
    const now = Date.now();
    setLastInteractionTime(now);
    const currentPause = Math.floor((now - lastInteractionTime) / 1000);
    if (currentPause > pauses[PAUSE_COUNT - 1]) {
      const newPauses = Array.from(pauses);
      newPauses[PAUSE_COUNT - 1] = currentPause;
      newPauses.sort(reverseComparator);
      setPauses(newPauses);
      console.log(newPauses);
      return newPauses;
    } else {
      return pauses;
    }
  }

  function resetInteractionPauses() {
    setLastInteractionTime(Date.now());
    setPauses(new Array(PAUSE_COUNT).fill(0));
  }

  return [noteInteractionPause, resetInteractionPauses];
}
