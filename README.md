# Equations

A little program for practicing equations.

The program creates equations, lets the user solve them and check their answers, and keeps a score. There are also levels, where the user gets progressively more complicated equations, and every few equations the user gets one from one level above (a "challenge").

## Development notes

todo:

- when kid inputs values, give 3-1 stars? for first-third attempt; or just a point for solving with up to three checks?
- allow kid to give up and ask for the answer (no stars) - show me the answers button
- increase progress number (seed)

- maybe keep record of each of the first 3 tries
- keep time but maybe don't use it just yet (maybe later award extra type of point (not counted but showing) for being within some time)

- let kid write, remember it in local storage
- let overview allow the user to make a normal level a challenge, if the assignment (n) hasn't been attempted yet

- add tutorial levels that don't get randomly selected when we're above this level, and get played before the first challenge of a given level, and any level has a link to its tutorial level

- look at attempt counts in history, look at times


### Levels

`js/levels/index.js` defines the levels


### Solution steps:

1. `(1) ± (2)`
1. `N*(1) ± M*(2)`
1. `(1) ± N`
1. `(1) */ N`
1. `a in (1)`
1. `(2) in (1)`
1. `simplify(1)`
1. `split(1)`
1. `reorg(1)`
