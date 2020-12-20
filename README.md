# Equations

A little program for practicing equations.

The program creates equations, lets the user solve them and check their answers, and keeps a score. There are also levels, where the user gets progressively more complicated equations, and every few equations the user gets one from one level above (a "challenge").

## Development notes

Development happens on branch `main`. Commits there that pass CI are built and deployed in branch `production` by GitHub Actions.

To add new levels, go to `src/js/levels`. Levels are tested for solvability in `levels.test.ts`; by default we test the first 500 assignments for each level; to test more, run something like this:

```
SOLVABILITY_ITERATIONS=10000 jest tests/levels.test.ts
```



## todo:

- give extra score for verified steps towards solution? (level is 10, step is 1?)
- give 3-1 stars (score points) for first-third attempt? should score be given only if answered within a given number of attempts?

- keep time better?
  - first, evaluate how long measured pauses are
  - time counting only with keystrokes? pause after half a minute without a keystroke?
  - maybe later award extra type of point (not counted but showing) for being within some time.

- add tutorial levels
  - get played before the first challenge of a given level
  - any level has a link to its tutorial level
  - don't allow the user to make assignment 4 in a batch a challenge if winning it would lead to leveling up
  - tutorial levels don't get selected (as easy) when we're above this level
- initial tutorial
  - explain level progress (gathering stars from doing challenges)

- move it to bananas.jacek.cz

- say "back to stats" instead of "back to overview" when coming from stats
- assignment page can show incorrect attempts

- more levels?
  - negative numbers
  - a,b,c...  Alex, Bobby, Cass, ... - each run x,y,z,... meters, totaling N seconds; what's the speed of each runner? – e.g. backstory - a relay race game  (also practices converting speed, time, and distance)


### Levels

`js/levels/index.js` defines the levels


### Solution steps:

When the program can check the reasoning, here are some allowed (and recognized) solution steps:

1. `(1) ± (2)`
1. `N*(1) ± M*(2)`
1. `(1) ± N`
1. `(1) */ N`
1. `a in (1)`
1. `(2) in (1)`
1. `simplify(1)`
1. `split(1)`
1. `reorg(1)`
1. `flip(1)`
