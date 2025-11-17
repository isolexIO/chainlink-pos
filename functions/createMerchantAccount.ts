import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        console.log('createMerchantAccount: Starting...');
        
        const body = await req.json();
        console.log('Received body:', { ...body, setup_demo_data: body.setup_demo_data });
        
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
            console.error('Missing required fields');
            return Response.json({
                success: false,
                error: 'Business name, owner name, and email are required'
            }, { status: 400 });
        }

        const base44 = createClientFromRequest(req);

        // Check if merchant already exists with this email
        console.log('Checking for existing merchant:', owner_email);
        try {
            const existingMerchants = await base44.asServiceRole.entities.Merchant.filter({ 
                owner_email: owner_email.toLowerCase().trim() 
            });
            if (existingMerchants && existingMerchants.length > 0) {
                console.error('Merchant already exists');
                return Response.json({
                    success: false,
                    error: 'A merchant account with this email already exists'
                }, { status: 400 });
            }
        } catch (merchantCheckError) {
            console.error('Error checking existing merchants:', merchantCheckError);
        }

        // Create merchant
        const merchantData = {
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
                enable_chainlink_payments: false,
                kitchen_display: {
                    enabled: true,
                    auto_print: false
                },
                age_verification: {
                    enabled: true
                },
                online_ordering: {
                    enabled: true,
                    allow_cash_payment: true,
                    allow_pickup: true,
                    allow_delivery: true,
                    min_order_amount: 0,
                    delivery_fee: 4.99
                },
                customer_display: {
                    enabled: true,
                    show_tip_screen: true,
                    show_payment_methods: true
                }
            }
        };

        console.log('Creating merchant...');
        const merchant = await base44.asServiceRole.entities.Merchant.create(merchantData);
        console.log('Merchant created:', merchant.id);

        // Set up demo data if requested
        if (setup_demo_data) {
            console.log('Setting up demo menu...');
            try {
                await base44.asServiceRole.functions.invoke('setupDemoMenu', {
                    merchant_id: merchant.id
                });
                console.log('Demo menu setup complete');
            } catch (demoError) {
                console.error('Error setting up demo menu (non-fatal):', demoError.message);
            }
        }

        // Send notification email
        try {
            console.log('Sending notification email...');
            await base44.integrations.Core.SendEmail({
                to: owner_email.toLowerCase().trim(),
                subject: 'Welcome to ChainLINK POS - Account Pending Setup',
                body: `
                    <h2>Welcome to ChainLINK POS, ${owner_name}!</h2>
                    <p>Your merchant account request has been received successfully.</p>
                    
                    <h3>What's Next?</h3>
                    <p>Our team will review your application and set up your account within 24 hours.</p>
                    <p>You will receive an email with your login credentials once your account is activated.</p>
                    
                    <h3>Your Application Details:</h3>
                    <p><strong>Business Name:</strong> ${business_name}</p>
                    <p><strong>Email:</strong> ${owner_email.toLowerCase().trim()}</p>
                    <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                    
                    <p>If you have any questions, please don't hesitate to contact our support team.</p>
                    
                    <p>Thank you for choosing ChainLINK POS!</p>
                `
            });
            console.log('Notification email sent');
        } catch (emailError) {
            console.error('Failed to send notification email (non-fatal):', emailError.message);
        }

        console.log('Merchant registration completed successfully');

        return Response.json({
            success: true,
            merchant: {
                id: merchant.id,
                business_name: merchant.business_name
            },
            message: 'Registration received. Admin will activate your account within 24 hours.'
        });

    } catch (error) {
        console.error('createMerchantAccount FATAL ERROR:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        return Response.json({
            success: false,
            error: error.message || 'Failed to create merchant account',
            details: error.toString()
        }, { status: 500 });
    }
});