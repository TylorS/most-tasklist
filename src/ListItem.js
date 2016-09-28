import { Stream } from 'most'

export function item (title, task, skip = false) {
  if (typeof title !== 'string') {
    throw new TypeError('First argument to item must be a title of type `string`')
  }

  if (!task.source || typeof task.source.run !== 'function') {
    throw new TypeError('Second argument to item must me a Stream')
  }

  return new Stream(new ListItem(title, task.source, skip))
}

class ListItem {
  constructor (title, task, skip) {
    this.title = title
    this.task = task
    this.skip = skip
  }

  run (sink, scheduler) {
    const { title, task, skip } = this

    const shouldSkip = typeof skip === 'function' && skip() || false

    if (shouldSkip) {
      // TODO: figure out what to do with this information
      sink.event(scheduler.now(), { type: 'skipped' })
      sink.end(scheduler.now())
    }

    return shouldSkip
      ? { dispose: Function.prototype }
      : task.run(new ListItemSink(sink, title), scheduler)
  }
}

class ListItemSink {
  constructor (sink, title) {
    this.sink = sink
    this.title = title

    this.has = false
    this.value = void 0
  }

  event (t, x) {
    this.has = true
    this.value = x
    this.sink.event(t, { type: 'update', value: x })
  }

  error (t, e) {
    this.sink.error(t, e)
  }

  end (t, x) {
    if (this.has) {
      this.sink.event(t, { type: 'end', value: x || this.value })
    }

    this.sink.end(t, x || this.value)
  }
}
