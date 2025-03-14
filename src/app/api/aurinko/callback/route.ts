import { exchangeAurinkoCodeForToken, getAurinkoUserInfo } from "@/lib/aurinko";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { get } from "http";
import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import axios from "axios";


// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const GET =async (req:NextRequest)=>{
    const { userId } = await auth();
    if(!userId) return NextResponse.json('Unauthorized', {status: 401});
    const params = req.nextUrl.searchParams;
    const status = params.get('status');
    if(status === 'error') return NextResponse.json('Unable to link account', {status: 400});

    const code =params.get('code');
    if(!code) return NextResponse.json('Invalid code', {status: 400});

    const token = await exchangeAurinkoCodeForToken(code);
    if(!token) return NextResponse.json('Unable to exchange code for token', {status: 400});

    const accountDetails  = await getAurinkoUserInfo(token.accessToken);
    if(!accountDetails) return NextResponse.json('Unable to get account details', {status: 400});
    
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await db.account.upsert({
        create:{
            id: token.accountId.toString(),
            token: token.accessToken,
            userId,
            emailAddress: accountDetails.email,
            name: accountDetails.name,
        },
        update:{
            token: token.accessToken,
        },
        where:{
            id: token.accountId.toString()
        }
        
    })

    waitUntil(
        axios.post(`${process.env.NEXT_PUBLIC_URL}/api/initial-sync`,{
            accountId: token.accountId.toString(),
            userId,
        }).then((response)=>{
            console.log(response.data);
        }).catch((error)=>{
            console.error(error);
            console.log('Error syncing account');
        })
    );

    return  NextResponse.redirect(new URL('/mail', req.url));
}