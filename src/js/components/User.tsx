import * as React from 'react';
import { useState, useEffect, useRef } from 'react';

import './User.css';

import { AppState } from '../AppState';
import ActivityIndicator from './ActivityIndicator';

export default function User({ appState }: { appState: AppState }): JSX.Element {
  const [signInShowing, setSignInShowing] = useState(false);
  const [currentCode, setCurrentCode] = useState(appState.currentLoginCode ?? '');

  const loggedIn = Boolean(appState.currentLoginCode);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (signInShowing) {
      inputRef.current?.focus();
    }
  });

  function logIn(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = currentCode.trim();
    if (trimmed) {
      appState.logIn(trimmed);
      setSignInShowing(false);
    }
  }

  const signInBoxIfShowing = signInShowing && (
    <form id="user-sign-in" onSubmit={logIn}>
      <input
        placeholder="enter user code"
        value={currentCode}
        onChange={(e) => {
          setCurrentCode(e.target.value);
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
      <ActivityIndicator appState={appState} />
    </form>
  );

  if (loggedIn) {
    // todo add sign-out that will clear local storage
    return (
      <div id="user">
        { signInBoxIfShowing }
        { appState.userState.name || 'guest' }
      </div>
    );
  } else {
    return (
      <div id="user">
        { signInBoxIfShowing }
        <button onClick={() => setSignInShowing((s) => !s)} type="button">sign in</button>
      </div>
    );
  }
}
