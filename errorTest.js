const { merge, of, throwError } = require('most')
const { list, item, run } = require('./lib')

const stream = merge(
  of('hello'),
  of('world').delay(1000),
  of('!!').delay(2000)
)

const errStream = merge(
  of('hello'),
  of('world').delay(2000)
    .map(() => throwError(new Error('wtf'))).switch()
)

run(list('List With Error', item('item1', stream), item('item2', errStream)))
