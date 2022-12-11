/**
 * Базовый класс, от которого наследуются классы персонажей
 * @property level - уровень персонажа, от 1 до 4
 * @property attack - показатель атаки
 * @property defence - показатель защиты
 * @property health - здоровье персонажа
 * @property type - строка с одним из допустимых значений:
 * swordsman
 * bowman
 * magician
 * daemon
 * undead
 * vampire
 */
export default class Character {
  constructor(level, type = 'generic') {
    this.level = level;
    this.attack = 0;
    this.defence = 0;
    this.health = 50;
    this.type = type;

    // TODO: выбросите исключение, если кто-то использует "new Character()"
    if (new.target.name === 'Character') {
      throw new Error('Создать экземляр класса невозможно');
    }
  }

  levelUp() {
    this.level += 1;
    this.attack = Math.ceil(
      Math.max(this.attack, (this.attack * (80 + this.health)) / 10),
    ) / 10;
    this.defence = Math.ceil(
      Math.max(this.defence, (this.defence * (80 + this.health)) / 10),
    ) / 10;
    this.health = this.health + 80 > 100 ? 100 : this.health + 80;
  }
}
