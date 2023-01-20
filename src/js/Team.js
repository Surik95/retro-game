import PositionedCharacter from './PositionedCharacter';
import Bowman from './characters/Bowman';
import Daemon from './characters/Daemon';
import Magician from './characters/Magician';
import Swordsman from './characters/Swordsman';
import Undead from './characters/Undead';
import Zombie from './characters/Zombie';
import { generateTeam } from './generators';
/**
 * Класс, представляющий персонажей команды
 *
 * @todo Самостоятельно продумайте хранение персонажей в классе
 * Например
 * @example
 * ```js
 * const characters = [new Swordsman(2), new Bowman(1)]
 * const team = new Team(characters);
 *
 * team.characters // [swordsman, bowman]
 * ```
 * */
export default class Team {
  // TODO: write your logic here
  constructor() {
    this.playerCharacters = [Bowman, Magician, Swordsman];
    this.computerCharacters = [Daemon, Undead, Zombie];
  }

  init() {
    this.position = [
      ...this.positionDetermination(
        generateTeam([Bowman, Magician, Swordsman], 1, 2),
        'player',
      ),
      ...this.positionDetermination(
        generateTeam([Daemon, Undead, Zombie], 1, 2),
        'computer',
      ),
    ];
  }

  // eslint-disable-next-line class-methods-use-this
  positionDetermination(teamArr, player) {
    let positionOnBoard;
    const arrPosition = [];
    const position = [];
    const gameBoard = new Array(8 * 8);
    for (let i = 0; i < gameBoard.length; i += 1) {
      gameBoard[i] = i;
    }

    if (player === 'player') {
      positionOnBoard = gameBoard.filter((item) => item % 8 < 2);
    } else {
      positionOnBoard = gameBoard.filter((item) => item % 8 >= 8 - 2);
    }
    while (position.length < teamArr.length) {
      const cell = positionOnBoard[[Math.trunc(Math.random() * positionOnBoard.length)]];
      if (!position.includes(cell)) {
        position.push(cell);
      }
    }

    for (let i = 0; i < teamArr.length; i += 1) {
      arrPosition.push(new PositionedCharacter(teamArr[i], position[i]));
    }
    return arrPosition;
  }

  levelUp(ripCharacterArr, level) {
    this.position.forEach((item) => {
      // eslint-disable-next-line no-param-reassign
      item.character.level += 1;
      // eslint-disable-next-line no-param-reassign
      item.character.attack = Math.ceil(Math.max(
        item.character.attack,
        (item.character.attack * (80 + item.character.health)) / 10,
      )) / 10;
      this.defence = Math.ceil(
        Math.max(
          item.character.defence,
          (item.character.defence * (80 + item.character.health)) / 10,
        ),
      ) / 10;
      // eslint-disable-next-line no-param-reassign
      item.character.health = item.character.health + 80 > 100 ? 100 : item.character.health + 80;
    });

    const playerCharacters = {
      character: [],
    };
    if (ripCharacterArr.length > 0) {
      for (let i = 0; i < ripCharacterArr.length; i += 1) {
        const ripCharacter = ripCharacterArr[i];
        ripCharacter.character.health = 50;
        playerCharacters.character.push(ripCharacter.character);
      }
    }
    for (const item of this.position) {
      let character;
      if (item.character.type === 'bowman') {
        character = new Bowman(level - 1);
      } else if (item.character.type === 'magician') {
        character = new Magician(level - 1);
      } else {
        character = new Swordsman(level - 1);
      }
      for (const key in character) {
        if (key in item.character) {
          character[key] = item.character[key];
        }
      }
      playerCharacters.character.push(character);
    }
    if (playerCharacters.character.length < level) {
      const newCharacter = generateTeam(
        this.playerCharacters,
        1,
        level - playerCharacters.character.length,
      );
      playerCharacters.character.push(...newCharacter);
    }
    this.position = [
      ...this.positionDetermination(playerCharacters.character, 'player'),
      ...this.positionDetermination(
        generateTeam(this.computerCharacters, level, level),
        'computer',
      ),
    ];
  }

  * [Symbol.iterator]() {
    for (const personage of this.members) {
      yield personage;
    }
  }
}
