import React, { useState } from 'react';
import {
  Link,
  useParams,
} from 'react-router-dom';

import './solve-equation.css';

import * as Equations from './tools/equations';
import Random from './tools/random';
import levels from './levels/index';

export default function SolveEquation() {
  const { level = 1, n = 1 } = useParams();

  const rng = new Random(`${level}/${n}`);

  const [answers, setAnswers] = useState(new Map());
  const [correctness, setCorrectness] = useState(null);

  const equations = levels[level](rng);
  const varNames = Array.from(Equations.extractVariables(equations));

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
    setCorrectness(Equations.checkAnswers(equations, answers));
  }

  function answerInput(varName) {
    return (
      <p className="answer" key={varName}>
        { varName } = <input type="number" onInput={(e) => setAnswer(varName, e.target.valueAsNumber)} />
      </p>
    );
  }

  return (
    <main id="solve-equation">
      { equations.text && Equations.formatEquationsText(equations.text) }
      { equations.onlyText
        || (
          <>
            <div>{ Equations.formatEquation(equations[0], 1) }</div>
            <div>{ Equations.formatEquation(equations[1], 2) }</div>
          </>
        ) }

      <textarea className="equation" onInput={resizeTextArea} autoFocus />
      {
        // todo make the text area remember contents in localStorage
      }

      { varNames.map(answerInput) }

      <button
        className="check-answers"
        type="button"
        onClick={checkAnswers}
        disabled={!Equations.areAllVariablesAnswered(equations, answers)}
      >
        Check answers
      </button>

      { correctness != null && (
        <p className="correctness">
          { correctness ? 'Correct' : 'Sorry, not right' }
        </p>
      ) }

      <p><Link to={`/eq/${level}/${Number(n) + 1}`}>next</Link></p>
    </main>
  );
}

const textareaExtraSize = 10;
function resizeTextArea(e) {
  const el = e.target;
  if (el.scrollHeight > el.clientHeight) {
    el.style.height = `${el.scrollHeight + textareaExtraSize}px`;
  }
}
