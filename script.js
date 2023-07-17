class Box {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
  
    getTopBox() {
      if (this.y === 0) return null;
      return new Box(this.x, this.y - 1);
    }
  
    getRightBox() {
      if (this.x === 3) return null;
      return new Box(this.x + 1, this.y);
    }
  
    getBottomBox() {
      if (this.y === 3) return null;
      return new Box(this.x, this.y + 1);
    }
  
    getLeftBox() {
      if (this.x === 0) return null;
      return new Box(this.x - 1, this.y);
    }
  
    getNextdoorBoxes() {
      return [
        this.getTopBox(),
        this.getRightBox(),
        this.getBottomBox(),
        this.getLeftBox()
      ].filter((box) => box !== null);
    }
  
    getRandomNextdoorBox() {
      const nextdoorBoxes = this.getNextdoorBoxes();
      return nextdoorBoxes[Math.floor(Math.random() * nextdoorBoxes.length)];
    }
  }
  
  const swapBoxes = (grid, box1, box2) => {
    const temp = grid[box1.y][box1.x];
    grid[box1.y][box1.x] = grid[box2.y][box2.x];
    grid[box2.y][box2.x] = temp;
  };
  
  const isSolved = (grid) => {
    const size = grid.length;
    let count = 1;
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (i === size - 1 && j === size - 1) {
          if (grid[i][j] !== 0) return false;
        } else {
          if (grid[i][j] !== count) return false;
          count++;
        }
      }
    }
    return true;
  };
  
  const getRandomGrid = (size) => {
    let grid = [];
    for (let i = 0; i < size; i++) {
      grid.push([]);
      for (let j = 0; j < size; j++) {
        grid[i].push(i * size + j + 1);
      }
    }
    grid[size - 1][size - 1] = 0;
  
    // Shuffle
    let blankBox = new Box(size - 1, size - 1);
    for (let i = 0; i < 1000; i++) {
      const randomNextdoorBox = blankBox.getRandomNextdoorBox();
      swapBoxes(grid, blankBox, randomNextdoorBox);
      blankBox = randomNextdoorBox;
    }
  
    if (isSolved(grid)) return getRandomGrid(size);
    return grid;
  };
  
  class State {
    constructor(grid, move, time, status, size) {
      this.grid = grid;
      this.move = move;
      this.time = time;
      this.status = status;
      this.size = size;
    }
  
    static ready(size) {
      return new State(
        Array.from({ length: size }, () => Array.from({ length: size }, () => 0)),
        0,
        0,
        "ready",
        size
      );
    }
  
    static start(size) {
      return new State(getRandomGrid(size), 0, 0, "playing", size);
    }
  }
  
  class Game {
    constructor(state) {
      this.state = state;
      this.tickId = null;
      this.tick = this.tick.bind(this);
      this.render();
      this.handleClickBox = this.handleClickBox.bind(this);
    }
  
    static ready(size) {
      return new Game(State.ready(size));
    }
  
    tick() {
      this.setState({ time: this.state.time + 1 });
    }
  
    setState(newState) {
      this.state = { ...this.state, ...newState };
      this.render();
    }
  
    handleClickBox(box) {
      return function () {
        const nextdoorBoxes = box.getNextdoorBoxes();
        const blankBox = nextdoorBoxes.find(
          (nextdoorBox) => this.state.grid[nextdoorBox.y][nextdoorBox.x] === 0
        );
        if (blankBox) {
          const newGrid = [...this.state.grid];
          swapBoxes(newGrid, box, blankBox);
          if (isSolved(newGrid)) {
            clearInterval(this.tickId);
            this.setState({
              status: "won",
              grid: newGrid,
              move: this.state.move + 1
            });
          } else {
            this.setState({
              grid: newGrid,
              move: this.state.move + 1
            });
          }
        }
      }.bind(this);
    }
  
    render() {
      const { grid, move, time, status, size } = this.state;
  
      // Render grid
      const gridContainer = document.querySelector(".grid");
      gridContainer.innerHTML = "";
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          const button = document.createElement("button");
  
          if (status === "playing") {
            button.addEventListener("click", this.handleClickBox(new Box(j, i)));
          }
  
          button.textContent = grid[i][j] === 0 ? "" : grid[i][j].toString();
          gridContainer.appendChild(button);
        }
      }
  
      // Render button
      const newButton = document.createElement("button");
      if (status === "ready") newButton.textContent = "Start";
      if (status === "playing") newButton.textContent = "New Game";
      if (status === "won") newButton.textContent = "Play";
      newButton.addEventListener("click", () => {
        clearInterval(this.tickId);
        this.tickId = setInterval(this.tick, 1000);
        this.setState(State.start(size));
      });
      document.querySelector(".footer button").replaceWith(newButton);
  
      // Render move
      document.getElementById("move").textContent = `Move: ${move}`;
  
      // Render time
      document.getElementById("time").textContent = `Time: ${time}`;
  
      // Render message
      if (status === "won") {
        document.querySelector(".message").textContent =
          "Congratulations! You win!";
      } else {
        document.querySelector(".message").textContent = "";
      }
    }
  }
  const sizeButtons = document.querySelectorAll(".size-button");
  sizeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const size = parseInt(button.dataset.size);
      clearInterval(this.tickId);
      this.tickId = setInterval(this.tick, 1000);
      this.setState(State.start(size));
    });
  });
  
  const GAME = Game.ready(4); 
  