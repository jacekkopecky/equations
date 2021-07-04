import * as React from 'react';
import { useState, useEffect, useRef } from 'react';

import './User.css';

import { AppState } from '../AppState';
import * as api from '../tools/api';
import ActivityIndicator from './ActivityIndicator';

export default function User({ appState }: { appState: AppState }): JSX.Element {
  const [signInShowing, setSignInShowing] = useState(false);
  const [currentCode, setCurrentCode] = useState(appState.currentLoginCode ?? '');

  const [userNotRegistered, setUserNotRegistered] = useState<string>();
  const [checking, setChecking] = useState(false);

  const loggedIn = Boolean(appState.currentLoginCode);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (signInShowing) {
      inputRef.current?.focus();
    }
  });

  async function logIn(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = currentCode.trim();
    if (trimmed) {
      setUserNotRegistered(undefined);
      setChecking(true);
      const userAccepted = await api.checkUser(trimmed);
      setChecking(false);
      if (userAccepted) {
        appState.logIn(trimmed);
        setSignInShowing(false);
      } else {
        setUserNotRegistered(trimmed);
      }
    }
  }

  const signInBoxIfShowing = signInShowing && (
    <form id="user-sign-in" onSubmit={logIn}>
      <input
        placeholder="enter registered user code"
        value={currentCode}
        onChange={(e) => {
          setCurrentCode(e.target.value);
        }}
        ref={inputRef}
      />
      { userNotRegistered && <p className="error">User not registered: {userNotRegistered}</p> }
      { checking
        ? (
          <button type="submit" disabled>signing in…</button>
        )
        : (
          <button type="submit" disabled={currentCode === ''}>sign in</button>
        )}
      <button
        onClick={() => {
          setSignInShowing(false);
          setUserNotRegistered(undefined);
          setCurrentCode('');
        }}
        type="button"
      >
        cancel
      </button>
      <p>You can play without signing in; your progress will be saved only on&nbsp;this computer.</p>
      <p>To register to save progress on&nbsp;our&nbsp;server, please email jacek@jacek.cz.</p>
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
