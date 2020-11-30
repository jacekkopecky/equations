import React from 'react';

export default function About() {
  return (
    <main>
      <p>This is a simple app for practicing equations.</p>
      <section id="credits">
        <h2>Credits</h2>
        <p>
          Created 2020 by Jacek Kopecký for – and with considerable
          input from – Maya, aged 11.
        </p>
        <p>
          Report issues, add comments or suggestions at our
          { ' ' }
          <a href="https://github.com/jacekkopecky/equations/issues">GitHub issues page</a>.
        </p>
        {
          // todo:
          // maybe incorporate the pictures, list level types
          // show an example question and how it could be solved
        }
      </section>
    </main>
  );
}
