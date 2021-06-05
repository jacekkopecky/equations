import * as React from 'react';
import { useState, useEffect, useRef } from 'react';

import './User.css';

import { AppState } from '../AppState';
import ActivityIndicator from './ActivityIndicator';

export default function User({ appState }: { appState: AppState }): JSX.Element {
  const [signInShowing, setSignInShowing] = useState(false);
  const [currentCode, setCurrentCode] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (signInShowing) {
      inputRef.current?.focus();
    }
  });

  function logIn(e: React.FormEvent) {
    e.preventDefault();

    appState.logIn(currentCode);
    setSignInShowing(false);
  }

  const signInBox = signInShowing && (
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

  if (appState.loggedIn) {
    // todo add sign-out that will clear local storage
    return (
      <div id="user">
        { signInBox }
        { appState.userName || 'anonymous' }
      </div>
    );
  } else {
    return (
      <div id="user">
        { signInBox }
        <button onClick={() => setSignInShowing((s) => !s)} type="button">sign in</button>
      </div>
    );
  }
}
