# Equations

A little program for practicing equations.

The program creates equations, lets the user solve them and check their answers, and keeps a score. There are also levels, where the user gets progressively more complicated equations, and every few equations the user gets one from one level above (a "challenge").

## Development notes

todo:

- semi-randomly select assignments simpler than current userLevel?
  - maybe, in a batch: extra easy, normal, easy, normal, challenge?

- give extra score for verified steps towards solution? (level is 10, step is 1?)
- give 3-1 stars (score points) for first-third attempt? should score be given only if answered within a given number of attempts?

- keep time better?
  - first, note how long users take between keystrokes?
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
- assignment page needs to show entered answers? (when wrong)
  - maybe keep record of all attempts?
- move to next needs to have a visible transition


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
