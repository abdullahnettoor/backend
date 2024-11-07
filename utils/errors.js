class GameError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'GameError';
    this.code = code;
  }
}

class ValidationError extends GameError {
  constructor(message) {
    super(message, 'VALIDATION_ERROR');
  }
}

class GameStateError extends GameError {
  constructor(message) {
    super(message, 'GAME_STATE_ERROR');
  }
}

module.exports = {
  GameError,
  ValidationError,
  GameStateError
};
