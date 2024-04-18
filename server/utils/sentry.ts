// server/utils/sentry.ts

import * as Sentry from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'
import { type Express, type Request, type Response, type NextFunction } from 'express'

export const initSentry = (app: Express): void => {
  Sentry.init({
    dsn: 'https://e03c559ff454a7948ad96c4d0bc68d20@o4506980696195072.ingest.us.sentry.io/4507105701724160',
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app }),
      nodeProfilingIntegration()
    ],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0
  })

  app.use(Sentry.Handlers.requestHandler())
  app.use(Sentry.Handlers.tracingHandler())
}

export const sentryErrorHandler = (): (err: Error, req: Request, res: Response, next: NextFunction) => void => {
  return Sentry.Handlers.errorHandler()
}
