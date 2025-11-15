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

        console.log('createMerchantAccount: Request body:', { business_name, owner_name, owner_email, phone, setup_demo_data });

        if (!business_name || !owner_name || !owner_email) {
            return Response.json({
                success: false,
                error: 'business_name, owner_name, and owner_email are required'
            }, { status: 400 });
        }

        const base44 = createClientFromRequest(req);

        // Check if user already exists
        console.log('createMerchantAccount: Checking for existing user with email:', owner_email);
        const existingUsers = await base44.asServiceRole.entities.User.filter({ email: owner_email });
        if (existingUsers && existingUsers.length > 0) {
            console.log('createMerchantAccount: User already exists');
            return Response.json({
                success: false,
                error: 'An account with this email already exists'
            }, { status: 400 });
        }

        // Generate a random 6-digit PIN
        const pin = Math.floor(100000 + Math.random() * 900000).toString();
        console.log('createMerchantAccount: Generated PIN');

        // Generate a temporary password
        const tempPassword = Math.random().toString(36).slice(-12);
        const passwordHash = await bcrypt.hash(tempPassword, 10);
        console.log('createMerchantAccount: Generated password hash');

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
                    allow_delivery: true,
                    min_order_amount: 0,
                    delivery_fee: 0,
                    delivery_radius_miles: 10
                },
                solana_pay: {
                    enabled: false,
                    network: 'mainnet',
                    wallet_address: '',
                    accepted_token: 'USDC',
                    display_in_customer_terminal: true
                }
            }
        };

        console.log('createMerchantAccount: Creating merchant...');
        const merchant = await base44.asServiceRole.entities.Merchant.create(merchantData);
        console.log('createMerchantAccount: Merchant created with ID:', merchant.id);

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
                'submit_tickets'
            ]
        };

        console.log('createMerchantAccount: Creating user...');
        const user = await base44.asServiceRole.entities.User.create(userData);
        console.log('createMerchantAccount: User created with ID:', user.id);

        // Set up demo data if requested
        if (setup_demo_data) {
            console.log('createMerchantAccount: Setting up demo menu...');
            try {
                await base44.asServiceRole.functions.invoke('setupDemoMenu', {
                    merchant_id: merchant.id
                });
                console.log('createMerchantAccount: Demo menu setup complete');
            } catch (demoError) {
                console.error('createMerchantAccount: Error setting up demo menu:', demoError);
                // Don't fail the whole process if demo setup fails
            }
        }

        console.log('createMerchantAccount: Account creation successful');

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
        console.error('createMerchantAccount: Fatal error:', error);
        console.error('createMerchantAccount: Error stack:', error.stack);
        return Response.json({
            success: false,
            error: error.message || 'Failed to create merchant account',
            details: error.stack
        }, { status: 500 });
    }
});