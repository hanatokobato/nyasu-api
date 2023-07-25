import { User, UserDoc } from '../models/user';
import jwt, { Secret } from 'jsonwebtoken';
import { promisify } from 'util';
import { catchAsync } from '../utils/catchAsync';
import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/app-error';

interface IUserPayload {
  id: string;
  email: string;
}

interface IJwtPayload extends IUserPayload {
  iat: number;
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: IUserPayload;
    }
  }
}

const signToken = (id: string, email: string) => {
  return jwt.sign({ id, email }, process.env.JWT_SECRET as Secret, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (
  user: UserDoc,
  statusCode: number,
  req: Request,
  res: Response
) => {
  const token = signToken(user._id, user.email);

  req.session = {
    jwt: token,
  };

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, password_confirm: passwordConfirm } = req.body;

    const newUser = await User.create({
      email,
      password,
      passwordConfirm,
    });

    createSendToken(newUser, 201, req, res);
  }
);

const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Email and Password are required!', 400));
    }

    const user = await User.findOne({ email }).select('+password');
    const isValidPassword = await user?.isValidPassword(
      password,
      user.password
    );
    if (!user || !isValidPassword) {
      return next(new AppError('Incorrect Email or Passowrd!', 401));
    }

    createSendToken(user, 200, req, res);
  }
);

const logout = (req: Request, res: Response) => {
  req.session = null;
  res.status(200).json({ status: 'success' });
};

const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.session)
    if (!req.session?.jwt)
      return next(new AppError('Please log in and try again!', 401));

    const decoded = (await promisify<string, Secret>(jwt.verify)(
      req.session.jwt,
      process.env.JWT_SECRET as Secret
    )) as unknown as IJwtPayload;

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) return next(new AppError('The token is invalid!', 401));

    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(new AppError('Password changed! Please log in again.', 401));
    }

    req.currentUser = currentUser;
    next();
  }
);

export { signup, login, logout, protect };
