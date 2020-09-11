import React, { useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';

// This hook returns a ref.
// If the dependencies have changed and the ref has an element, it will focus.
export function useAutofocusRef(dependencies) {
  const inputElRef = useRef(null);

  useEffect(() => {
    if (inputElRef.current && inputElRef.current.focus) {
      inputElRef.current.focus();
    }
  }, dependencies);

  return inputElRef;
}

export function PropsFromRouteParams(props) {
  const params = useParams();

  return React.cloneElement(props.children, params);
}
