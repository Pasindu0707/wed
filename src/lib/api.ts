import { NextResponse } from "next/server";
import mongoose from "mongoose";

export function jsonOk(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, { status: 200, ...init });
}

export function jsonCreated(data: unknown) {
  return NextResponse.json(data, { status: 201 });
}

export function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

export function isObjectId(value: string) {
  return mongoose.Types.ObjectId.isValid(value);
}

export function pickQuery(req: Request) {
  const url = new URL(req.url);
  return url.searchParams;
}

