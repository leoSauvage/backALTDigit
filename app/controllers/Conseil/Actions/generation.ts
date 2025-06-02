import { HttpContext } from '@adonisjs/core/http'
import Generation from '#models/Actions/action'

import { cuid } from '@adonisjs/core/helpers'
import { sep, normalize } from 'node:path'
import app from '@adonisjs/core/services/app'
import { existsSync, writeFileSync, unlinkSync } from 'node:fs'
const PATH_TRAVERSAL_REGEX = /(?:^|[\\/])\.\.(?:[\\/]|$)/

export default class GenerationController {
  public async upload({ request, response }: HttpContext) {
    // 'avatar' here is the form field name; adjust to match your upload form
    const invoiceDocuments = request.files('documents', {
      size: '5mb',
    })

    const actionId = request.input('id')

    /**
     * Creating a collection of invalid documents
     */
    let invalidDocuments = invoiceDocuments.filter((document) => {
      return !document.isValid
    })

    if (invalidDocuments.length) {
      return response.badRequest({
        errors: invalidDocuments.map((document) => {
          name: document.clientName
          errors: document.errors
        }),
      })
    }

    for (const document of invoiceDocuments) {
      await document.move(app.makePath('storage/uploads'), {
        name: `${cuid()}.${document.extname}`,
      })
      const fileName = document.fileName!
      await Generation.createDocument(fileName, actionId)
    }
    return response.ok
  }

  /**
   * Récupère un fichier
   */
  async retrieve({ request, response }: HttpContext) {
    try {
      const filePath = request.param('*').join(sep)
      const normalizedPath = normalize(filePath)
      if (PATH_TRAVERSAL_REGEX.test(normalizedPath)) {
        return response.badRequest('Malformed path')
      }

      const absolutePath = app.makePath('storage/uploads', normalizedPath)
      return response.download(absolutePath)
    } catch (err) {
      const error = err as Error
      return response.notFound({
        error: error.message || 'Fichier non trouvé',
      })
    }
  }

  // Modify a file by overwriting its current content
  public async modifyFile({ request, response }: HttpContext) {
    try {
      const filename = request.input('filename')
      const newContent = request.input('content')

      if (!filename) {
        return response.badRequest({ error: 'Filename is required' })
      }

      const normalizedPath = normalize(filename)
      if (PATH_TRAVERSAL_REGEX.test(normalizedPath)) {
        return response.badRequest({ error: 'Malformed path' })
      }

      // Use Application.tmpPath (or appRoot if you prefer) to construct a safe path for your uploads
      const absolutePath = app.makePath('storage/uploads', normalizedPath)

      if (!existsSync(absolutePath)) {
        return response.notFound({ error: `File "${filename}" not found` })
      }

      // Overwrite the existing file contents
      writeFileSync(absolutePath, newContent, 'utf-8')

      return response.ok({
        success: true,
        message: 'File modified successfully',
      })
    } catch (err) {
      const error = err as Error
      return response.internalServerError({ error: error.message })
    }
  }

  // Delete a file from the filesystem
  public async deleteFile({ request, response }: HttpContext) {
    try {
      const filename = request.input('filename')

      if (!filename) {
        return response.badRequest({ error: 'Filename is required' })
      }

      const normalizedPath = normalize(filename)
      if (PATH_TRAVERSAL_REGEX.test(normalizedPath)) {
        return response.badRequest({ error: 'Malformed path' })
      }

      // Use Application.tmpPath to point to your uploads directory
      const absolutePath = app.makePath('storage/uploads', normalizedPath)

      if (!existsSync(absolutePath)) {
        return response.notFound({ error: `File "${filename}" not found` })
      }

      unlinkSync(absolutePath)

      return response.ok({
        success: true,
        message: 'File deleted successfully',
      })
    } catch (err) {
      const error = err as Error
      return response.internalServerError({ error: error.message })
    }
  }
}
