import { Server as HocuspocusServer } from '@hocuspocus/server'

/**
 * This provider boots up a Hocuspocus collaborative‐editing server
 * on the same HTTP server instance that Adonis uses.
 */
export default class HocuspocusProvider {
  constructor() {}

  public register() {
    // nothing to register in the IoC container for now
  }

  public async boot() {
    const hocuspocus = new HocuspocusServer({
      port: 3332,
    })

    await hocuspocus.listen()
  }
}
