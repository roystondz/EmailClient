/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
//  /api/clerk/webhook
import { db } from "@/server/db";


export const POST = async(req:Request)=>{
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {data} = await req.json();

    const emailAddress = data.email_addresses[0].email_address;
    const firstName = data.first_name;
    const lastName = data.last_name;
    const image = data.image_url;
    const id = data.id;

    await db.user.create({
        data: {
            emailAddress: emailAddress,
            firstName: firstName,
            lastName: lastName,
            imageUrl: image,
            id: id
        }
    });
    
    return new Response('Webhook received', {status: 200});
}
