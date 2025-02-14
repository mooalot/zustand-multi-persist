import { StoreApi } from 'zustand';
import { persist } from 'zustand/middleware';
import { MultiPersist } from './types';

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
