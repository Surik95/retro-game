import GameController from '../GameController';
import GamePlay from '../GamePlay';

test.each([
  ['bowman', 17, 25],
  ['swordsman', 28, 9],
  ['magician', 9, 64],
  ['undead', 28, 9],
  ['zombie', 17, 25],
  ['daemon', 9, 64],
])(
  'Проверка дистанции передвижения и атаки %s',
  (personage, movement, attack) => {
    const gctrl = new GameController(new GamePlay());
    const resultMovement = gctrl.displacement(personage, 28);
    const resultAttack = gctrl.attackDistance(personage, 28);

    expect(resultMovement.length).toBe(movement);
    expect(resultAttack.length).toBe(attack);
  },
);
