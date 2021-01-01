import * as React from 'react';
import { useState, useEffect, useRef } from 'react';

import './User.css';

import { AppState } from '../AppState';

export default function Statistics({ appState }: { appState: AppState }): JSX.Element {
  const [signInShowing, setSignInShowing] = useState(false);
  const [currentCode, setCurrentCode] = useState('');
  const [error, setError] = useState('');
  const [extraMessage, setExtraMessage] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (signInShowing) {
      inputRef.current?.focus();
    }
  });

  async function logIn(e: React.FormEvent) {
    e.preventDefault();

    setExtraMessage('logging in…');
    setError('');

    const loginError = await appState.logIn(currentCode, setExtraMessage);
    setExtraMessage('');
    if (loginError) {
      setError(loginError);
    } else {
      setSignInShowing(false);
    }
  }

  if (appState.loggedIn) {
    // todo add sign-out that will clear local storage
    return (
      <div id="user">
        { appState.userName || 'anonymous' }
      </div>
    );
  } else {
    return (
      <div id="user">
        <button onClick={() => setSignInShowing(true)} type="button">sign in</button>
        { signInShowing && (
          <form id="user-sign-in" onSubmit={logIn}>
            <input
              placeholder="enter user code"
              value={currentCode}
              onChange={(e) => {
                setCurrentCode(e.target.value);
                setError('');
              }}
              ref={inputRef}
            />
            <button type="submit" disabled={currentCode === ''}>sign in</button>
            <button
              onClick={() => {
                setSignInShowing(false);
                setCurrentCode('');
              }}
              type="button"
            >
              cancel
            </button>
            <div className="extras">
              { error && <div className="error">{ error }</div> }
              { extraMessage && <div className="extra-message">{ extraMessage }</div> }
            </div>
          </form>
        ) }
      </div>
    );
  }
}
