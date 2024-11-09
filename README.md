# TicTacToe CLI Backend

Backend and landing page for a developer-friendly TicTacToe game that runs in your terminal. Take a break from coding and enjoy a quick game without leaving your development environment! ⌨️

## Features

- Real-time multiplayer using WebSocket
- Rate limiting for connection security
- Username validation
- Game session management
- Automatic opponent matching
- Timeout handling for inactive games
- Development and production configurations
- Error logging with Winston

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/abdullahnettoor/tictactoe-backend.git
cd tictactoe-backend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the landing page.

## Environment Variables

- `NODE_ENV`: Set to 'production' for production environment
- `PORT`: Server port (default: 3000)
- `HOST`: Server hostname (default: localhost)

## API Documentation

### WebSocket Endpoints

- `/ws`: Main WebSocket endpoint for game communication

### Message Types

- `register`: Register new user
- `findGame`: Find opponent for game
- `move`: Make a move in the game
- `gameStart`: Game start notification
- `searching`: Searching for opponent
- `userCount`: Online players count update

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Abdullah Nettoor**
- GitHub: [@abdullahnettoor](https://github.com/abdullahnettoor)
- Email: abdullahnettoor@gmail.com

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.


