// fun utilities

/* instanbul ignore next */
const ESC = '\u001b['
/* instanbul ignore next */
const cursorLeft = ESC + '1000D'
/* instanbul ignore next */
const eraseEndLine = ESC + 'K'

/* instanbul ignore next */
function cursorUp (count) {
  return ESC + (typeof count === 'number' ? count : 1) + 'A'
}

/* istanbul ignore next */
export function eraseLines (count) {
  let clear = ''

  for (let i = 0; i < count; i++) {
    clear += cursorLeft + eraseEndLine + (i < count - 1 ? cursorUp() : '')
  }

  return clear
}

const frames = process.platform === 'win32'
  ? ['-', '\\', '|', '/']
  : ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

let i = -1
export function frame () {
  return frames[++i % frames.length]
}

const color = n => str => '\u001b[' + n + 'm' + str + '\u001b[' + 39 + 'm'

export const yellow = color(33)
export const green = color(32)
export const red = color(31)
export const grey = color(90)
export const white = color(37)

export const arrowRight = process.platform === 'win32' ? '➔' : '⤷'
export const cross = process.platform === 'win32' ? '×' : '✖'
export const check = process.platform === 'wind32' ? '√' : '✔'

export function isValueObject (x) {
  return x && typeof x === 'object' && x.value
}
