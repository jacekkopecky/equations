declare module '*.png' {
  const url: string;
  export default url;
}

declare namespace Seedrandom {
  interface prng {
    (): number;
  }

  interface seedrandomPrng {
    (seed?: string): prng;
  }
}

declare module 'seedrandom' {
  const seedrandom: Seedrandom.seedrandomPrng;
  export default seedrandom;

  export type prng = Seedrandom.prng;
}
