import * as React from 'react';

import { AppState } from '../AppState';
import * as levels from '../levels/index';
import * as types from '../types';

import './LevelIndicator.css';

interface LevelIndicatorProps {
  appState: AppState,
  justWonAStar?: boolean,
}

export default function LevelIndicator(
  { appState, justWonAStar }: LevelIndicatorProps,
): JSX.Element {
  const userLevel = appState.userState.level;
  justWonAStar = justWonAStar ?? false;

  const classes = ['level-indicator'];
  if (justWonAStar && appState.userState.progressTowardsNextLevel === 0) classes.push('won');

  return (
    <p className={classes.join(' ')}>
      <span className="label">Level </span>
      <span className="level">{ userLevel }</span>
      { renderProgress(appState, justWonAStar) }
    </p>
  );
}

function renderProgress(appState: AppState, justWonAStar: boolean) {
  const userLevel = appState.userState.level;

  if (userLevel === levels.topLevel) {
    return (
      <span className="progress">(top level)</span>
    );
  }

  const progress = appState.userState.progressTowardsNextLevel;
  const required = types.PROGRESS_PER_LEVEL;

  const stars: JSX.Element[] = [];

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
