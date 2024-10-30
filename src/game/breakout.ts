import { Ball } from '../objects/ball'
import { Block } from '../objects/block'
import { Game } from './game'
import { Direction, intersectDirection } from '../utils/intersect'
import { Player } from '../objects/player'
import { createButton, createDivElement, createSVGElement } from '../utils/domUtils'
import { getHighScore, saveScore } from '../utils/score'

enum State {
  Ready,
  Playing,
  Done,
}

export class Breakout extends Game {
  state: State = State.Ready
  score = 0

  ball!: Ball
  blocks!: Block[]
  player!: Player

  parentElement!: HTMLDivElement
  tableElement!: HTMLTableElement
  svgElement!: SVGElement
  headerElement!: HTMLElement
  originalHeaderContent!: string
  button!: HTMLButtonElement
  footerElement!: HTMLDivElement

  constructor(parent: HTMLDivElement) {
    super()
    this.parentElement = parent;
    (async () => {
      this.initGameObject()
      await this.initUI()
      this.startGameLoop()
    })()
  }

  initGameObject() {
    this.tableElement = this.parentElement.querySelectorAll('.js-calendar-graph-table')[0] as HTMLTableElement

    this.parentElement.style.position = 'relative'
    this.svgElement = this.parentElement.appendChild(
      createSVGElement()
    ) as SVGElement

    this.ball = new Ball(this.svgElement)
    this.player = new Player(this.svgElement)
    this.blocks = [...this.tableElement.querySelectorAll('td')]
      .filter((e) => e.getAttribute('data-count') !== '0') //data-count=contributions, data-level=color level
      .map((e) => new Block(this.tableElement, e))
  }

  async initUI() {
    this.headerElement = document.querySelector<HTMLElement>(
      '.js-yearly-contributions h2'
    ) as HTMLElement
    this.originalHeaderContent = this.headerElement.textContent || ''

    const uiContainer = this.parentElement.parentElement
    if (!uiContainer) return

    const hs = await getHighScore()
    this.footerElement = uiContainer.insertBefore(
      createDivElement(
        hs > 0 ? `HighScore: ${hs}` : 'Press the arrow keys to play ←→'
      ),
      uiContainer.childNodes[3]
    )

    this.button = uiContainer.insertBefore(
      createButton(this.blocks.length > 0 ? `Play!` : '🥺', () =>
        this.onButtonClick()
      ),
      this.footerElement
    )

  }

  /**
   * game loop
   * @param delta time elapsed since the last time update was called
   */
  update(delta: number) {
    if (this.state !== State.Playing) return

    // update objects
    this.ball.update(delta)
    this.player.update(delta)
    this.blocks.forEach((b) => b.update(delta))

    // TODO reduce the computational cost
    let remainingScore = 0
    let collideFlagX = false
    let collideFlagY = false
    this.blocks
      .filter((b) => b.life > 0)
      .forEach((b) => {
        const d = intersectDirection(this.ball, b)
        // the ball hit the block
        if (d !== Direction.None) {
          b.onCollide()
          this.score += 1
          collideFlagX ||= d == Direction.X || d == Direction.XY
          collideFlagY ||= d == Direction.Y || d == Direction.XY
        }
        remainingScore += b.life
      })

    if (collideFlagX && collideFlagY) this.ball.onCollide(Direction.XY)
    else if (collideFlagX) this.ball.onCollide(Direction.X)
    else if (collideFlagY) this.ball.onCollide(Direction.Y)

    // the ball hit the bar
    this.ball.onCollide(intersectDirection(this.ball, this.player))

    // update score label
    this.headerElement.textContent = `score: ${this.score}`

    // gameover
    if (this.ball.y > 220) {
      this.state = State.Done
      this.button.textContent = 'GameOver!'
      saveScore(this.score)
    }

    // clear
    if (remainingScore === 0) {
      this.state = State.Done
      this.button.textContent = 'Clear!'
      saveScore(this.score)
    }
  }

  /**
   * footer button
   */
  onButtonClick() {
    // Can't play? Let's write the code!
    if (this.blocks.length === 0) {
      location.href = 'https://github.com/new'
      return
    }

    switch (this.state) {
      case State.Ready:
        this.state = State.Playing
        this.button.textContent = 'Reset'
        break
      case State.Playing:
        this.reset()
        break
      case State.Done:
        this.reset()
        break
    }
  }

  /**
   * Reset all status
   */
  async reset() {
    this.state = State.Ready
    let life = 0
    this.blocks.forEach((b) => {
      b.reset()
      life += b.originalColorLevel
    })
    this.player.reset()
    this.ball.reset()
    this.score = 0
    this.button.textContent = 'Play!'
    this.headerElement.textContent = this.originalHeaderContent
    this.footerElement.textContent = `HighScore: ${await getHighScore()}`
  }
}
