import * as path from 'forward-slash-path'
import fs from 'fs-extra'
import Koa from 'koa'
import useKoaStaticServer from 'koa-static-server'

const rootFolder = path.join(import.meta.dirname, `..`)
const koa = new Koa
koa.use(async (context, next) => {
  const pattern = /^\/grammar\/(?<id>\w+)$/
  const match = pattern.exec(context.path)
  if (match?.groups?.id) {
    context.body = fs.createReadStream(path.join(rootFolder, `test`, `tmgrammar`, `${match.groups.id}.a1111.txt`))
  }
  await next()
})
koa.use(async (context, next) => {
  if (context.path === `/yaml`) {
    context.body = fs.createReadStream(path.join(rootFolder, `syntaxes`, `auto1111.tmLanguage.yaml`))
  }
  await next()
})
koa.use(useKoaStaticServer({
  rootDir: path.join(rootFolder, `playground`),
  log: true,
  last: false,
}))
koa.use(async (context, next) => {
  if (context.path === `/`) {
    context.path = `/playground`
  }
  await next()
})
koa.listen(3000)
