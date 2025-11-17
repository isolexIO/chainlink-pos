import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import nodemailer from 'npm:nodemailer@6.9.7';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Verify user is authenticated
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { to, subject, html, text } = body;

        if (!to || !subject || (!html && !text)) {
            return Response.json({
                success: false,
                error: 'Missing required fields: to, subject, and html or text'
            }, { status: 400 });
        }

        // Create transporter with SMTP credentials from environment
        const transporter = nodemailer.createTransport({
            host: Deno.env.get('SMTP_HOST'),
            port: parseInt(Deno.env.get('SMTP_PORT') || '587'),
            secure: Deno.env.get('SMTP_PORT') === '465',
            auth: {
                user: Deno.env.get('SMTP_USER'),
                pass: Deno.env.get('SMTP_PASSWORD')
            }
        });

        // Send email
        const info = await transporter.sendMail({
            from: `"${Deno.env.get('SMTP_FROM_NAME')}" <${Deno.env.get('SMTP_FROM_EMAIL')}>`,
            to: to,
            subject: subject,
            text: text,
            html: html
        });

        console.log('Email sent:', info.messageId);

        return Response.json({
            success: true,
            messageId: info.messageId
        });

    } catch (error) {
        console.error('sendEmail ERROR:', error);
        return Response.json({
            success: false,
            error: error.message || 'Failed to send email'
        }, { status: 500 });
    }
});