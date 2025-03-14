/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Account } from "@/lib/accounts";
import { db } from "@/server/db";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    // Log incoming request body
    const { accountId, userId } = await req.json();
    console.log("Request data:", { accountId, userId });

    if (!accountId || !userId) return NextResponse.json('Invalid request', { status: 400 });

    // Check if account exists in the database
    const dbAccount = await db.account.findUnique({
      where: {
        id: accountId,
        userId,
      },
    });

    console.log("Database account:", dbAccount);
    if (!dbAccount) return NextResponse.json('Account not found', { status: 404 });

    // Sync logic
    const account = new Account(dbAccount.token);
    const response = await account.performInitialSync();
    console.log("Sync response:", response);
    
    if (!response) return NextResponse.json('Unable to sync account', { status: 500 });

    const { allEmails, storedDeltaToken } = response;
    console.log(allEmails, storedDeltaToken);

    // Update database with new delta token if needed
    // Uncomment the code below to update the database once syncing is successful
    /*
    await db.account.update({
      where: { id: accountId },
      data: { nextDeltaToken: storedDeltaToken },
    });
    */

    return NextResponse.json('Initial sync complete', { status: 200 });

  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json('Internal server error', { status: 500 });
  }
};
