"use server";
import axios from "axios";
import { auth } from "@clerk/nextjs/server";

export const getAurinkoAuthUrl = async (serviceType: 'Google'|'Office365') => {
    const userId = await auth();
    if(!userId) throw new Error('Unauthorized');

    const  params = new URLSearchParams({
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        clientId: process.env.AURINKO_CLIENT_ID as string,
        serviceType,
        scopes: 'Mail.Read Mail.ReadWrite Mail.Send Mail.Drafts Mail.all',
        responseType: 'code',
        returnUrl: `${process.env.NEXT_PUBLIC_URL}/api/aurinko/callback`,
    });
    return `https://api.aurinko.io/v1/auth/authorize?${params.toString()}`;
}

export const exchangeAurinkoCodeForToken = async (code: string) => {
    try{
        const response = await axios.post(`https://api.aurinko.io/v1/auth/token/${code}`, {},{
            auth: {
                // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
                username: process.env.AURINKO_CLIENT_ID as string,
                // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
                password: process.env.AURINKO_CLIENT_SECRET as string,
            },
        });
        return response.data as{
            accountId: string,
            accessToken: string,
            userId: string,
            userSession: string,
        };
    }catch(error){
        if(axios.isAxiosError(error)){
            console.error(error.response?.data);
        }
        throw new Error('Unable to exchange code for token');
        
    }
}


export const getAurinkoUserInfo = async (token: string) => {
    try{
        const response = await axios.get('https://api.aurinko.io/v1/account',{
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data as{
            email: string,
            name: string,
            lastName: string,
            imageUrl: string,
            id: string,
        };
    }catch(error){
        if(axios.isAxiosError(error)){
            console.error(error.response?.data);
        }
        throw new Error('Unable to get user info');
    }
}

