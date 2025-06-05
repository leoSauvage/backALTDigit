import { fromUint8Array, toUint8Array } from 'js-base64'
import * as Y from 'yjs'
import prisma from '#lib/prisma'

export async function onStoreDocument (incomingData) {
  const { documentName, document } = incomingData
  if (!documentName) return Promise.resolve()
  const [documentIdRaw, actionId] = documentName.split('?');
  const documentId = Number.parseInt(documentIdRaw, 10);
  const state = Y.encodeStateAsUpdate(document)
  const dbDocument = fromUint8Array(state)
  const documentFromDB = await prisma.document.findUnique({
    where: {
      id: documentId,
    },
  })

  if (!documentFromDB) {
    return prisma.document
      .create({
        data: {
          id: documentId,
          tiptap_content: dbDocument,
          action: {
            connect: {
              id: actionId,
            },
          },
        },
      })
      .then(() => {
        console.log('Document created')
      })
  }
  return prisma.document
    .update({
      where: {
        id: documentId,
      },
      data: {
        tiptap_content: dbDocument,
        action: {
          connect: {
            id: actionId,
          },
        },
      },
    })
    .then(() => {
      console.log('Document updated')
    })
}

export async function onLoadDocument(incomingData) {
  const { documentName, document } = incomingData
  if (!documentName) return Promise.resolve()
  const documentId = parseInt(documentName, 10)
  const documentFromDB = await prisma.document.findUnique({
    where: {
      id: documentId
    }
  })
  if (documentFromDB) {
    const dbDocument = toUint8Array(documentFromDB.tiptap_content || '')
    if (dbDocument) Y.applyUpdate(document, dbDocument)
    return document
  }
  return document
}
