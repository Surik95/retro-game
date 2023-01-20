import Character from '../Character';

export default class Zombie extends Character {
  constructor(level) {
    super(level, 'zombie');
    this.attack = 25;
    this.defence = 25;
    this.attackRadius = 2;
    this.stepRadius = 2;
  }
}
