import { choo } from './y/choo'
import { load, process, route } from './y/load'

choo = new choo()
choo.use(process)
choo.load(load)
choo.route(route)
choo.mount('xo')
