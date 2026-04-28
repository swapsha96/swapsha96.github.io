import { describe, it, expect } from 'vitest';
import {
  COLS,
  ROWS,
  DIR,
  createInitialState,
  tick,
  changeDirection,
  isOpposite,
  randomFood,
  decrementBonusTimer,
  setBonusFood,
} from '../../src/lib/snake-engine';

function makeState(overrides: Partial<ReturnType<typeof createInitialState>> = {}) {
  return { ...createInitialState(), ...overrides };
}

describe('snake-engine', () => {
  describe('isOpposite', () => {
    it('returns true for opposite directions', () => {
      expect(isOpposite(DIR.up, DIR.down)).toBe(true);
      expect(isOpposite(DIR.down, DIR.up)).toBe(true);
      expect(isOpposite(DIR.left, DIR.right)).toBe(true);
      expect(isOpposite(DIR.right, DIR.left)).toBe(true);
    });

    it('returns false for non-opposite directions', () => {
      expect(isOpposite(DIR.up, DIR.left)).toBe(false);
      expect(isOpposite(DIR.up, DIR.right)).toBe(false);
      expect(isOpposite(DIR.up, DIR.up)).toBe(false);
      expect(isOpposite(DIR.left, DIR.down)).toBe(false);
    });
  });

  describe('createInitialState', () => {
    it('creates a 3-segment snake at grid center, facing right', () => {
      const state = createInitialState();

      expect(state.snake.length).toBe(3);
      expect(state.direction).toEqual(DIR.right);
      expect(state.score).toBe(0);
      expect(state.gameOver).toBe(false);
      expect(state.running).toBe(false);
      expect(state.bonusFood).toBeNull();
      expect(state.bonusFoodTicks).toBe(0);

      const midX = Math.floor(COLS / 2);
      const midY = Math.floor(ROWS / 2);
      expect(state.snake[0]).toEqual({ x: midX, y: midY });
      expect(state.snake[1]).toEqual({ x: midX - 1, y: midY });
      expect(state.snake[2]).toEqual({ x: midX - 2, y: midY });
    });

    it('places food on an unoccupied cell', () => {
      const state = createInitialState();
      const snakeSet = new Set(state.snake.map((p) => `${p.x},${p.y}`));
      expect(snakeSet.has(`${state.food.x},${state.food.y}`)).toBe(false);
    });
  });

  describe('randomFood', () => {
    it('never returns a position occupied by snake', () => {
      const snake = [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ];
      for (let i = 0; i < 50; i++) {
        const food = randomFood(snake);
        const onSnake = snake.some((s) => s.x === food.x && s.y === food.y);
        expect(onSnake).toBe(false);
      }
    });

    it('returns a position within bounds', () => {
      for (let i = 0; i < 50; i++) {
        const food = randomFood([]);
        expect(food.x).toBeGreaterThanOrEqual(0);
        expect(food.x).toBeLessThan(COLS);
        expect(food.y).toBeGreaterThanOrEqual(0);
        expect(food.y).toBeLessThan(ROWS);
      }
    });

    it('excludes an extra position when provided', () => {
      const snake = [{ x: 0, y: 0 }];
      const exclude = { x: 1, y: 0 };
      for (let i = 0; i < 30; i++) {
        const food = randomFood(snake, exclude);
        expect(food).not.toEqual(exclude);
        expect(food).not.toEqual({ x: 0, y: 0 });
      }
    });
  });

  describe('changeDirection', () => {
    it('changes direction when not opposite', () => {
      const state = createInitialState();
      const updated = changeDirection(state, DIR.up);
      expect(updated.direction).toEqual(DIR.up);
    });

    it('rejects opposite direction', () => {
      const state = createInitialState(); // direction: right
      const updated = changeDirection(state, DIR.left);
      expect(updated.direction).toEqual(DIR.right);
    });
  });

  describe('decrementBonusTimer', () => {
    it('does nothing when no bonus food', () => {
      const state = createInitialState();
      const result = decrementBonusTimer(state);
      expect(result).toEqual(state);
    });

    it('decrements timer by 1', () => {
      const state = makeState({ bonusFood: { x: 5, y: 5 }, bonusFoodTicks: 10 });
      const result = decrementBonusTimer(state);
      expect(result.bonusFoodTicks).toBe(9);
      expect(result.bonusFood).toEqual({ x: 5, y: 5 });
    });

    it('removes bonus food when timer hits 0', () => {
      const state = makeState({ bonusFood: { x: 5, y: 5 }, bonusFoodTicks: 1 });
      const result = decrementBonusTimer(state);
      expect(result.bonusFoodTicks).toBe(0);
      expect(result.bonusFood).toBeNull();
    });
  });

  describe('setBonusFood', () => {
    it('sets bonus food with timer', () => {
      const state = createInitialState();
      const result = setBonusFood(state, { x: 3, y: 3 });
      expect(result.bonusFood).toEqual({ x: 3, y: 3 });
      expect(result.bonusFoodTicks).toBe(40);
    });

    it('clears bonus food when null', () => {
      const state = makeState({ bonusFood: { x: 5, y: 5 }, bonusFoodTicks: 10 });
      const result = setBonusFood(state, null);
      expect(result.bonusFood).toBeNull();
      expect(result.bonusFoodTicks).toBe(0);
    });
  });

  describe('tick', () => {
    it('does nothing when game is not running', () => {
      const state = createInitialState();
      const result = tick(state);
      expect(result).toEqual(state);
    });

    it('moves snake one cell in current direction', () => {
      const state = createInitialState();
      const midX = Math.floor(COLS / 2);
      const midY = Math.floor(ROWS / 2);

      const running = makeState({ running: true });
      const result = tick(running);

      expect(result.snake[0]).toEqual({ x: midX + 1, y: midY });
      expect(result.snake[1]).toEqual({ x: midX, y: midY });
      expect(result.snake[2]).toEqual({ x: midX - 1, y: midY });
      expect(result.snake.length).toBe(3);
    });

    it('grows snake when food is eaten', () => {
      const state = createInitialState();
      const head = state.snake[0];
      const running = makeState({ running: true, food: { x: head.x + 1, y: head.y } });
      const result = tick(running);

      expect(result.snake.length).toBe(4);
      expect(result.score).toBe(10);
      expect(result.food).toBeDefined();
    });

    it('grows by 2 and gives 25 points when bonus food eaten', () => {
      const state = createInitialState();
      const head = state.snake[0];
      const running = makeState({
        running: true,
        bonusFood: { x: head.x + 1, y: head.y },
        bonusFoodTicks: 10,
      });
      const result = tick(running);

      expect(result.snake.length).toBe(5); // 3 + 2
      expect(result.score).toBe(25);
      expect(result.bonusFood).toBeNull();
      expect(result.bonusFoodTicks).toBe(0);
    });

    it('handles both regular and bonus food eaten simultaneously', () => {
      const state = createInitialState();
      const head = state.snake[0];
      const running = makeState({
        running: true,
        food: { x: head.x + 1, y: head.y },
        bonusFood: { x: head.x + 1, y: head.y },
        bonusFoodTicks: 10,
      });
      const result = tick(running);

      expect(result.snake.length).toBe(6); // 3 + 3
      expect(result.score).toBe(35); // 10 + 25
      expect(result.bonusFood).toBeNull();
    });

    it('detects wall collision (right edge)', () => {
      const running = makeState({
        snake: [{ x: COLS - 1, y: 0 }, { x: COLS - 2, y: 0 }],
        direction: DIR.right,
        running: true,
      });
      const result = tick(running);
      expect(result.gameOver).toBe(true);
      expect(result.running).toBe(false);
    });

    it('detects wall collision (left edge)', () => {
      const running = makeState({
        snake: [{ x: 0, y: 0 }],
        direction: DIR.left,
        running: true,
      });
      const result = tick(running);
      expect(result.gameOver).toBe(true);
    });

    it('detects wall collision (top edge)', () => {
      const running = makeState({
        snake: [{ x: 0, y: 0 }],
        direction: DIR.up,
        running: true,
      });
      const result = tick(running);
      expect(result.gameOver).toBe(true);
    });

    it('detects wall collision (bottom edge)', () => {
      const running = makeState({
        snake: [{ x: 0, y: ROWS - 1 }],
        direction: DIR.down,
        running: true,
      });
      const result = tick(running);
      expect(result.gameOver).toBe(true);
    });

    it('detects self collision', () => {
      const running = makeState({
        snake: [
          { x: 3, y: 3 },
          { x: 4, y: 3 },
          { x: 4, y: 4 },
          { x: 3, y: 4 },
          { x: 2, y: 4 },
          { x: 2, y: 3 },
        ],
        direction: DIR.right,
        running: true,
      });
      const result = tick(running);
      expect(result.gameOver).toBe(true);
    });
  });
});
