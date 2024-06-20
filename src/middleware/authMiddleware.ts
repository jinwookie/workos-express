import { NextFunction, Request, Response } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { ORG_ID_HEADER, USER_ID_HEADER } from "../headers";
import { workos } from "../workos";

const JWKS = createRemoteJWKSet(
  new URL(
    workos.userManagement.getJwksUrl(String(process.env.WORKOS_CLIENT_ID))
  )
);

const authMiddleware = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const authHeader = request.header("Authorization");
  const split = authHeader?.split(" ");
  if (split?.[0] !== "Bearer" || !split?.[1]) {
    return response.status(401).json({ message: "Unauthorized" });
  }

  const accessToken = split[1];
  try {
    const verified = await jwtVerify(accessToken, JWKS);
    request.headers[USER_ID_HEADER] = verified.payload.sub;
    request.headers[ORG_ID_HEADER] = verified.payload.org_id as string;
    next();
  } catch (e) {
    return response.status(401).json({ message: "Unauthorized" });
  }
};

export default authMiddleware;
