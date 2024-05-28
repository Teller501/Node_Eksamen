import cors from 'cors';

const corsMiddleware = cors({
  credentials: true,
  origin: true,
});

export default corsMiddleware;