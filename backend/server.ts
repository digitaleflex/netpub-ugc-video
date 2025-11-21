import express from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs } from './graphql/schema.js';
import { resolvers } from './graphql/resolvers.js';
import { prisma } from './lib/prisma.js';
import { MonitoringUtils, PerformanceUtils, SecurityUtils } from './lib/security.js';
import { handleError, formatGraphQLError } from './lib/errorHandler.js';

import { makeExecutableSchema } from '@graphql-tools/schema';
import { applyMiddleware as graphqlMiddleware } from 'graphql-middleware';
import { validationMiddleware } from './lib/validation.js';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import session from 'express-session';

const app = express();
const PORT = process.env.PORT || 4000;

// Logs et diagnostics
console.log('🚀 Démarrage du serveur backend NetPub...');
console.log(`📊 Environnement: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔌 Port: ${PORT}`);

// Middleware avec logs
app.use(cors());
app.use(helmet(SecurityUtils.getSecurityHeaders()));

// Configure session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || SecurityUtils.generateSecureToken(32), // Use a strong secret
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

app.use((req, res, next) => {
  next();
});

// Make CSRF token available to the frontend
import { csrfApolloMiddleware, csrfProtection } from './lib/csrfMiddleware.js';
// ...
app.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: 'CSRF_DISABLED' }); // Return a dummy token since CSRF is disabled
});



// Middleware de logging des requêtes
app.use((req, res, next) => {
  const startTime = MonitoringUtils.startTimer(`Request ${req.method} ${req.path}`);
  const endTimer = startTime;

  res.on('finish', () => {
    const duration = endTimer();
    MonitoringUtils.trackApiCall(req.path, req.method, duration, res.statusCode);
    console.log(`📨 ${req.method} ${req.path} - ${res.statusCode} - ${duration.toFixed(2)}ms`);
  });

  next();
});

// Middleware de diagnostic de santé
app.get('/health', async (req, res) => {
  const memoryUsage = PerformanceUtils.getMemoryUsage();
  const dbHealth = await PerformanceUtils.checkDatabaseHealth();

  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
      heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
    },
    database: dbHealth ? 'Connected' : 'Disconnected'
  });
});

// GraphQL setup avec gestion d'erreurs améliorée et validation
const schema = makeExecutableSchema({ typeDefs, resolvers });
const schemaWithMiddleware = graphqlMiddleware(schema, validationMiddleware);

const server = new ApolloServer({
  schema: schemaWithMiddleware,
  context: ({ req }: any) => ({
    prisma,
    req,
  }),
  formatError: formatGraphQLError,
  plugins: [
    {
      requestDidStart: async () => ({
        didEncounterErrors: async (requestContext) => {
          requestContext.errors?.forEach((error) => {
            console.error('❌ Erreur GraphQL:', error);
            MonitoringUtils.trackError(error as Error);
          });
        },
      }),
    },
  ],
});

async function startServer() {
  try {
    console.log('🔧 Initialisation du serveur GraphQL...');
    await server.start();

    // Configuration du limiteur de débit pour l'API GraphQL
    const apiLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limite chaque IP à 100 requêtes par `windowMs`
      message: 'Trop de requêtes depuis cette adresse IP, veuillez réessayer après 15 minutes.',
      standardHeaders: true, // Retourne les infos de limite dans les headers `RateLimit-*`
      legacyHeaders: false, // Désactive les headers `X-RateLimit-*`
    });

    // Appliquer le limiteur de débit uniquement aux requêtes GraphQL
    app.use(server.graphqlPath, apiLimiter);

    server.applyMiddleware({ app } as any);
    console.log('✅ Serveur GraphQL initialisé avec succès');

    // Vérification de la connexion à la base de données
    console.log('🔍 Vérification de la connexion à la base de données...');
    await prisma.$connect();
    console.log('✅ Connexion à la base de données établie');

    app.listen(PORT, () => {
      console.log(`🚀 Serveur prêt à l'adresse http://localhost:${PORT}${server.graphqlPath}`);
      console.log(`🏥 Endpoint de santé disponible sur http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    MonitoringUtils.trackError(error as Error);
    process.exit(1);
  }
}

// Gestion globale des erreurs non capturées
process.on('uncaughtException', (error) => {
  console.error('❌ Exception non capturée:', error);
  MonitoringUtils.trackError(error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesse rejetée non gérée:', reason);
  MonitoringUtils.trackError(new Error(`Unhandled Rejection: ${reason}`));
  process.exit(1);
});

startServer().catch((error) => {
  console.error('❌ Erreur fatale lors du démarrage:', error);
  MonitoringUtils.trackError(error);
  process.exit(1);
});