import Character from '../Character';

export default class Daemon extends Character {
  constructor(level) {
    super(level, 'daemon');
    this.attack = 10;
    this.defence = 40;
    this.attackRadius = 4;
    this.stepRadius = 1;
  }
}
