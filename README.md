# Zustand Multi Persist

Zustand middleware to persist multiple parts of the state to different storages, building on top of zustand's persist middleware.

## Installation

```bash
npm install zustand-multi-persist
```

## Usage Example

```javascript
import { create } from 'zustand';
import { multiPersist } from 'zustand-multi-persist';
import { createJSONStorage } from 'zustand/middleware';

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

```
