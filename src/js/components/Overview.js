import React from 'react';
import { Link } from 'react-router-dom';

import './Overview.css';

import levels from '../levels/index';
import Random from '../tools/random';

const rng = new Random();

export default function App() {
  return (
    <main id="overview">
      <h1>Hello newcomer!</h1>
      <p>Solved levels: 0</p>
      <p>Level: 1 (progress to next level 0%)</p>
      <div className="levels">
        <Level level={1} n={1} />
        <Level disabled level={1} n={2} />
        <Level disabled level={1} n={3} />
        <Level disabled level={1} n={4} />
        <Level disabled level={2} n={5} isChallenge />
      </div>
    </main>
  );
}

function Level(props) {
  const {
    level,
    n,
    isChallenge,
    disabled,
  } = props;

  // create a sample assignment at given level
  // no need to use `n` for rng, we're only using the level's image
  const assignment = levels[level](rng);

  const mainClass = `level ${isChallenge ? 'challenge' : ''}`;

  const content = (
    <>
      { assignment.image && (
        <img className="icon" src={assignment.image} alt="level icon" draggable="false" />
      ) }
      <span className="n">{ n }</span>
    </>
  );

  if (disabled) {
    return (
      <div className={`${mainClass} disabled`}>
        { content }
      </div>
    );
  } else {
    return (
      <Link to={`/eq/${level}/${n}`} className={mainClass}>
        { content }
      </Link>
    );
  }
}
