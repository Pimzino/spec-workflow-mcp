import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../core/auth-service.js';

export function createAuthMiddleware(authService: AuthService) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    // Only protect /api routes (except /api/auth and /api/test)
    if (!request.url.startsWith('/api') || 
        request.url.startsWith('/api/auth') || 
        request.url.startsWith('/api/test')) {
      return;
    }

    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      reply.code(401).send({ error: 'Unauthorized: Missing or invalid token' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const payload = authService.verifyToken(token);

    if (!payload) {
      reply.code(401).send({ error: 'Unauthorized: Invalid or expired token' });
      return;
    }

    // Attach user to request (using any for simplicity, or we can use FastifyRequest declaration merging)
    (request as any).user = payload;
  };
}
