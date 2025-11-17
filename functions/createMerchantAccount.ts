import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

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

        const base44 = createClientFromRequest(req);

        // Check if merchant already exists
        const existingMerchants = await base44.asServiceRole.entities.Merchant.filter({ 
            owner_email: owner_email.toLowerCase().trim() 
        });
        
        if (existingMerchants && existingMerchants.length > 0) {
            return Response.json({
                success: false,
                error: 'A merchant account with this email already exists'
            }, { status: 400 });
        }

        // Create merchant
        const merchant = await base44.asServiceRole.entities.Merchant.create({
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
        });

        // Send confirmation email
        await base44.integrations.Core.SendEmail({
            to: owner_email.toLowerCase().trim(),
            subject: 'Welcome to ChainLINK POS - Registration Received',
            body: `
                <h2>Welcome to ChainLINK POS, ${owner_name}!</h2>
                <p>Your merchant registration has been received successfully.</p>
                
                <h3>What's Next?</h3>
                <p>Our team will review your application and activate your account within 24 hours.</p>
                <p>You will receive an email with your login credentials once your account is ready.</p>
                
                <h3>Your Registration Details:</h3>
                <p><strong>Business Name:</strong> ${business_name}</p>
                <p><strong>Email:</strong> ${owner_email.toLowerCase().trim()}</p>
                
                <p>Thank you for choosing ChainLINK POS!</p>
            `
        });

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