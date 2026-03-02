import { describe, it, expect, beforeEach } from 'vitest';
import { EventBus } from './EventBus';

describe('EventBus', () => {
  let bus: EventBus;

  beforeEach(() => {
    bus = new EventBus();
  });

  describe('on()', () => {
    it('регистрирует слушателя без ошибок', () => {
      expect(() => bus.on('test', () => {})).not.toThrow();
    });

    it('регистрирует несколько слушателей для одного события', () => {
      const calls: number[] = [];
      bus.on('test', () => calls.push(1));
      bus.on('test', () => calls.push(2));
      bus.emit('test');
      expect(calls).toEqual([1, 2]);
    });
  });

  describe('emit()', () => {
    it('вызывает зарегистрированного слушателя', () => {
      let called = false;
      bus.on('event', () => {
        called = true;
      });
      bus.emit('event');
      expect(called).toBe(true);
    });

    it('передаёт аргументы слушателю', () => {
      let received: unknown[] = [];
      bus.on<[string, number]>('event', (a, b) => {
        received = [a, b];
      });
      bus.emit<[string, number]>('event', 'hello', 42);
      expect(received).toEqual(['hello', 42]);
    });

    it('бросает ошибку при вызове незарегистрированного события', () => {
      expect(() => bus.emit('unknown')).toThrow('Нет события: unknown');
    });

    it('вызывает всех слушателей события', () => {
      let count = 0;
      bus.on('event', () => count++);
      bus.on('event', () => count++);
      bus.on('event', () => count++);
      bus.emit('event');
      expect(count).toBe(3);
    });
  });

  describe('off()', () => {
    it('удаляет конкретного слушателя', () => {
      let count = 0;
      const listener = () => count++;
      bus.on('event', listener);
      bus.off('event', listener);
      bus.emit('event');
      expect(count).toBe(0);
    });

    it('не удаляет других слушателей события', () => {
      let count = 0;
      const first = () => count++;
      const second = () => count++;
      bus.on('event', first);
      bus.on('event', second);
      bus.off('event', first);
      bus.emit('event');
      expect(count).toBe(1);
    });

    it('бросает ошибку при попытке удалить слушателя незарегистрированного события', () => {
      expect(() => bus.off('unknown', () => {})).toThrow('Нет события: unknown');
    });
  });
});
