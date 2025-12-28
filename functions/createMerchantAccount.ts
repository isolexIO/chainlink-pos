import nodemailer from 'npm:nodemailer@6.9.7';

Deno.serve(async (req) => {
    try {
        const body = await req.json();
        
        const {
            business_name,
            owner_name,
            owner_email,
            phone,
            address,
            dealer_id,
            setup_demo_data
        } = body;

        if (!business_name || !owner_name || !owner_email) {
            return Response.json({
                success: false,
                error: 'Business name, owner name, and email are required'
            }, { status: 400 });
        }

        // Use environment variables for service access
        const appId = Deno.env.get('BASE44_APP_ID');
        const apiUrl = `https://api.base44.com/v1/apps/${appId}`;
        const serviceKey = Deno.env.get('BASE44_SERVICE_ROLE_KEY') || '';

        // Check if merchant already exists
        const checkResponse = await fetch(`${apiUrl}/entities/Merchant?owner_email=${encodeURIComponent(owner_email.toLowerCase().trim())}`, {
            headers: {
                'Authorization': `Bearer ${serviceKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (!checkResponse.ok) {
            throw new Error('Failed to check existing merchants');
        }

        const existingMerchants = await checkResponse.json();
        
        if (existingMerchants && existingMerchants.length > 0) {
            return Response.json({
                success: false,
                error: 'A merchant account with this email already exists'
            }, { status: 400 });
        }

        // Create merchant
        const createResponse = await fetch(`${apiUrl}/entities/Merchant`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                business_name: business_name.trim(),
                display_name: business_name.trim(),
                owner_name: owner_name.trim(),
                owner_email: owner_email.toLowerCase().trim(),
                phone: phone || '',
                address: address || '',
                dealer_id: dealer_id || null,
                status: 'trial',
                trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                subscription_plan: 'basic',
                onboarding_completed: false,
                total_revenue: 0,
                total_orders: 0,
                settings: {
                    timezone: 'America/New_York',
                    currency: 'USD',
                    tax_rate: 0.08,
                    demo_data_requested: setup_demo_data || false
                }
            })
        });

        if (!createResponse.ok) {
            const errorData = await createResponse.json();
            throw new Error(errorData.message || 'Failed to create merchant');
        }

        const merchant = await createResponse.json();

        // Send confirmation email
        try {
            const transporter = nodemailer.createTransport({
                host: Deno.env.get('SMTP_HOST'),
                port: parseInt(Deno.env.get('SMTP_PORT') || '587'),
                secure: Deno.env.get('SMTP_PORT') === '465',
                auth: {
                    user: Deno.env.get('SMTP_USER'),
                    pass: Deno.env.get('SMTP_PASSWORD')
                }
            });

            await transporter.sendMail({
                from: `"${Deno.env.get('SMTP_FROM_NAME')}" <${Deno.env.get('SMTP_FROM_EMAIL')}>`,
                to: owner_email.toLowerCase().trim(),
                subject: 'Welcome to ChainLINK POS - Registration Received',
                html: `
                    <h2>Welcome to ChainLINK POS, ${owner_name}!</h2>
                    <p>Your merchant registration has been received successfully.</p>
                    
                    <h3>What's Next?</h3>
                    <p>Our team will review your application and activate your account within 24 hours.</p>
                    <p>You will receive an email with your login credentials once your account is ready.</p>
                    
                    <h3>Your Registration Details:</h3>
                    <p><strong>Business Name:</strong> ${business_name}</p>
                    <p><strong>Email:</strong> ${owner_email.toLowerCase().trim()}</p>
                    
                    <p>Thank you for choosing ChainLINK POS!</p>
                `,
                text: `Welcome to ChainLINK POS, ${owner_name}!\n\nYour merchant registration has been received successfully.\n\nWhat's Next?\nOur team will review your application and activate your account within 24 hours.\nYou will receive an email with your login credentials once your account is ready.\n\nYour Registration Details:\nBusiness Name: ${business_name}\nEmail: ${owner_email.toLowerCase().trim()}\n\nThank you for choosing ChainLINK POS!`
            });
        } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
            // Don't fail registration if email fails
        }

        return Response.json({
            success: true,
            merchant: {
                id: merchant.id,
                business_name: merchant.business_name
            }
        });

    } catch (error) {
        console.error('createMerchantAccount ERROR:', error);
        
        return Response.json({
            success: false,
            error: error.message || 'Failed to submit registration'
        }, { status: 500 });
    }
});