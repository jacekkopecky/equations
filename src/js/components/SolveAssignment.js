import React, { useState, useLayoutEffect } from 'react';
import { Link, Redirect } from 'react-router-dom';

import './SolveAssignment.css';

import * as Equations from '../tools/equations';
import { useAutofocusRef, useLocalStorage } from '../tools/react';

export default function SolveAssignment(props) {
  const level = Number(props.level);
  const n = Number(props.n);

  const [answers, setAnswers] = useState(new Map());
  const [correctness, setCorrectness] = useState(null);

  const appState = props.appState;
  const assignment = appState.getAssignment(level, n);

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

  const [askedToCheckAnswers, setAskedToCheckAnswers] = useState(false);

  if (assignment.level !== level) {
    return <Redirect to={`/eq/${assignment.level}/${n}`} />;
    // todo this will not bring up storedAttemptText for some reason
    // but it shouldn't be a problem because you should actually never go to the wrong level
  }

  if (assignment.attemptText) {
    deleteStoredAttemptText();
  }

  const finished = assignment.done != null;
  const attemptText = assignment.attemptText ?? storedAttemptText;

  return (
    <main id="solve-equation">
      { assignment.image && (
        <img src={assignment.image} className="assignment-icon" alt="assignment icon" />
      ) }

      { assignment.text && Equations.formatEquationsText(assignment.text) }
      { assignment.onlyText || (
        assignment.equations.map(renderEquation)
      ) }

      {
        finished ? <pre className="equation">{ attemptText }</pre> : (
          <textarea
            className="equation"
            onChange={saveAttemptText}
            autoFocus
            ref={textAreaRef}
            value={attemptText}
            disabled={finished}
          />
        )
      }

      <div className="answers">
        <div>
          { varNames.map(renderAnswerInput) }
        </div>

        { (!finished || askedToCheckAnswers) && correctness != null && (
          <div className="correctness">
            { correctness ? 'Correct' : 'Sorry, not right' }
          </div>
        ) }
      </div>

      <button
        type="button"
        onClick={checkAnswers}
        disabled={finished || !Equations.areAllVariablesAnswered(assignment.equations, answers)}
      >
        Check answers
      </button>
      <button type="button" disabled>Show me the answers</button>
      { props.back && (
        <Link to={props.back}><button type="button">Back</button></Link>
      ) }

    </main>
  );

  function setAnswer(variable, value) {
    const copy = new Map(answers);
    if (Number.isNaN(value)) {
      delete copy.delete(variable);
    } else {
      copy.set(variable, value);
    }
    setAnswers(copy);
    setCorrectness(null);
  }

  function checkAnswers() {
    const correct = Equations.checkAnswers(assignment.equations, answers);
    setCorrectness(correct);
    if (correct) {
      assignment.attemptText = attemptText;
      assignment.answeredCorrectly = true;
      assignment.done = true;
      assignment.save();
      setStoredAttemptText(null);
      setAskedToCheckAnswers(true);
    } else {
      assignment.attemptCount = (assignment.attemptCount ?? 0) + 1;
      assignment.save();
    }
  }

  function saveAttemptText(e) {
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
}

const textareaExtraSize = 10;
function resizeTextArea(el) {
  if (el.scrollHeight > el.clientHeight) {
    el.style.height = `${el.scrollHeight + textareaExtraSize}px`;
  }
}
