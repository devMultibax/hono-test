import { describe, it, expect } from 'vitest';
import { createQueryKeys } from '@/hooks/createQueryKeys';

describe('createQueryKeys', () => {
  describe('all key', () => {
    it('returns array with only the scope string', () => {
      const keys = createQueryKeys('users');
      expect(keys.all).toEqual(['users']);
    });

    it('is readonly (as const)', () => {
      const keys = createQueryKeys('products');
      expect(Array.isArray(keys.all)).toBe(true);
      expect(keys.all[0]).toBe('products');
    });
  });

  describe('lists()', () => {
    it('returns [scope, "list"]', () => {
      const keys = createQueryKeys('departments');
      expect(keys.lists()).toEqual(['departments', 'list']);
    });

    it('is a function that returns a new tuple each call', () => {
      const keys = createQueryKeys('sections');
      const a = keys.lists();
      const b = keys.lists();
      expect(a).toEqual(b);
    });
  });

  describe('list(params)', () => {
    it('includes params as the third element', () => {
      const keys = createQueryKeys<{ page: number; limit: number }>('users');
      const params = { page: 1, limit: 20 };
      expect(keys.list(params)).toEqual(['users', 'list', params]);
    });

    it('uses reference equality for params object', () => {
      const keys = createQueryKeys('users');
      const params = { search: 'hello' };
      const result = keys.list(params);
      expect(result[2]).toBe(params);
    });

    it('works with empty params object', () => {
      const keys = createQueryKeys('users');
      const params = {};
      expect(keys.list(params)).toEqual(['users', 'list', {}]);
    });
  });

  describe('details()', () => {
    it('returns [scope, "detail"]', () => {
      const keys = createQueryKeys('employees');
      expect(keys.details()).toEqual(['employees', 'detail']);
    });
  });

  describe('detail(id)', () => {
    it('returns [scope, "detail", id]', () => {
      const keys = createQueryKeys('users');
      expect(keys.detail(42)).toEqual(['users', 'detail', 42]);
    });

    it('works with id = 0', () => {
      const keys = createQueryKeys('users');
      expect(keys.detail(0)).toEqual(['users', 'detail', 0]);
    });

    it('works with large id values', () => {
      const keys = createQueryKeys('records');
      expect(keys.detail(9999999)).toEqual(['records', 'detail', 9999999]);
    });
  });

  describe('scope isolation', () => {
    it('different scopes produce different keys', () => {
      const usersKeys = createQueryKeys('users');
      const postsKeys = createQueryKeys('posts');
      expect(usersKeys.all).not.toEqual(postsKeys.all);
      expect(usersKeys.lists()).not.toEqual(postsKeys.lists());
      expect(usersKeys.detail(1)).not.toEqual(postsKeys.detail(1));
    });

    it('same scope produces matching keys', () => {
      const keysA = createQueryKeys('tasks');
      const keysB = createQueryKeys('tasks');
      expect(keysA.all).toEqual(keysB.all);
      expect(keysA.lists()).toEqual(keysB.lists());
      expect(keysA.detail(5)).toEqual(keysB.detail(5));
    });
  });

  describe('key hierarchy', () => {
    it('all key is a prefix of lists key', () => {
      const keys = createQueryKeys('items');
      expect(keys.lists()[0]).toBe(keys.all[0]);
    });

    it('all key is a prefix of detail key', () => {
      const keys = createQueryKeys('items');
      expect(keys.detail(1)[0]).toBe(keys.all[0]);
    });

    it('lists key is a prefix of list(params) key', () => {
      const keys = createQueryKeys('items');
      const listKey = keys.lists();
      const listParamsKey = keys.list({ page: 1 });
      expect(listParamsKey[0]).toBe(listKey[0]);
      expect(listParamsKey[1]).toBe(listKey[1]);
    });
  });
});
