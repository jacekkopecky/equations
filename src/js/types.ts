import Random from './tools/random';

import * as sharedTypes from './shared-with-server/types';

export * from './shared-with-server/types';

export type LevelFunction = (rng: Random) => sharedTypes.AssignmentDefinition;
