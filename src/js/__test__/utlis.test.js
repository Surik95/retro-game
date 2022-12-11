import { calcTileType } from '../utils';

test.each([
  [0, 9, 'top-left'],
  [80, 9, 'bottom-right'],
  [5, 9, 'top'],
  [8, 9, 'top-right'],
  [17, 9, 'right'],
  [18, 9, 'left'],
  [72, 9, 'bottom-left'],
  [73, 9, 'bottom'],
  [50, 9, 'center'],
])(
  'работа функции calcTileType клетка %s размер поля %s ',
  (index, boardSize, expected) => {
    expect(calcTileType(index, boardSize)).toBe(expected);
  },
);
