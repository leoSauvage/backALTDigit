import { Server as HocuspocusServer } from '@hocuspocus/server'
import { onStoreDocument, onLoadDocument } from './document_helpers.js'

/**
 * This provider boots up a Hocuspocus collaborative‐editing server
 * on the same HTTP server instance that Adonis uses.
 */
export default class HocuspocusProvider {
  constructor() {}

  register() {
    // nothing to register in the IoC container for now
  }

  async boot() {
    const hocuspocus = new HocuspocusServer({
      port: 3332,
      onStoreDocument,
      onLoadDocument,
      debounce: 5000
    })

    await hocuspocus.listen()
  }
}
