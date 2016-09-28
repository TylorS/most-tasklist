const { merge, of } = require('most')
const { list, item, run } = require('./lib')

const stream = merge(
  of('hello'),
  of('world').delay(1000),
  of('!!').delay(2000)
)

const stream2 = merge(
  of('vikings'),
  of('are').delay(1000),
  of('cool').delay(2000),
  of('!!').delay(3000)
)

const sublist = list('sublist', item('subitem1', stream), item('subitem2', stream2))

run(list('List with Success', item('item1', stream), sublist, item('item2', stream)))
