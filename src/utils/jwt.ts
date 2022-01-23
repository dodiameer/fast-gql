import { JWT_SECRET } from "$env";
import { User } from "@prisma/client";
import jwt from "jsonwebtoken";

export const enum TokenType {
  ACCESS,
  REFRESH,
}

type TokenPayload = {
  userId: User["id"];
};

export const generateToken = (
  user: User,
  type: TokenType = TokenType.ACCESS
) => {
  const payload: TokenPayload = {
    userId: user.id,
  };

  if (type === TokenType.ACCESS) {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: "15m",
    });
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (e) {
    return null;
  }
};
