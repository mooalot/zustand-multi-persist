import { create } from 'zustand';
import { multiPersist } from '../src';
import { createJSONStorage } from 'zustand/middleware';

type State = {
  text: string;
  count: number;
};

export const useStore = create<State>()(
  multiPersist(
    () => ({
      text: 'hello',
      count: 0,
    }),
    {
      text: {
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ text: state.text }),
      },
      count: {
        storage: createJSONStorage(() => sessionStorage),
        partialize: (state) => ({ count: state.count }),
      },
    }
  )
);
