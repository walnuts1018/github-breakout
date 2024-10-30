import { GameObject } from './gameObject'
import { Rect } from './shape'

export class Block implements GameObject, Rect {
  blockElement: HTMLTableCellElement

  left: number
  right: number
  top: number
  bottom: number

  life: number
  originalColorLevel: number

  constructor(parent: HTMLTableElement, el: HTMLTableCellElement) {
    this.blockElement = el

    // calculating coordinates in SVG
    const r = el.getBoundingClientRect()
    const rr = parent.getBoundingClientRect()
    this.right = r.right - rr.left
    this.left = r.left - rr.left
    this.top = r.top - rr.top
    this.bottom = r.bottom - rr.top

    this.originalColorLevel = Number(el.getAttribute('data-level'))
    this.life = this.originalColorLevel
  }

  update(delta: number) { }

  /**
   * called when hit the ball
   */
  onCollide() {
    this.life -= 1
    this.blockElement.setAttribute('fill', 'var(--color-calendar-graph-day-bg)')
    this.blockElement.setAttribute('data-level', this.life.toString())
  }

  reset() {
    this.life = this.originalColorLevel
    this.blockElement.setAttribute('data-level', this.originalColorLevel.toString())
  }
}
