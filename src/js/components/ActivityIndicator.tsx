import * as React from 'react';

import './ActivityIndicator.css';

import { ActivityStatusType } from '../types';
import { AppState } from '../AppState';

interface ActivityIndicatorProps {
  short?: boolean,
  appState: AppState,
}

const ONE_LETTER_TYPE: Record<ActivityStatusType, string> = {
  offline: '⚡️',
  loggingIn: '🔐',
  synced: '✔️',
  loading: '↓',
  saving: '↑',
  error: '✘',
};

const TYPE_TITLE: Record<ActivityStatusType, string> = {
  offline: 'offline',
  loggingIn: 'logging in',
  synced: 'synced with server',
  loading: 'loading from server',
  saving: 'saving to server',
  error: 'error',
};

export default function ActivityIndicator(props: ActivityIndicatorProps): JSX.Element {
  const { short, appState } = props;

  const { status, message } = appState.activity;
  const className = `activity-indicator ${status} ${short ? 'short' : 'long'}`;

  if (short) {
    return (
      <div className={className}>
        <span className="char" title={TYPE_TITLE[status]}>
          { ONE_LETTER_TYPE[status] }
        </span>
        <div className="expanded">
          <div className="status">{ ONE_LETTER_TYPE[status] } { TYPE_TITLE[status] }</div>
          { message && <div className="message">{ message }</div> }
        </div>
      </div>
    );
  } else {
    return (
      <div className={className}>
        { message && <div className="message">{ message }</div> }
        { !message && status === ActivityStatusType.loggingIn && <div className="message">Logging in…</div> }
      </div>
    );
  }
}
