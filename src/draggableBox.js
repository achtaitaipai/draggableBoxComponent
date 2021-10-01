/*
TODO : 
    ajouter gestion des z-index https://www.willmaster.com/blog/javascript/z-index-range.php
    ajouter des evenements au drag et au dédrag

*/
export default class DraggableBox extends HTMLDivElement {
  constructor() {
    super()
    this.container =
      document.querySelector(this.getAttribute('container')) || document.body
    this.handle = this.querySelector(this.getAttribute('handle')) || this
    this.handle.style.userSelect = 'none'
    this.x = 0
    this.y = 0
    this.dx = 0
    this.dy = 0
    this.translateX = 0
    this.translateY = 0
    const shadow = this.attachShadow({ mode: 'open' })
    shadow.innerHTML = /* html */ `
          <style> 
          :host{
            position : relative;
          }
          </style>
          <slot name="content"></slot>
      `
  }

  connectedCallback() {
    this.onDragStart = this.onDragStart.bind(this)
    this.handle.addEventListener('touchstart', this.onDragStart, {
      passive: false,
    })
    this.handle.addEventListener('mousedown', this.onDragStart, {
      passive: false,
    })
  }

  onDragStart(e) {
    this.style.zIndex = this.findMaxZindex() + 1
    console.log('~ this.style.zIndex', this.style.zIndex)

    this.onDrag = this.onDrag.bind(this)
    document.addEventListener('touchmove', this.onDrag, { passive: false })
    document.addEventListener('mousemove', this.onDrag, { passive: false })
    this.onDragEnd = this.onDragEnd.bind(this)
    document.addEventListener('touchend', this.onDragEnd, { passive: false })
    document.addEventListener('mouseup', this.onDragEnd, { passive: false })
    const screenX = e.clientX || e.touches[0].pageX || this.x
    const screenY = e.clientY || e.touches[0].pageY || this.y
    this.x = screenX
    this.y = screenY
    e.preventDefault()
  }

  findMaxZindex() {
    let max = 0
    const box = this.container.querySelectorAll('div[is="draggable-box"]')
    box.forEach((b) => {
      max = Math.max(max, parseInt(b.style.zIndex) || 0)
    })
    return max
  }

  onDrag(e) {
    // const screenX = e.clientX || e.touches[0].pageX || this.x
    const screenX = e.clientX || (e.touches ? e.touches[0].pageX : this.x)
    const screenY = e.clientY || (e.touches ? e.touches[0].pageY : this.y)
    this.dx = this.x - screenX
    this.dy = this.y - screenY
    this.collide()
    this.x = screenX
    this.y = screenY
    this.translateX -= this.dx
    this.translateY -= this.dy
    this.style.transform = `translate(${this.translateX}px,${this.translateY}px)`
    e.preventDefault()
  }

  onDragEnd(e) {
    document.removeEventListener('touchmove', this.onDrag)
    document.removeEventListener('mousemove', this.onDrag)
    document.removeEventListener('touchend', this.onDragEnd)
    document.removeEventListener('mouseup', this.onDragEnd)
    e.preventDefault()
  }

  disconnectedCallback() {
    this.handle.removeEventListener('touchstart', this.onDragStart)
    this.handle.removeEventListener('mousedown', this.onDragStart)
    document.removeEventListener('touchmove', this.onDrag)
    document.removeEventListener('mousemove', this.onDrag)
    document.removeEventListener('touchend', this.onDragEnd)
    document.removeEventListener('mouseup', this.onDragEnd)
  }

  collide() {
    if (
      this.getBoundingClientRect().right - this.dx >=
      this.container.getBoundingClientRect().right
    )
      this.dx = 0
    if (
      this.getBoundingClientRect().top - this.dy <=
      this.container.getBoundingClientRect().top
    )
      this.dy = 0
    if (
      this.getBoundingClientRect().left - this.dx <=
      this.container.getBoundingClientRect().left
    )
      this.dx = 0
    if (
      this.getBoundingClientRect().bottom - this.dy >=
      this.container.getBoundingClientRect().bottom
    )
      this.dy = 0
  }
}
