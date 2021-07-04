import { Datastore, Transaction, Entity } from '@google-cloud/datastore';

import { UserInfo, Assignment } from '../../src/js/shared-with-server/types';

const datastore = new Datastore({ namespace: 'equations-v1' });
const KIND = 'UserState';

interface DBUserState {
  info: UserInfo,
  assignments: Assignment[],
}

interface UserStateEntity extends Entity {
  json: string,
}

type TX = Datastore | Transaction;

// exported functions

export async function loadUserState(user: string, tx: TX = datastore): Promise<DBUserState> {
  const [entity] = await tx.get(userKey(user)) as [UserStateEntity];
  return toUserState(entity);
}

export async function saveUserState(user: string, state: DBUserState, tx: TX = datastore): Promise<void> {
  await tx.save(toEntity(state, user));
}

export async function checkUserIsKnown(user: string): Promise<boolean> {
  const query = datastore.createQuery(KIND);
  query.select('__key__');
  query.filter('__key__', userKey(user));
  const [entities] = await query.run();
  return entities.length > 0;
}

export async function startTransaction(): Promise<Transaction> {
  const tx = datastore.transaction();
  await tx.run();
  return tx;
}

// internal functions

function userKey(user: string) {
  return datastore.key([KIND, user]);
}

function toEntity(state: DBUserState, user: string): Entity {
  const json = JSON.stringify(state);
  return {
    key: userKey(user),
    excludeFromIndexes: ['json'],
    data: { json },
  };
}

function toUserState(entity: UserStateEntity): DBUserState {
  return JSON.parse(entity.json) as DBUserState;
}
