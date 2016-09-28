import { Stream, concat, empty } from 'most'
import { reduce } from '@most/prelude'

export function list (title, ...items) {
  if (typeof title !== 'string') {
    throw new TypeError('First argument to list must be a string')
  }

  return new Stream(new List(title, items))
}

export class List {
  constructor (title, items, options) {
    this.title = title
    this.items = items
  }

  run (sink, scheduler) {
    return reduce(concat, empty(), this.items)
      .source.run(sink, scheduler)
  }
}
