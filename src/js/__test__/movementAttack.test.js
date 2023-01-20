import Bowman from '../characters/Bowman';
import Magician from '../characters/Magician';
import Swordsman from '../characters/Swordsman';
import Zombie from '../characters/Zombie';
import Undead from '../characters/Undead';
import Daemon from '../characters/Daemon';
import GameController from '../GameController';
import GamePlay from '../GamePlay';

test.each([
  [new Bowman(1), 17, 25],
  [new Swordsman(1), 28, 9],
  [new Magician(1), 9, 64],
  [new Undead(1), 28, 9],
  [new Zombie(1), 17, 25],
  [new Daemon(1), 9, 64],
])(
  'Проверка дистанции передвижения и атаки',
  (personage, movement, attack) => {
    const gctrl = new GameController(new GamePlay());
    const resultMovement = gctrl.distaceStep(28, personage.stepRadius);
    const resultAttack = gctrl.distaceAtack(28, personage.attackRadius);

    expect(resultMovement.length).toBe(movement);
    expect(resultAttack.length).toBe(attack);
  },
);
