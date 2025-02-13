import {
  StateCreator,
  StoreApi,
  StoreMutatorIdentifier,
  StoreMutators,
} from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';

type Write<T, U> = Omit<T, keyof U> & U;

declare module 'zustand/vanilla' {
  interface StoreMutators<S, A> {
    'zustand/multi-persist': WithMultiPersist<S, A>;
  }
}

type ExtractPersistType<S> = S extends { persist: any } ? S['persist'] : never;

type StoreMultiPersist<S, A> = {
  persistMap: A extends Record<string, ModifiedPersistOptions<any, any>>
    ? {
        [K in keyof A]: A[K] extends ModifiedPersistOptions<infer T, infer U>
          ? ExtractPersistType<StoreMutators<S, U>['zustand/persist']>
          : never;
      }
    : never;
};
type WithMultiPersist<S, A> = Write<S, StoreMultiPersist<S, A>>;

type Func<T, R> = (arg: T) => R;
function compose<T, R>(...funcs: Func<T, R>[]): Func<T, R> {
  //@ts-ignore
  return (args) => funcs.reduceRight((acc, fn) => fn(acc), args);
}

type ModifiedPersistOptions<T, U = T> = Omit<PersistOptions<T, U>, 'name'>;

type MultiPersist = <
  T,
  R extends Record<string, ModifiedPersistOptions<T, any>>,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  creator: StateCreator<T, [...Mps, ['zustand/multi-persist', unknown]], Mcs>,
  options: R
) => StateCreator<T, Mps, [['zustand/multi-persist', R], ...Mcs]>;

const multiPersistImplementation = ((creator, options) => {
  if (Object.keys(options).length === 0)
    throw new Error('At least one storage must be provided.');
  const storages = Object.entries(options).map(([name, storage]) => {
    return { name, ...storage };
  });

  return (set, get, api) => {
    let current: any = creator;
    for (const storage of storages) {
      current = persist(current, storage);
    }

    const apiWithPersistMap = api as StoreApi<any> & {
      persistMap: Record<string, any>;
    };

    // create a proxy around the api to add the persistMap
    const proxyApi = new Proxy(apiWithPersistMap, {
      set: (target, prop, value) => {
        if (prop === 'persist') {
          const name: string = value?.getOptions()?.name;
          if (name in options) {
            return Reflect.set(target, 'persistMap', {
              ...target.persistMap,
              [name]: value,
            });
          }
        }
        return Reflect.set(target, prop, value);
      },
    });
    return current(set, get, proxyApi);
  };
}) as MultiPersist;

export const multiPersist =
  multiPersistImplementation as unknown as MultiPersist;
