import React from 'react';

import './LevelIndicator.css';

export default function LevelIndicator({ appState, justWonAStar }) {
  const userLevel = appState.level;

  const classes = ['level-indicator'];
  if (justWonAStar && appState.progress === 0) classes.push('won');

  return (
    <p className={classes.join(' ')}>
      <span className="label">Level </span>
      <span className="level">{ userLevel }</span>
      { renderProgress(appState, justWonAStar) }
    </p>
  );
}

function renderProgress(appState, justWonAStar) {
  const userLevel = appState.level;

  if (userLevel === appState.topLevel) {
    return (
      <span className="progress">(top level)</span>
    );
  }

  const progress = appState.progress;
  const required = appState.progressRequired;

  const stars = [];

  for (let i = 0; i < required; i += 1) {
    if (i < progress) {
      const classes = ['star', 'achieved'];
      if (i === progress - 1 && justWonAStar) classes.push('won');
      stars.push(<span key={i} className={classes.join(' ')} />);
    } else {
      stars.push(<span key={i} className="star needed" />);
    }
  }

  return (
    <span className="progress">
      <span className="stars" title={`need to solve ${required - progress} more challenges to reach level ${userLevel + 1}`}>
        { stars }
      </span>

    </span>
  );
}
