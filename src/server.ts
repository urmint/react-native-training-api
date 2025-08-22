import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';

// Import configuration
import config from './config/config';
import connectDB from './config/database';

// Import middleware
import {
  globalErrorHandler,
  notFoundHandler,
  handleUnhandledRejection,
  handleUncaughtException,
} from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';

// Import swagger options
import swaggerOptions from './config/swagger';

class Server {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.configureMiddleware();
    this.configureRoutes();
    this.configureErrorHandling();
  }

  private configureMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors());
    
    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.rateLimitWindowMs,
      max: config.rateLimitMax,
      standardHeaders: true,
      legacyHeaders: false,
    });
    
    // Apply rate limiting to all API routes
    this.app.use('/api', limiter);
    
    // Body parsing middleware
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // Compression middleware
    this.app.use(compression());
    
    // Request logging
    this.app.use(morgan('dev'));
    
    // Swagger documentation
    const swaggerDocs = swaggerJsDoc(swaggerOptions);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
  }

  private configureRoutes(): void {
    // Health check route
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'Server is running',
        data: {
          environment: config.nodeEnv,
          timestamp: new Date().toISOString(),
        },
      });
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/tasks', taskRoutes);
  }

  private configureErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);
    
    // Global error handler
    this.app.use(globalErrorHandler);
  }

  public start(): void {
    // Connect to database
    connectDB();
    
    // Start server
    const server = this.app.listen(config.port, () => {
      console.log(`Server running in ${config.nodeEnv} mode on port ${config.port}`);
      console.log(`API Documentation available at http://localhost:${config.port}/api-docs`);
    });
    
    // Handle unhandled rejections
    handleUnhandledRejection(server);
    
    // Handle uncaught exceptions
    handleUncaughtException();
  }
}

// Create and start server
const server = new Server();
server.start();