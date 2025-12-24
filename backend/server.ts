
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { createServer } from 'http';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { makeExecutableSchema } from '@graphql-tools/schema';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { typeDefs } from './graphql/schema.js';
import { resolvers } from './graphql/resolvers.js';
import { prisma } from './lib/prisma.js';
import { AuthService } from './lib/auth.js';

// Load environment variables from the root .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In development, load from ../.env (root). In production, env vars are injected.
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: path.resolve(__dirname, '../.env') });
}

// Ensure critical variables are present
if (!process.env.JWT_SECRET) {
    console.warn('⚠️ WARNING: JWT_SECRET not set. Using fallback for development only.');
}

const PORT = process.env.PORT || 4000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev_session_secret';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

async function startApolloServer() {
    const app = express();
    const httpServer = createServer(app);

    // Security Middleware
    app.use(helmet({
        contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
        crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production' ? true : false,
    }));

    // CORS
    const allowedOrigins = [FRONTEND_URL, 'http://localhost:3000', 'https://studio.apollographql.com'];
    app.use(cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    }));

    // Rate Limiting
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per windowMs
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use('/graphql', limiter);

    // Session Management
    app.use(session({
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
    }));

    app.use(express.json());

    // Health Check
    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // CSRF Token Endpoint (Simple implementation)
    app.get('/csrf-token', (req, res) => {
        // In a stateless JWT setup, CSRF tokens might be handled differently,
        // but here's a placeholder if the frontend expects it.
        // Ideally use csurf middleware if using sessions.
        res.json({ csrfToken: 'csrf-token-placeholder-or-uuid' });
    });

    // GraphQL Schema
    const schema = makeExecutableSchema({ typeDefs, resolvers });

    // Apollo Server Setup
    const server = new ApolloServer({
        schema,
        context: async ({ req, res }) => {
            // Get the user token from the headers
            const token = req.headers.authorization || '';
            let user = null;
            if (token) {
                try {
                    const bearerToken = token.replace('Bearer ', '');
                    user = AuthService.verifyToken(bearerToken);
                } catch (e) {
                    console.error("Token verification failed", e);
                }
            }
            return { req, res, prisma, user };
        },
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    });

    await server.start();
    server.applyMiddleware({
        app: app as any,
        path: '/graphql',
        cors: false // Handle CORS manually above
    });

    // Serve Static Frontend Files (Production)
    if (process.env.NODE_ENV === 'production') {
        // Path from backend/dist/server.js to /app/dist (frontend build)
        const distPath = path.join(__dirname, '../../dist');
        app.use(express.static(distPath));
        app.get('*', (req, res, next) => {
            // Don't intercept API routes
            if (req.path.startsWith('/graphql') || req.path.startsWith('/health') || req.path.startsWith('/csrf-token')) {
                return next();
            }
            res.sendFile(path.join(distPath, 'index.html'));
        });
    }

    // Start Server
    await new Promise<void>(resolve => httpServer.listen({ port: PORT }, resolve));
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
}

startApolloServer().catch(err => {
    console.error('❌ Server failed to start:', err);
});
