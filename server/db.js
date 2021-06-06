// Imports the Google Cloud client library
// const { Datastore } = require('@google-cloud/datastore');

// Creates a client
// const datastore = new Datastore({ namespace: 'v1' });

// const BOOKS_KIND = 'Books';
// const BIN_KIND = 'Bin';
// const IDS_KEY = datastore.key([BOOKS_KIND]);

// initialize in-memory data
const knownUsers = new Map();
knownUsers.set('96C9364D-4CFD-4B6D-AB5B-2D9D7172DA67', {
  name: 'Maya',
  score: 7,
  progress: 0,
  level: 1,
  lastAssignments: [],
});

const knownAssignments = new Map();
for (const user of knownUsers.keys()) {
  knownAssignments.set(user, []);
}

exports.getUserInfo = (user) => {
  return knownUsers.get(user);
};

exports.getAssignments = (user) => {
  return knownAssignments.get(user);
};

exports.saveAssignment = (user, assignment) => {
  const assignments = knownAssignments.get(user);
  if (!assignments[assignment.n]) {
    assignments[assignment.n] = assignment;
    return true;
  } else {
    return false;
  }
};

exports.checkUserIsKnown = (user) => {
  return knownUsers.has(user);
};
