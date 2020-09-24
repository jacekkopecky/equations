const react = require('react');

// useLayoutEffect in node.js produces an unnecessary warning
// it may be necessary to remove this mock when we test full rendering
react.useLayoutEffect = react.useEffect;

module.exports = react;
