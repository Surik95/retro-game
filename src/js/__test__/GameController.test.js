import GameController from '../GameController';
import Bowman from '../characters/Bowman';
import Magician from '../characters/Magician';
import Swordsman from '../characters/Swordsman';
import Zombie from '../characters/Zombie';
import Undead from '../characters/Undead';
import Daemon from '../characters/Daemon';
import GamePlay from '../GamePlay';
import { characterGenerator, generateTeam } from '../generators';
import Character from '../Character';
import Team from '../Team';

test('проверка функции characterGenerator', () => {
  const playerTypes = [Bowman, Swordsman, Magician];
  const playerGenerator = characterGenerator(playerTypes, 2);

  expect(playerGenerator.next().value).toBeInstanceOf(Character);
  expect(playerGenerator.next().value).toBeInstanceOf(Character);
  expect(playerGenerator.next().value).toBeInstanceOf(Character);
  expect(playerGenerator.next().value).toBeInstanceOf(Character);
  expect(playerGenerator.next().value).toBeInstanceOf(Character);
  expect(playerGenerator.next().value).toBeInstanceOf(Character);
  expect(playerGenerator.next().value).toBeInstanceOf(Character);
  expect(playerGenerator.next().value).toBeInstanceOf(Character);
});

test('проверка функции generateTeam ', () => {
  const playerTypes = [Bowman, Swordsman, Magician];
  const team = generateTeam(playerTypes, 2, 5);
  expect(team.character).toHaveLength(5);
  expect(team.character[0].level <= 2).toBe(true);
  expect(team.character[1].level <= 2).toBe(true);
  expect(team.character[2].level <= 2).toBe(true);
  expect(team.character[3].level <= 2).toBe(true);
  expect(team.character[4].level <= 2).toBe(true);
});

test('проверка функции drawPlayers', () => {
  const gameCtrl = new GameController(new GamePlay());
  expect(gameCtrl.drawPlayers()).toHaveLength(4);
});

test('создание экземпляра класса Character', () => {
  expect(() => new Character()).toThrow('Создать экземляр класса невозможно');
});

test('создание экземляра класса Magician', () => {
  const result = new Magician(1);
  expect(result).toEqual({
    attack: 10,
    defence: 40,
    health: 50,
    level: 1,
    type: 'magician',
  });
});

test.each([
  [Bowman, 25, 25, 'bowman'],
  [Swordsman, 40, 10, 'swordsman'],
  [Magician, 10, 40, 'magician'],
  [Undead, 40, 10, 'undead'],
  [Zombie, 25, 25, 'zombie'],
  [Daemon, 10, 40, 'daemon'],
])('создание персонажа %s 1 уровня', (Personage, attack, defence, type) => {
  const result = new Personage(1);
  expect(result.attack).toBe(attack);
  expect(result.defence).toBe(defence);
  expect(result.type).toBe(type);
  expect(result.level).toBe(1);
  expect(result.health).toBe(50);
});

test('вывод сообщения', () => {
  const gamePlay = new GamePlay();
  const container = document.createElement('div');
  container.outerHTML = '<div id="game-container"></div>';
  gamePlay.bindToDOM(container);
  const gameCtrl = new GameController(gamePlay, {});
  gameCtrl.init();

  const personage = gameCtrl.gameState.positionPersonage[0];
  gameCtrl.onCellEnter(personage.position);

  expect(gamePlay.cells[personage.position].title).toBe(
    `🎖${personage.character.level} ⚔${personage.character.attack} 🛡${personage.character.defence} ❤${personage.character.health}`,
  );

  gameCtrl.onCellEnter(11);
  expect(gamePlay.cells[11].title).toBe('');
});
