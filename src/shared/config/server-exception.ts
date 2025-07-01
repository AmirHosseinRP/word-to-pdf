import { NextResponse } from "next/server";

const ServerException = (args: {
  status: number;
  message: string;
  codeOffset?: number;
  referenceNumber: string | null;
}) => {
  const { status, message, referenceNumber, codeOffset = 0 } = args;

  return NextResponse.json({ code: codeOffset + status, referenceNumber, message, result: null }, { status });
};

export default ServerException;
