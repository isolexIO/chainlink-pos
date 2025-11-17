import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import bcrypt from 'npm:bcryptjs@2.4.3';

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

        // Check if user already exists
        console.log('Checking for existing user:', owner_email);
        try {
            const existingUsers = await base44.asServiceRole.entities.User.filter({ 
                email: owner_email.toLowerCase().trim() 
            });
            if (existingUsers && existingUsers.length > 0) {
                console.error('User already exists');
                return Response.json({
                    success: false,
                    error: 'An account with this email already exists'
                }, { status: 400 });
            }
        } catch (userCheckError) {
            console.error('Error checking existing users:', userCheckError);
        }

        // Generate a random 6-digit PIN
        const pin = Math.floor(100000 + Math.random() * 900000).toString();
        console.log('Generated PIN');

        // Generate a temporary password
        const tempPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12).toUpperCase();
        const passwordHash = await bcrypt.hash(tempPassword, 10);
        console.log('Generated password hash');

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

        // Create owner user account
        const userData = {
            full_name: owner_name.trim(),
            email: owner_email.toLowerCase().trim(),
            role: 'admin',
            merchant_id: merchant.id,
            dealer_id: dealer_id || null,
            pin: pin,
            password_hash: passwordHash,
            employee_id: `EMP-${Date.now()}`,
            is_active: true,
            currently_clocked_in: false,
            total_sales: 0,
            total_orders: 0,
            total_hours_worked: 0,
            permissions: [
                'process_orders',
                'manage_products',
                'manage_customers',
                'view_reports',
                'manage_settings',
                'manage_users',
                'submit_tickets',
                'manage_inventory',
                'issue_refunds',
                'manage_discounts',
                'close_register'
            ]
        };

        console.log('Creating user...');
        const user = await base44.asServiceRole.entities.User.create(userData);
        console.log('User created:', user.id);

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

        // Send welcome email
        try {
            console.log('Sending welcome email...');
            await base44.integrations.Core.SendEmail({
                to: owner_email.toLowerCase().trim(),
                subject: 'Welcome to ChainLINK POS!',
                body: `
                    <h2>Welcome to ChainLINK POS, ${owner_name}!</h2>
                    <p>Your merchant account has been created successfully.</p>
                    
                    <h3>Your Login Credentials:</h3>
                    <p><strong>Email:</strong> ${owner_email.toLowerCase().trim()}</p>
                    <p><strong>PIN:</strong> ${pin}</p>
                    <p><strong>Temporary Password:</strong> ${tempPassword}</p>
                    
                    <p>You can login using either your 6-digit PIN for quick access, or your email and password.</p>
                    
                    <p>Your 30-day free trial has started!</p>
                `
            });
            console.log('Welcome email sent');
        } catch (emailError) {
            console.error('Failed to send welcome email (non-fatal):', emailError.message);
        }

        console.log('Merchant account created successfully');

        return Response.json({
            success: true,
            merchant: {
                id: merchant.id,
                business_name: merchant.business_name
            },
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name
            },
            pin: pin,
            temp_password: tempPassword
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