import GamePlay from './GamePlay';
import themes from './themes';
import GameState from './GameState';
import AttackComputer from './atackComputer';
import Team from './Team';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.attackComputer = new AttackComputer();
    this.stateService = stateService;
    this.gameState = new GameState();
    this.boardSize = 8;
    this.playerTeam = new Team();
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    this.playerTeam.init();
    this.gameState.positionPersonage = this.playerTeam.position;
    this.gamePlay.drawUi(this.backgroundTheme());
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoadGameClick.bind(this));
    this.addListanier();
    this.renderStistPlayer();
  }

  onLoadGameClick() {
    if (this.gameState.scores > this.gameState.bestScores) {
      this.gameState.bestScores = this.gameState.scores;
    }
    try {
      this.gameState.from(this.stateService.load());
      this.playerTeam.position = this.gameState.positionPersonage;
    } catch (e) {
      GamePlay.showError(e.message);
    }
    this.gamePlay.drawUi(this.backgroundTheme());
    this.renderStistPlayer();
  }

  addListanier() {
    this.gamePlay.addSaveGameListener(() => {
      this.stateService.save(this.gameState.to());
      // eslint-disable-next-line no-alert
      alert('Игра сохранена!');
    });
    this.gamePlay.addNewGameListener(() => {
      if (this.gameState.scores > this.gameState.bestScores) {
        this.gameState.bestScores = this.gameState.scores;
      }
      this.playerTeam.init();
      this.gameStateChange({
        levelCounter: 1,
        moveCounter: 1,
        activeCharacter: null,
        walkingDistancesActivePersonage: [],
        attackDistancesActivePersonage: [],
        arrRipCharacterPlayer: [],
        scores: 0,
        positionPersonage: this.playerTeam.position,
        gameOver: false,
      });

      this.gamePlay.drawUi(this.backgroundTheme());
      this.renderStistPlayer();
    });
  }

  backgroundTheme() {
    return themes[(this.gameState.levelCounter - 1) % themes.length];
  }

  onCellClick(index) {
    if (this.gameState.gameOver) {
      GamePlay.showError('Игра окончена');
      return;
    }
    if (this.gameState.moveCounter % 2 === 1) {
      this.characterRendring(index, 'player');
    } else if (this.gameState.moveCounter % 2 === 0) {
      this.characterRendring(index, 'computer');
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

  // onCellLeave(index) {
  //   // TODO: react to mouse leave
  // }

  addMessage(index) {
    const personageInCell = this.gameState.positionPersonage.find(
      (item) => item.position === index,
    );
    if (personageInCell) {
      const message = `🎖${personageInCell.character.level} ⚔${personageInCell.character.attack} 🛡${personageInCell.character.defence} ❤${personageInCell.character.health}`;
      this.gamePlay.showCellTooltip(message, index);
    }
  }

  async characterRendring(index, user) {
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
      this.gameState.walkingDistancesActivePersonage = this.distaceStep(
        this.gameState.activeCharacter.position,
        this.gameState.activeCharacter.character.stepRadius,
      );
      this.gameState.attackDistancesActivePersonage = this.distaceAtack(
        this.gameState.activeCharacter.position,
        this.gameState.activeCharacter.character.attackRadius,
      );
    } else if (
      this.gameState.attackDistancesActivePersonage.includes(index)
      && defending.includes(index)
    ) {
      await this.attackMacking(this.gameState.activeCharacter, index);
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
      this.gameStateChange({
        moveCounter: this.gameState.moveCounter + 1,
        walkingDistancesActivePersonage: [],
        attackDistancesActivePersonage: [],
        activeCharacter: null,
      });
      if (activeCellRed === -1) {
        this.gamePlay.deselectCell(activeCellRed);
      }
      if (user === 'player') {
        if (
          this.gameState.positionPersonage.filter((item) => ['daemon', 'undead', 'zombie'].includes(item.character.type)).length === 0
        ) {
          this.gameStateChange({
            levelCounter: this.gameState.levelCounter + 1,
          });
          if (this.gameState.levelCounter > 4) {
            if (this.gameState.scores > this.gameState.bestScores) {
              this.gameState.bestScores = this.gameState.scores;
            }
            this.gameStateChange({
              gameOver: true,
            });
            // eslint-disable-next-line no-alert
            alert('Вы победили');
            return;
          }
          this.gameStateChange({
            moveCounter: 1,
            scores: this.gameState.positionPersonage.reduce(
              (acc, item) => acc + item.character.health,
              this.gameState.scores,
            ),
          });
          this.gamePlay.drawUi(this.backgroundTheme());
          this.playerTeam.levelUp(
            this.gameState.arrRipCharacterPlayer,
            this.gameState.levelCounter,
          );
          this.gameState.positionPersonage = this.playerTeam.position;
          this.renderStistPlayer();
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
        // eslint-disable-next-line no-alert
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
      this.gameStateChange({
        moveCounter: this.gameState.moveCounter + 1,
        attackDistancesActivePersonage: [],
        walkingDistancesActivePersonage: [],
        activeCharacter: null,
      });
      if (user === 'player') {
        this.computerStep();
      }
    } else {
      this.gameStateChange({
        attackDistancesActivePersonage: [],
        walkingDistancesActivePersonage: [],
        activeCharacter: null,
      });
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

    await this.gamePlay.showDamage(index, damage);
    target.character.health -= damage;
    this.gamePlay.redrawPositions(this.gameState.positionPersonage);
  }

  computerStep() {
    for (const item of this.gameState.positionPersonage) {
      if (['daemon', 'undead', 'zombie'].includes(item.character.type)) {
        const arr1 = this.distaceAtack(item.position, item.character.attackRadius);
        item.attackCells = [...arr1];
        const arr2 = this.distaceStep(item.position, item.character.stepRadius);
        item.stepCells = [...arr2];
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

  renderStistPlayer(best = true) {
    this.gamePlay.redrawPositions(this.gameState.positionPersonage);
    this.gamePlay.info('level', this.gameState.levelCounter);
    this.gamePlay.info('score', this.gameState.scores);
    if (best) this.gamePlay.info('best', this.gameState.bestScores);
  }

  gameStateChange(obj) {
    for (const key in obj) {
      if (key in this.gameState) {
        this.gameState[key] = obj[key];
      }
    }
  }
}
