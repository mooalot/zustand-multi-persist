import { create } from 'zustand';
import { multiPersist } from '../src';
import { expectType } from 'ts-expect';
import { persist } from 'zustand/middleware';

describe('multiPersist', () => {
  test('should create a store with multiple persist', () => {
    const creator = create<{
      user: { name: string; age: number };
      admin: { name: string; role: string };
    }>()(
      multiPersist(
        (set, get) => ({
          user: {
            name: 'John',
            age: 30,
          },
          admin: {
            name: 'Admin',
            role: 'admin',
          },
        }),
        {
          user: {
            partialize: (state) => ({
              user: state.user,
            }),
          },
          admin: {
            partialize: (state) => ({
              admin: state.admin,
            }),
          },
        }
      )
    );

    expectType<{
      user: {
        name: string;
        age: number;
      };
      admin: {
        name: string;
        role: string;
      };
    }>(creator.getState());
  });
});
