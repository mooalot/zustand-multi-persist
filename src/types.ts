import { StateCreator, StoreMutatorIdentifier, StoreMutators } from 'zustand';
import { PersistOptions } from 'zustand/middleware';

type Write<T, U> = Omit<T, keyof U> & U;

declare module 'zustand/vanilla' {
  interface StoreMutators<S, A> {
    'zustand-multi-persist': WithMultiPersist<S, A>;
  }
}

export type ExtractPersistType<S> = S extends { persist: any }
  ? S['persist']
  : never;

export type StoreMultiPersist<S, A> = {
  persistMap: A extends Record<string, ModifiedPersistOptions<any, any>>
    ? {
        [K in keyof A]: A[K] extends ModifiedPersistOptions<any, infer U>
          ? ExtractPersistType<StoreMutators<S, U>['zustand/persist']>
          : never;
      }
    : never;
};
export type WithMultiPersist<S, A> = Write<S, StoreMultiPersist<S, A>>;

export type ModifiedPersistOptions<T, U = T> = Omit<
  PersistOptions<T, U>,
  'name'
>;

export type MultiPersist = <
  T,
  R extends Record<string, ModifiedPersistOptions<T, any>>,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  creator: StateCreator<T, [...Mps, ['zustand-multi-persist', unknown]], Mcs>,
  options: R
) => StateCreator<T, Mps, [['zustand-multi-persist', R], ...Mcs]>;
