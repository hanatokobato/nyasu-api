import mongoose, { ObjectId } from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';

interface UserModel extends mongoose.Model<UserDoc> {}

export interface UserDoc extends mongoose.Document {
  id: ObjectId;
  email: string;
  password: string;
  passwordChangedAt: Date;
  role: string;
  isValidPassword: (
    providedPassword: string,
    userPassword: string
  ) => Promise<boolean>;
  changedPasswordAfter: (timestamp: number) => boolean;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: [validator.isEmail],
    },
    password: {
      type: String,
      required: true,
    },
    passwordConfirm: {
      type: String,
    },
    passwordChangedAt: {
      type: Date,
    },
    role: {
      type: String,
      enum: ['ADMIN', 'USER'],
      default: 'USER',
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
    toObject: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.isValidPassword = async function (
  providedPassword: string,
  userPassword: string
) {
  return await bcrypt.compare(providedPassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp: number) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      (this.passwordChangedAt.getTime() / 1000).toString(),
      10
    );

    return changedTimeStamp > JWTTimestamp;
  }

  return false;
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };
