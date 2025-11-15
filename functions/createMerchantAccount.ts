import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import bcrypt from 'npm:bcryptjs@2.4.3';

Deno.serve(async (req) => {
    try {
        console.log('createMerchantAccount: Starting...');
        
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
                error: 'business_name, owner_name, and owner_email are required'
            }, { status: 400 });
        }

        const base44 = createClientFromRequest(req);

        // Check if user already exists
        const existingUsers = await base44.asServiceRole.entities.User.filter({ email: owner_email });
        if (existingUsers && existingUsers.length > 0) {
            return Response.json({
                success: false,
                error: 'An account with this email already exists'
            }, { status: 400 });
        }

        // Generate a random 6-digit PIN
        const pin = Math.floor(100000 + Math.random() * 900000).toString();
        console.log('Generated PIN:', pin);

        // Generate a temporary password (user can reset via email)
        const tempPassword = Math.random().toString(36).slice(-12);
        const passwordHash = await bcrypt.hash(tempPassword, 10);

        // Create merchant
        const merchantData = {
            business_name,
            display_name: business_name,
            owner_name,
            owner_email,
            phone: phone || '',
            address: address || '',
            dealer_id: dealer_id || null,
            status: 'trial',
            trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            subscription_plan: 'basic',
            onboarding_completed: false,
            settings: {
                timezone: 'America/New_York',
                currency: 'USD',
                tax_rate: 0.08,
                enable_chainlink_payments: false,
                kitchen_display: {
                    enabled: true
                },
                age_verification: {
                    enabled: true
                },
                online_ordering: {
                    enabled: true,
                    allow_cash_payment: true,
                    allow_pickup: true,
                    allow_delivery: true
                }
            }
        };

        console.log('Creating merchant:', merchantData);
        const merchant = await base44.asServiceRole.entities.Merchant.create(merchantData);
        console.log('Merchant created:', merchant.id);

        // Create owner user account
        const userData = {
            full_name: owner_name,
            email: owner_email,
            role: 'admin',
            merchant_id: merchant.id,
            dealer_id: dealer_id || null,
            pin: pin,
            password_hash: passwordHash,
            employee_id: `EMP-${Date.now()}`,
            is_active: true,
            permissions: [
                'process_orders',
                'manage_products',
                'manage_customers',
                'view_reports',
                'manage_settings',
                'manage_users',
                'submit_tickets',
                'manage_inventory'
            ]
        };

        console.log('Creating user:', { ...userData, pin: '******', password_hash: '******' });
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
                console.error('Error setting up demo menu:', demoError);
                // Don't fail the whole process if demo setup fails
            }
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
        console.error('createMerchantAccount error:', error);
        return Response.json({
            success: false,
            error: error.message || 'Failed to create merchant account'
        }, { status: 500 });
    }
});