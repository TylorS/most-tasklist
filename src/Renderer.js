import { EOL } from 'os'
import { List } from './List'
import { frame, white, arrowRight, grey, yellow,
         green, check, red, cross, eraseLines } from './util'

export class Renderer {
  constructor (end, error, disposable, list) {
    this._end = end
    this._error = error
    this._disposable = disposable
    this._list = list
    this._item = 0
    this.active = true
    this._previousLines = 0

    console.log(white('\n> ' + getTitle(list)))

    this._id = setInterval(() => {
      this.logUpdate(this.render())
    }, 100)

    hideCursor()
  }

  event (t, { type, value }) {
    this.clear()

    if (type === 'update') {
      this._id = setInterval(() => {
        this.logUpdate(this.render(value))
      }, 100)
    }

    if (type === 'end') {
      this._item = this._item + 1
    }
  }

  error (t, e) {
    if (!this.active) return
    this.active = false
    this.clear()

    this.logError(this.render(e.message || e, true) + '\n')

    disposeThen(this._error, this._error, this._disposable, e)
  }

  end (t, x) {
    if (!this.active) return
    this.active = false
    this.clear()

    this.logUpdate(this.render() + '\n')

    disposeThen(this._end, this._error, this._disposable, x)
  }

  clear () {
    clearInterval(this._id)
  }

  logUpdate (value) {
    const out = value + EOL
    process.stdout.write(eraseLines(this._previousLines) + out)
    this._previousLines = out.split(EOL).length
  }

  logError (e) {
    const out = (e.message || e) + EOL
    process.stderr.write(eraseLines(this._previousLines) + out)
    this._previousLines = out.split(EOL).length
  }

  render (value, isError = false) {
    const items = getItems(this._list)

    let titles = []
    let output = []

    for (let i = 0; i < items.length; ++i) {
      const item = items[i]

      if (Array.isArray(item.tasks)) {
        const { title, tasks, concurrent } = buildListOutput(item)
        titles.push([title, i, tasks.length, concurrent])
        output = output.concat(tasks)
      } else {
        output.push(buildItemOutput(item))
      }
    }

    // build the output string for each item
    for (let i = 0; i < output.length; ++i) {
      if (i < this._item) {
        output[i] = green(check) + '  ' + output[i]
      } else if (i > this._item) {
        output[i] = ' ' + output[i]
      } else {
        if (isError) {
          output[i] = red(cross) + output[i]
        } else {
          output[i] = yellow(frame()) + output[i]
        }
      }
    }

    const valuePosition = this._item + 1
    const hasValue = value && typeof value === 'string'

    // add intermediate information to the current task
    if (hasValue) {
      output.splice(valuePosition, 0, '     ' + white(arrowRight) + '   ' + grey(value))
    }

    // handle sublists
    titles.forEach(([title, index, length, concurrent]) => {
      let input = title

      if (this._item >= index && this._item < (index + length)) {
        input = white(frame()) + white(input)
      } else if (this._item < index) {
        input = ' ' + white(input)
      } else {
        input = green(check) + white(input)
      }

      const from = this._item + 1 <= index
        ? index + 1
        : index

      const isSubitem = valuePosition > from + 1 && valuePosition < index + 1 + length

      // adjust subitems
      for (let i = 0; i < length; ++i) {
        output[from + i] = `  ${output[from + i]}`
      }

      // adjust value for subitems
      if (hasValue && isSubitem) {
        output[valuePosition] = `  ${output[valuePosition]}`
      }

      // add the title
      output.splice(from, 0, input)
    })

    return '\n' + output.join('\n')
  }
}

function buildListOutput (item, indentation = '') {
  const tasks = item.tasks
  const length = tasks.length

  const out = []

  for (let i = 0; i < length; ++i) {
    out.push(`  ${tasks[i].title}`)
  }

  return { title: '  ' + item.title, tasks: out, concurrent: item.concurrent }
}

function buildItemOutput (item, indentation = '') {
  let output = ''

  output += indentation + '  ' + item.title

  return output
}

function disposeThen (end, error, disposable, x) {
  Promise.resolve(disposable.dispose()).then(() => {
    showCursor()
    end(x)
  }, error)
}

function showCursor () {
  process.stdout.write('\u001b[?25h')
}

function hideCursor () {
  process.stdout.write('\u001b[?25l')
}

function getItems (list) {
  let items = []

  const listItems = list.source.items

  for (let i = 0; i < listItems.length; ++i) {
    const item = listItems[i]

    if (isList(item)) {
      const sublistItems = getItems(item)
      items.push({ title: getTitle(item), tasks: sublistItems })
    } else {
      items.push({ title: getTitle(item), tasks: item })
    }
  }

  return items
}

function getTitle (x) {
  return x && x.source && x.source.title
}

function isList (x) {
  return x && x.source && x.source instanceof List
}
