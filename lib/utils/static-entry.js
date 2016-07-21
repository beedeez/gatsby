/* @flow weak */
import React from 'react'
import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import { match, RouterContext } from 'react-router'
import createRoutes from 'create-routes'
import Html from 'html'
const loadContext = require('.gatsby-context')
import { pages, config } from 'config'
import { prefixLink } from '../isomorphic/gatsby-helpers'
import { StyleSheetServer } from 'aphrodite'


let routes
loadContext((pagesReq) => {
  routes = createRoutes(pages, pagesReq)
})

module.exports = (locals, callback) => {
  match({ routes, location: prefixLink(locals.path) }, (error, redirectLocation, renderProps) => {
    if (error) {
      console.log(error)
      callback(error)
    } else if (renderProps) {
      const component = <RouterContext {...renderProps} />
      let body

      // If we're not generating a SPA for production, eliminate React IDs.
			const { html, css } = StyleSheetServer.renderStatic(() => {
        return renderToString(component)
      })
			
      const finalHtml = `<!DOCTYPE html>\n ${renderToStaticMarkup(
        <Html body={html} css={css} {...renderProps} />
      )}`
      callback(null, finalHtml)
    }
  })
}
