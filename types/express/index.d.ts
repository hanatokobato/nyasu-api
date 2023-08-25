export {};

declare global {
  namespace Express {
    export interface Request {
      currentUser?: IUserPayload;
    }
  }

  interface IUserPayload {
    id: string;
    email: string;
    role: 'ADMIN' | 'USER';
  }

  interface IJwtPayload extends IUserPayload {
    iat: number;
  }
}
