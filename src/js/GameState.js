export default class GameState {
  constructor() {
    this.levelCounter = 1; // счетчик ходов
    this.moveCounter = 1;
    this.activeCharacter = null;
    this.positionPersonage = null; // клетки на которых стоят персонажи
    this.walkingDistancesActivePersonage = []; // радиус ходьбы активного игрока
    this.attackDistancesActivePersonage = []; // радиус поражения активным игроком
    this.gameBoard = null; // игровое поле
    this.arrRipCharacterPlayer = [];
    this.scores = 0;
    this.gameOver = false;
  }

  from(object) {
    this.levelCounter = object.levelCounter;
    this.moveCounter = object.moveCounter;
    this.activeCharacter = object.activeCharacter;
    this.positionPersonage = object.positionPersonage;
    this.walkingDistancesActivePersonage = object.walkingDistancesActivePersonage;
    this.attackDistancesActivePersonage = object.attackDistancesActivePersonage;
    this.gameBoard = object.gameBoard;
    this.arrRipCharacterPlayer = object.arrRipCharacterPlayer;
    this.scores = object.scores;
    this.gameOver = object.gameOver;

    return null;
  }

  to() {
    return {
      levelCounter: this.levelCounter,
      moveCounter: this.moveCounter,
      activeCharacter: this.activeCharacter,
      positionPersonage: this.positionPersonage,
      walkingDistancesActivePersonage: this.walkingDistancesActivePersonage,
      attackDistancesActivePersonage: this.attackDistancesActivePersonage,
      gameBoard: this.gameBoard,
      arrRipCharacterPlayer: this.arrRipCharacterPlayer,
      scores: this.scores,
      gameOver: this.gameOver,
    };
  }

  set bestScores(scores) {
    // eslint-disable-next-line no-underscore-dangle
    if (scores > this._bestScores || !this._bestScores) {
      // eslint-disable-next-line no-underscore-dangle
      this._bestScores = scores;
    }
  }

  get bestScores() {
    // eslint-disable-next-line no-underscore-dangle
    if (!this._bestScores) {
      return 0;
    }
    // eslint-disable-next-line no-underscore-dangle
    return this._bestScores;
  }
}
