import React from 'react';

import './LevelIndicator.css';

export default function LevelIndicator({ appState }) {
  const userLevel = appState.level;

  return (
    <p className="level-indicator">
      <span className="label">Level </span>
      <span className="level">{ userLevel }</span>
      { renderProgress(appState) }
    </p>
  );
}

function renderProgress(appState) {
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
      stars.push(<span key={i} className="star achieved" />);
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
