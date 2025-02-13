import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React, { act } from 'react';
import { afterEach, expect, test } from 'vitest';
import { create } from 'zustand';
import { multiPersist } from '../src';
import { createJSONStorage, StateStorage } from 'zustand/middleware';

type AppState = {
  count: number;
  count2: number;
  increamentCount: () => void;
  increamentCount2: () => void;
};

const storage1: { [key: string]: string } = {};

const storage2: { [key: string]: string } = {};

const storage1Implementation: StateStorage = {
  getItem: async (name) => {
    return storage1[name];
  },
  setItem: async (name, value) => {
    storage1[name] = value;
  },
  removeItem: async (name) => {
    delete storage1[name];
  },
};

const storage2Implementation: StateStorage = {
  getItem: async (name) => {
    return storage2[name];
  },
  setItem: async (name, value) => {
    storage2[name] = value;
  },
  removeItem: async (name) => {
    delete storage2[name];
  },
};

// Create zustand store
const useStore = create<AppState>()(
  multiPersist(
    (set, get) => ({
      count: 0,
      count2: 0,
      increamentCount: () => {
        console.log('increamentCount');
        set((state) => ({ count: state.count + 1 }));
      },
      increamentCount2: () => set((state) => ({ count2: state.count2 + 1 })),
    }),
    {
      count: {
        storage: createJSONStorage(() => storage1Implementation),
        partialize: (state) => ({ count: state.count }),
      },
      count2: {
        storage: createJSONStorage(() => storage2Implementation),
        partialize: (state) => ({ count2: state.count2 }),
      },
    }
  )
);
const App = () => {
  const count = useStore((state) => state.count);
  const count2 = useStore((state) => state.count2);
  const increamentCount1 = useStore.getState().increamentCount;
  const increamentCount2 = useStore.getState().increamentCount2;

  return (
    <div>
      <div data-testid="count">{count}</div>
      <div data-testid="count2">{count2}</div>
      <button onClick={increamentCount1} type="button">
        Increament Count
      </button>
      <button onClick={increamentCount2} type="button">
        Increament Count2
      </button>
    </div>
  );
};

describe('multiPersist', () => {
  afterEach(() => {
    cleanup();
  });

  test('should have count', async () => {
    render(<App />);
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(screen.getByTestId('count2')).toHaveTextContent('0');
  });

  test('should increament count', async () => {
    render(<App />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Increament Count' }));
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    expect(screen.getByTestId('count2')).toHaveTextContent('0');
  });

  test('should increament count2', async () => {
    render(<App />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Increament Count2' }));
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(screen.getByTestId('count2')).toHaveTextContent('1');
  });

  test('counts should be written to storage', async () => {
    render(<App />);
    const user = userEvent.setup();
    expect(storage1.count).toBeUndefined();
    expect(storage2.count2).toBeUndefined();
    await user.click(screen.getByRole('button', { name: 'Increament Count' }));
    await user.click(screen.getByRole('button', { name: 'Increament Count2' }));
    expect(JSON.parse(storage1.count)).toEqual({
      state: { count: 1 },
      version: 0,
    });
    expect(JSON.parse(storage2.count2)).toEqual({
      state: { count2: 1 },
      version: 0,
    });
  });
});
