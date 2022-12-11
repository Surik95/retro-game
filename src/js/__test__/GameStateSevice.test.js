import GameStateService from '../GameStateService';
import GamePlay from '../GamePlay';
import GameController from '../GameController';

jest.mock('../GameStateService');
jest.mock('../GamePlay');

beforeEach(() => {
  jest.resetAllMocks();
});

test('load state error handling', () => {
  const gamePlay = new GamePlay();
  const stateService = new GameStateService(localStorage);
  const gameCtrl = new GameController(gamePlay, stateService);
  gameCtrl.init();

  stateService.load.mockImplementation(() => {
    throw new Error('Ошибка загрузки');
  });
  gameCtrl.onLoadGameClick();

  expect(stateService.load).toBeCalledTimes(1);
  expect(GamePlay.showError).toBeCalledTimes(1);
  expect(GamePlay.showError).toBeCalledWith('Ошибка загрузки');
});
