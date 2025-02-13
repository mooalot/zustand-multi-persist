import { create } from 'zustand';
import { multiPersist } from '../src';
import { persist } from 'zustand/middleware';

type State = {
  text: string;
  count: number;
};

const useStore = create<State>()(
  multiPersist(
    (set, get) => ({
      text: 'hello',
      count: 0,
    }),
    {
      text: {
        partialize: (state) => ({ text: state.text }),
      },
      count: {
        // partialize: (state) => ({ count: state.count }),
      },
    }
  )
);

useStore.persistMap.count;
useStore.persistMap.text;

const useStore2 = create<State>()(
  persist(
    (set, get) => ({
      text: 'hello',
      count: 0,
    }),
    {
      name: 'persistedStore',
    }
  )
);

useStore2.persist.getOptions;
