import {createTransport} from "nodemailer";


export const sendMail = async (email, subject, text) =>{

    const transport = createTransport({
        service: 'gmail', 
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth:{
            user:process.env.SMTP_USER,
            pass:process.env.SMTP_PASS,
        },

    });

        await transport.sendMail({
            from:'sdaasd',
            to:email,
            subject,
            text,
        });

   
};