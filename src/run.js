import scheduler from 'most/lib/scheduler/defaultScheduler'
import { settable } from 'most/lib/disposable/dispose'

import { Renderer } from './Renderer'

export function run (list, end = _end, error = _error) {
  const disposable = settable()
  const sink = new Renderer(end, error, disposable, list)
  disposable.setDisposable(list.source.run(sink, scheduler))
}

const _end = () => process.exit(0)
const _error = () => process.exit(1)
