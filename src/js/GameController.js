import GamePlay from './GamePlay';
import Bowman from './characters/Bowman';
import Daemon from './characters/Daemon';
import Magician from './characters/Magician';
import Swordsman from './characters/Swordsman';
import Undead from './characters/Undead';
import Zombie from './characters/Zombie';
import themes from './themes';
import PositionedCharacter from './PositionedCharacter';
import { generateTeam } from './generators';
import GameState from './GameState';
import AttackComputer from './atackComputer';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.attackComputer = new AttackComputer();
    this.stateService = stateService;
    this.gameState = new GameState();
    this.boardSize = 8;
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService

    this.gamePlay.drawUi(this.backgroundTheme());
    this.gamePlay.redrawPositions(this.drawPlayers());
    this.reflectionInformationPersonage();
    this.personageChoise();
    this.addListanier();
    this.gamePlay.info('level', this.gameState.levelCounter);
    this.gamePlay.info('score', this.gameState.scores);
    this.gamePlay.info('best', this.gameState.bestScores);
  }

  onLoadGameClick() {
    if (this.gameState.scores > this.gameState.bestScores) {
      this.gameState.bestScores = this.gameState.scores;
    }
    try {
      this.gameState.from(this.stateService.load());
    } catch (e) {
      GamePlay.showError(e.message);
    }
    this.gamePlay.drawUi(this.backgroundTheme());
    this.gamePlay.redrawPositions(this.gameState.positionPersonage);
    this.gamePlay.info('level', this.gameState.levelCounter);
    this.gamePlay.info('score', this.gameState.scores);
    this.gamePlay.info('best', this.gameState.bestScores);
  }

  addListanier() {
    this.gamePlay.addSaveGameListener(() => {
      this.stateService.save(this.gameState.to());
      alert('Игра сохранена!');
    });

    this.gamePlay.addLoadGameListener(this.onLoadGameClick.bind(this));

    this.gamePlay.addNewGameListener(() => {
      if (this.gameState.scores > this.gameState.bestScores) {
        this.gameState.bestScores = this.gameState.scores;
      }
      this.gameState.levelCounter = 1;
      this.gameState.moveCounter = 1;
      this.gameState.activeCharacter = null;
      this.gameState.positionPersonage = null;
      this.gameState.walkingDistancesActivePersonage = [];
      this.gameState.attackDistancesActivePersonage = [];
      this.gameState.arrRipCharacterPlayer = [];
      this.gameState.scores = 0;

      this.gamePlay.drawUi(this.backgroundTheme());
      this.gamePlay.redrawPositions(this.drawPlayers());

      this.gamePlay.info('level', this.gameState.levelCounter);
      this.gamePlay.info('score', this.gameState.scores);
      this.gamePlay.info('best', this.gameState.bestScores);
    });
  }

  backgroundTheme() {
    return themes[(this.gameState.levelCounter - 1) % themes.length];
  }

  reflectionInformationPersonage() {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
  }

  personageChoise() {
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  onCellClick(index) {
    if (this.gameState.gameOver) {
      GamePlay.showError('Игра окончена');
      return;
    }
    if (this.gameState.moveCounter % 2 === 1) {
      this.personageVerification(index);
    }
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
    if (this.gameState.gameOver) {
      this.gamePlay.setCursor('not-allowed');
      return;
    }
    this.addMessage(index);
    if (this.gameState.moveCounter % 2 === 1) {
      this.characterActions(index);
    }
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
  }

  drawPlayers() {
    this.playerCharacters = generateTeam([Bowman, Magician, Swordsman], 1, 2);
    this.computerCharacters = generateTeam([Daemon, Undead, Zombie], 1, 2);

    this.gameState.positionPersonage = [
      ...this.positionDetermination(this.playerCharacters, 'player'),
      ...this.positionDetermination(this.computerCharacters, 'computer'),
    ];
    console.log(this.gameState.positionPersonage);
    return this.gameState.positionPersonage;
  }

  positionDetermination(teamArr, player) {
    let positionOnBoard;
    const arrPosition = [];
    const position = [];
    this.gameState.gameBoard = new Array(this.boardSize * this.boardSize);

    for (let i = 0; i < this.gameState.gameBoard.length; i += 1) {
      this.gameState.gameBoard[i] = i;
    }

    if (player === 'player') {
      positionOnBoard = this.gameState.gameBoard.filter(
        (item) => item % this.boardSize < 2,
      );
    } else {
      positionOnBoard = this.gameState.gameBoard.filter(
        (item) => item % this.boardSize >= this.boardSize - 2,
      );
    }
    while (position.length < teamArr.character.length) {
      const cell = positionOnBoard[[Math.trunc(Math.random() * positionOnBoard.length)]];
      if (!position.includes(cell)) {
        position.push(cell);
      }
    }
    debugger;
    for (let i = 0; i < teamArr.character.length; i += 1) {
      arrPosition.push(
        new PositionedCharacter(teamArr.character[i], position[i]),
      );
    }
    return arrPosition;
  }

  addMessage(index) {
    const personageInCell = this.gameState.positionPersonage.find(
      (item) => item.position === index,
    );
    if (personageInCell) {
      const message = `🎖${personageInCell.character.level} ⚔${personageInCell.character.attack} 🛡${personageInCell.character.defence} ❤${personageInCell.character.health}`;
      this.gamePlay.showCellTooltip(message, index);
    }
  }

  // проверка наличия персонажа и определение хода команды
  personageVerification(index) {
    // проверка персонажа в выбранной клетке
    if (this.gameState.moveCounter % 2 === 1) {
      this.characterRendring(index, 'player');
    } else if (this.gameState.moveCounter % 2 === 0) {
      this.characterRendring(index, 'computer');
    }
  }

  characterRendring(index, user) {
    const activeCellYellow = [...this.gamePlay.cells].findIndex((items) => items.classList.contains('selected-yellow'));
    const activeCellGreen = [...this.gamePlay.cells].findIndex((items) => items.classList.contains('selected-green'));
    const activeCellRed = [...this.gamePlay.cells].findIndex((items) => items.classList.contains('selected-red'));
    let defending;
    let personageActive;
    if (user === 'player') {
      personageActive = this.checkCell(
        index,
        'magician',
        'swordsman',
        'bowman',
      );
      defending = this.positionComputer;
    } else if (user === 'computer') {
      personageActive = this.checkCell(index, 'daemon', 'undead', 'zombie');
      defending = this.positionPlayer;
    }
    if (personageActive) {
      this.gameState.activeCharacter = personageActive;

      this.gamePlay.selectCell(index);
      this.gameState.walkingDistancesActivePersonage = this.displacement(
        this.gameState.activeCharacter.character.type,
        this.gameState.activeCharacter.position,
      );
      this.gameState.attackDistancesActivePersonage = this.attackDistance(
        this.gameState.activeCharacter.character.type,
        this.gameState.activeCharacter.position,
      );
    } else if (
      this.gameState.attackDistancesActivePersonage.includes(index)
      && defending.includes(index)
    ) {
      this.attackMacking(this.gameState.activeCharacter, index);
      if (
        this.gameState.positionPersonage.find(
          (item) => item.character.health <= 0,
        )
      ) {
        const positionInArr = this.gameState.positionPersonage.findIndex(
          (item) => item.character.health <= 0,
        );
        const pers = this.gameState.positionPersonage.splice(positionInArr, 1);
        this.gamePlay.redrawPositions(this.gameState.positionPersonage);
        if (
          ['magician', 'bowman', 'swordsman'].includes(pers[0].character.type)
        ) {
          this.gameState.arrRipCharacterPlayer.push(pers[0]);
        }
      }
      this.gameState.moveCounter += 1;
      this.gameState.attackDistancesActivePersonage = [];
      this.gameState.walkingDistancesActivePersonage = [];
      this.gameState.activeCharacter = null;
      if (activeCellRed === -1) {
        this.gamePlay.deselectCell(activeCellRed);
      }
      if (user === 'player') {
        if (
          this.gameState.positionPersonage.filter((item) => ['daemon', 'undead', 'zombie'].includes(item.character.type)).length === 0
        ) {
          this.gameState.levelCounter += 1;
          if (this.gameState.levelCounter > 4) {
            if (this.gameState.scores > this.gameState.bestScores) {
              this.gameState.bestScores = this.gameState.scores;
            }
            this.gameState.gameOver = true;
            return;
          }
          this.levelUp();
        } else {
          this.computerStep();
        }
      }
      if (
        this.gameState.positionPersonage.filter((item) => ['magician', 'bowman', 'swordsman'].includes(item.character.type)).length === 0
      ) {
        if (activeCellGreen !== -1) {
          this.gamePlay.deselectCell(activeCellGreen);
        }
        if (activeCellYellow !== 1) {
          this.gamePlay.deselectCell(activeCellYellow);
        }
        if (activeCellRed !== 1) {
          this.gamePlay.deselectCell(activeCellRed);
        }
        this.gameState.gameOver = true;
        alert('Вы проиграли');
        return;
      }
    } else if (
      this.gameState.walkingDistancesActivePersonage.includes(index)
      && !defending.includes(index)
    ) {
      this.gameState.activeCharacter.position = index;
      this.gamePlay.redrawPositions(this.gameState.positionPersonage);
      if (activeCellGreen !== -1) {
        this.gamePlay.deselectCell(activeCellGreen);
      }
      if (activeCellYellow !== 1) {
        this.gamePlay.deselectCell(activeCellYellow);
      }
      this.gameState.moveCounter += 1;
      this.gameState.attackDistancesActivePersonage = [];
      this.gameState.walkingDistancesActivePersonage = [];
      this.gameState.activeCharacter = null;
      if (user === 'player') {
        this.computerStep();
      }
    } else {
      this.gameState.attackDistancesActivePersonage = [];
      this.gameState.walkingDistancesActivePersonage = [];
      this.gameState.activeCharacter = null;
      GamePlay.showError('Выбор недоступен');
    }
    if (activeCellYellow !== -1) {
      this.gamePlay.deselectCell(activeCellYellow);
    }
  }

  // отрисовка индикаторов на поле при наведении
  characterActions(index) {
    const cellGreen = [...this.gamePlay.cells].findIndex((items) => items.classList.contains('selected-green'));
    const cellRed = [...this.gamePlay.cells].findIndex((items) => items.classList.contains('selected-red'));
    const activeCell = [...this.gamePlay.cells].findIndex((items) => items.classList.contains('selected-yellow'));
    if (cellGreen !== -1) {
      this.gamePlay.deselectCell(cellGreen, 'green');
    }
    if (cellRed !== -1) {
      this.gamePlay.deselectCell(cellRed, 'red');
    }
    this.gamePlay.setCursor('auto');

    this.positionPlayer = this.gameState.positionPersonage
      .filter((item) => ['magician', 'bowman', 'swordsman'].includes(item.character.type))
      .map((item) => item.position);
    this.positionComputer = this.gameState.positionPersonage
      .filter((item) => ['daemon', 'undead', 'zombie'].includes(item.character.type))
      .map((item) => item.position);
    if (activeCell !== -1) {
      if (this.gameState.moveCounter % 2 === 1) {
        if (this.positionPlayer.includes(index)) {
          this.gamePlay.setCursor('pointer');
        } else if (
          this.gameState.attackDistancesActivePersonage.includes(index)
          && this.positionComputer.includes(index)
        ) {
          this.gamePlay.setCursor('crosshair');
          this.gamePlay.selectCell(index, 'red');
        } else if (
          this.gameState.walkingDistancesActivePersonage.includes(index)
          && !this.positionComputer.includes(index)
        ) {
          this.gamePlay.setCursor('pointer');
          this.gamePlay.selectCell(index, 'green');
        } else if (
          (this.gameState.walkingDistancesActivePersonage.includes(index)
            && this.positionComputer.includes(index))
          || !this.gameState.walkingDistancesActivePersonage.includes(index)
          || !this.gameState.attackDistancesActivePersonage.includes(index)
        ) {
          this.gamePlay.setCursor('not-allowed');
        }
      } else if (this.gameState.moveCounter % 2 === 0) {
        this.gamePlay.setCursor('not-allowed');
        if (
          this.gameState.attackDistancesActivePersonage.includes(index)
          && this.positionPlayer.includes(index)
        ) {
          this.gamePlay.selectCell(index, 'red');
        }
        if (
          this.gameState.walkingDistancesActivePersonage.includes(index)
          && !this.positionPlayer.includes(index)
        ) {
          this.gamePlay.setCursor('not-allowed');
          this.gamePlay.selectCell(index, 'green');
        }
      }
    }
  }

  // определение дистанции хода
  displacement(type, index) {
    switch (true) {
      case ['bowman', 'zombie'].includes(type):
        return this.distaceStep(index, 2);
      case ['magician', 'daemon'].includes(type):
        return this.distaceStep(index, 1);
      default:
        return this.distaceStep(index, 4);
    }
  }

  // определение дистанции атаки
  attackDistance(type, index) {
    switch (true) {
      case ['bowman', 'zombie'].includes(type):
        return this.distaceAtack(index, 2);
      case ['magician', 'daemon'].includes(type):
        return this.distaceAtack(index, 4);
      default:
        return this.distaceAtack(index, 1);
    }
  }

  // вычисление дистанции
  distaceAtack(index, dist) {
    const arrDistance = [];
    const horizontalTop = Math.floor(index / this.boardSize) - dist < 0
      ? 0
      : Math.floor(index / this.boardSize) - dist;
    const horizontalBottom = Math.floor(index / this.boardSize) + dist > this.boardSize - 1
      ? this.boardSize - 1
      : Math.floor(index / this.boardSize) + dist;
    const verticalLeft = (index % this.boardSize) - dist <= 0
      ? 0
      : (index % this.boardSize) - dist; // 0
    const verticalRight = (index % this.boardSize) + dist >= this.boardSize
      ? this.boardSize - 1
      : (index % this.boardSize) + dist; // 2

    for (let i = horizontalTop; i < horizontalBottom + 1; i += 1) {
      for (let j = verticalLeft; j < verticalRight + 1; j += 1) {
        if (verticalLeft < j < verticalRight + 1) {
          arrDistance.push(i * 8 + j);
        }
      }
    }
    arrDistance.filter((item) => item !== index);
    return arrDistance;
  }

  distaceStep(index, dist) {
    // const boardSize = 8;
    const stepsArray = [index];
    const positionLine = index % this.boardSize;

    // moving around within the board, chosing only horizontals, verticals and diagonals
    for (let i = 1; i <= dist; i += 1) {
      const top = index - this.boardSize * i;
      const topRight = index - this.boardSize * i + i;
      const right = index + 1 * i;
      const bottomRight = index + this.boardSize * i + i;
      const bottom = index + this.boardSize * i;
      const bottomLeft = index + this.boardSize * i - i;
      const left = index - 1 * i;
      const topLeft = index - this.boardSize * i - i;

      // comparison '>= 0' mean top left corner
      // comparison 'boardSize ** 2' mean bottom right corner
      if (top >= 0) {
        stepsArray.push(top);
      }
      if (topRight % this.boardSize > positionLine && topRight >= 0) {
        stepsArray.push(topRight);
      }
      if (right % this.boardSize > positionLine && left < this.boardSize ** 2) {
        stepsArray.push(right);
      }
      if (
        bottomRight % this.boardSize > positionLine
        && bottomRight < this.boardSize ** 2
      ) {
        stepsArray.push(bottomRight);
      }
      if (bottom < this.boardSize ** 2) {
        stepsArray.push(bottom);
      }
      if (
        bottomLeft % this.boardSize < positionLine
        && bottomLeft < this.boardSize ** 2
      ) {
        stepsArray.push(bottomLeft);
      }
      if (left % this.boardSize < positionLine && left >= 0) {
        stepsArray.push(left);
      }
      if (topLeft % this.boardSize < positionLine && topLeft >= 0) {
        stepsArray.push(topLeft);
      }
    }

    return stepsArray;
  }

  // проверка персонажа на клетке
  checkCell(index, ...args) {
    const personageActive = this.gameState.positionPersonage.find(
      (item) => args.includes(item.character.type) && item.position === index,
    );
    return personageActive;
  }

  async attackMacking(attacker, index) {
    const indexTarget = this.gameState.positionPersonage.findIndex(
      (item) => item.position === index,
    );
    const target = this.gameState.positionPersonage[indexTarget];

    const damage = Math.ceil(
      Math.max(
        attacker.character.attack - target.character.defence,
        attacker.character.attack,
      ) / 10,
    );

    target.character.health -= damage;

    await this.gamePlay.showDamage(index, damage);
    this.gamePlay.redrawPositions(this.gameState.positionPersonage);
  }

  computerStep() {
    for (const item of this.gameState.positionPersonage) {
      if (['daemon', 'undead', 'zombie'].includes(item.character.type)) {
        const arr1 = this.attackDistance(item.character.type, item.position);
        item.attackCells = [...arr1];
        const arr2 = this.displacement(item.character.type, item.position);
        item.stepCells = [...arr2];
        switch (true) {
          case 'zombie'.includes(item.character.type):
            item.character.attackRadius = 2;
            item.character.stepRadius = 2;
            break;
          case 'daemon'.includes(item.character.type):
            item.character.attackRadius = 4;
            item.character.stepRadius = 1;
            break;
          default:
            item.character.attackRadius = 1;
            item.character.stepRadius = 4;
            break;
        }
      }
    }

    const positionPlayer = [];

    for (const item of this.gameState.positionPersonage) {
      if (['magician', 'bowman', 'swordsman'].includes(item.character.type)) {
        positionPlayer.push(item);
      }
    }

    this.attackComputer.positioned = this.gameState.positionPersonage.filter(
      (item) => ['daemon', 'undead', 'zombie'].includes(item.character.type),
    );

    if (this.attackComputer.attack(positionPlayer)) {
      const attacker = this.attackComputer.attack(positionPlayer);
      this.characterActions(attacker.index);
      this.characterRendring(attacker.index, 'computer');
      this.characterActions(attacker.attackIndex);
      this.characterRendring(attacker.attackIndex, 'computer');
    } else {
      this.attackComputer.step(positionPlayer);
      this.gamePlay.redrawPositions([
        ...this.attackComputer.positioned,
        ...positionPlayer,
      ]);
      this.gameState.moveCounter += 1;
    }
  }

  levelUp() {
    debugger;
    this.gameState.moveCounter = 1;
    this.gameState.scores = this.gameState.positionPersonage.reduce(
      (acc, item) => acc + item.character.health,
      this.gameState.scores,
    );
    this.gameState.positionPersonage.forEach((item) => {
      item.character.level += 1;
      item.character.attack = Math.ceil(
        Math.max(
          item.character.attack,
          (item.character.attack * (80 + item.character.health)) / 10,
        ),
      ) / 10;
      this.defence = Math.ceil(
        Math.max(
          item.character.defence,
          (item.character.defence * (80 + item.character.health)) / 10,
        ),
      ) / 10;
      item.character.health = item.character.health + 80 > 100 ? 100 : item.character.health + 80;
    });

    this.gamePlay.drawUi(this.backgroundTheme());
    const playerCharacters = {
      character: [],
    };
    if (this.gameState.arrRipCharacterPlayer.length > 0) {
      for (let i = 0; i < this.gameState.arrRipCharacterPlayer.length; i += 1) {
        this.gameState.arrRipCharacterPlayer[i].character.health = 50;
        const ripCharacter = this.gameState.arrRipCharacterPlayer[i];
        playerCharacters.character.push(ripCharacter.character);
      }
    }
    for (const item of this.gameState.positionPersonage) {
      playerCharacters.character.push(item.character);
    }

    if (playerCharacters.character.length < this.gameState.levelCounter) {
      const newCharacter = generateTeam(
        [Bowman, Magician, Swordsman],
        1,
        this.gameState.levelCounter - playerCharacters.character.length,
      );
      playerCharacters.character.push(...newCharacter.character);
    }
    this.gameState.positionPersonage = [
      ...this.positionDetermination(playerCharacters, 'player'),
      ...this.positionDetermination(
        generateTeam(
          [Daemon, Undead, Zombie],
          this.gameState.levelCounter,
          this.gameState.levelCounter,
        ),
        'computer',
      ),
    ];
    this.gamePlay.redrawPositions(this.gameState.positionPersonage);
    this.gamePlay.info('level', this.gameState.levelCounter);
    this.gamePlay.info('score', this.gameState.scores);
  }
}
