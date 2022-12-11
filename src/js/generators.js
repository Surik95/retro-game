// import Magician from './characters/Magician';
// import Bowman from './characters/Bowman';
// import Swordsman from './characters/Swordsman';
import Team from './Team';
/**
 * Формирует экземпляр персонажа из массива allowedTypes со
 * случайным уровнем от 1 до maxLevel
 *
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @returns генератор, который при каждом вызове
 * возвращает новый экземпляр класса персонажа
 *
 */
export function* characterGenerator(allowedTypes, maxLevel) {
  // TODO: write logic here
  while (true) {
    yield new allowedTypes[Math.trunc(Math.random() * allowedTypes.length)](
      Math.ceil(Math.random() * maxLevel),
    );
  }
}

/**
 * Формирует массив персонажей на основе characterGenerator
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @param characterCount количество персонажей, которое нужно сформировать
 * @returns экземпляр Team, хранящий экземпляры персонажей. Количество персонажей
 * в команде - characterCount
 * */
export function generateTeam(allowedTypes, maxLevel, characterCount) {
  // TODO: write logic here

  const arrPlayer = [];
  // eslint-disable-next-line default-case
  // for (const item allowedTypes) {

  // }

  // switch (allowedTypes) {
  //   case 'magician':
  //     Magician;
  //     break;
  //   case 'swordsman':
  //     Swordsman;
  //     break;
  //   case 'bowman':
  //     Bowman;
  //     break;
  // }
  const playerGenerator = characterGenerator(allowedTypes, maxLevel);

  for (let i = 0; i < characterCount; i += 1) {
    arrPlayer.push(playerGenerator.next().value);
  }
  return new Team(arrPlayer);
}
