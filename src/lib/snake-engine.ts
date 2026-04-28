/** Snake game engine — pure functions for testability. */

export const COLS = 16;
export const ROWS = 10;

export interface Point {
  x: number;
  y: number;
}

export type Direction = Point;

export const DIR: Record<string, Direction> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export interface SnakeState {
  snake: Point[];
  direction: Direction;
  food: Point;
  bonusFood: Point | null;
  bonusFoodTicks: number;
  score: number;
  gameOver: boolean;
  running: boolean;
}

/** Returns true when the two directions are opposites. */
export function isOpposite(a: Direction, b: Direction): boolean {
  return a.x + b.x === 0 && a.y + b.y === 0;
}

/** Generates a random food position not occupied by the snake (or bonus food). */
export function randomFood(snake: Point[], exclude?: Point | null): Point {
  const occupied = new Set(snake.map((p) => `${p.x},${p.y}`));
  if (exclude) occupied.add(`${exclude.x},${exclude.y}`);
  const free: Point[] = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (!occupied.has(`${x},${y}`)) free.push({ x, y });
    }
  }
  return free.length > 0 ? free[Math.floor(Math.random() * free.length)] : { x: 0, y: 0 };
}

/** Creates the initial game state (not running, needs a START press). */
export function createInitialState(): SnakeState {
  const midX = Math.floor(COLS / 2);
  const midY = Math.floor(ROWS / 2);
  const initialSnake = [
    { x: midX, y: midY },
    { x: midX - 1, y: midY },
    { x: midX - 2, y: midY },
  ];
  return {
    snake: initialSnake,
    direction: DIR.right,
    food: randomFood(initialSnake),
    bonusFood: null,
    bonusFoodTicks: 0,
    score: 0,
    gameOver: false,
    running: false,
  };
}

/** Changes direction unless it would reverse into the snake. */
export function changeDirection(state: SnakeState, dir: Direction): SnakeState {
  if (isOpposite(dir, state.direction)) return state;
  return { ...state, direction: dir };
}

/** Decrements the bonus food timer. If it hits 0, removes bonus food. */
export function decrementBonusTimer(state: SnakeState): SnakeState {
  if (!state.bonusFood || state.bonusFoodTicks <= 0) return state;
  const next = state.bonusFoodTicks - 1;
  return { ...state, bonusFoodTicks: next, bonusFood: next === 0 ? null : state.bonusFood };
}

/** Spawns bonus food at the given position (if null, no bonus food). */
export function setBonusFood(state: SnakeState, pos: Point | null): SnakeState {
  return { ...state, bonusFood: pos, bonusFoodTicks: pos ? 40 : 0 };
}

/** Advances the game by one tick. Returns a new state. */
export function tick(state: SnakeState): SnakeState {
  if (!state.running || state.gameOver) return state;

  const head = state.snake[0];
  const newHead: Point = {
    x: head.x + state.direction.x,
    y: head.y + state.direction.y,
  };

  // Wall collision
  if (newHead.x < 0 || newHead.x >= COLS || newHead.y < 0 || newHead.y >= ROWS) {
    return { ...state, gameOver: true, running: false };
  }

  // Self collision — check against all except the last segment (it will move away)
  const bodyToCheck = state.snake.slice(0, -1);
  if (bodyToCheck.some((p) => p.x === newHead.x && p.y === newHead.y)) {
    return { ...state, gameOver: true, running: false };
  }

  const ate = newHead.x === state.food.x && newHead.y === state.food.y;
  const bonusAte =
    state.bonusFood !== null && newHead.x === state.bonusFood.x && newHead.y === state.bonusFood.y;

  const newSnake = [newHead, ...state.snake];

  // Growth logic
  if (ate && bonusAte) {
    // Both eaten — grow by 3 (don't pop, push 2 extra tail copies)
    const tail = newSnake[newSnake.length - 1];
    newSnake.push({ ...tail }, { ...tail });
  } else if (bonusAte) {
    // Bonus food — grow by 2
    const tail = newSnake[newSnake.length - 1];
    newSnake.push({ ...tail });
  } else if (ate) {
    // Regular food — grow by 1 (don't pop)
  } else {
    newSnake.pop();
  }

  return {
    ...state,
    snake: newSnake,
    food: ate ? randomFood(newSnake, bonusAte ? null : state.bonusFood) : state.food,
    bonusFood: bonusAte ? null : state.bonusFood,
    bonusFoodTicks: bonusAte ? 0 : state.bonusFoodTicks,
    score: state.score + (ate ? 10 : 0) + (bonusAte ? 25 : 0),
  };
}
