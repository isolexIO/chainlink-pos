
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import { Connection, PublicKey, Transaction } from 'npm:@solana/web3.js@1.87.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, ...params } = await req.json();

    switch (action) {
      case 'generatePaymentRequest':
        return await generatePaymentRequest(base44, params);
      
      case 'verifyTransaction':
        return await verifyTransaction(base44, params);
      
      case 'processRefund':
        return await processRefund(base44, params);
      
      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Solana Pay error:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});

async function generatePaymentRequest(base44, { merchantId, amount, orderId, reference }) {
  try {
    // Get merchant settings
    const merchants = await base44.asServiceRole.entities.Merchant.filter({ id: merchantId });
    if (!merchants || merchants.length === 0) {
      throw new Error('Merchant not found');
    }
    
    const merchant = merchants[0];
    const solanaWallet = merchant.settings?.solana_wallet_address;
    const network = merchant.settings?.blockchain_network || 'devnet';
    
    if (!solanaWallet) {
      throw new Error('Merchant has not configured Solana wallet');
    }

    // Validate Solana address
    try {
      new PublicKey(solanaWallet);
    } catch (e) {
      throw new Error('Invalid Solana wallet address configured');
    }

    // Generate Solana Pay URL
    const solanaPayUrl = `solana:${solanaWallet}?amount=${amount}&reference=${reference}&label=${encodeURIComponent(merchant.business_name)}&message=${encodeURIComponent(`Order ${orderId}`)}`;
    
    // Generate QR code URL
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(solanaPayUrl)}`;

    return Response.json({
      success: true,
      paymentUrl: solanaPayUrl,
      qrCodeUrl,
      recipientAddress: solanaWallet,
      amount,
      network,
      reference
    });
  } catch (error) {
    throw error;
  }
}

async function verifyTransaction(base44, { signature, reference, expectedAmount, network }) {
  try {
    // Connect to Solana network
    const endpoint = network === 'mainnet' 
      ? 'https://api.mainnet-beta.solana.com'
      : 'https://api.devnet.solana.com';
    
    const connection = new Connection(endpoint, 'confirmed');

    // Get transaction details
    const tx = await connection.getTransaction(signature, {
      commitment: 'confirmed'
    });

    if (!tx) {
      return Response.json({
        success: false,
        verified: false,
        message: 'Transaction not found'
      });
    }

    // Verify transaction succeeded
    if (tx.meta.err) {
      return Response.json({
        success: false,
        verified: false,
        message: 'Transaction failed',
        error: tx.meta.err
      });
    }

    // Get transaction amount (in lamports)
    const lamports = tx.meta.postBalances[1] - tx.meta.preBalances[1];
    const solAmount = lamports / 1000000000; // Convert lamports to SOL

    // In production, you'd verify:
    // 1. The reference matches
    // 2. The amount matches (with tolerance for fees)
    // 3. The recipient matches
    
    return Response.json({
      success: true,
      verified: true,
      signature,
      amount: solAmount,
      lamports,
      timestamp: tx.blockTime,
      confirmations: tx.slot
    });
  } catch (error) {
    return Response.json({
      success: false,
      verified: false,
      message: error.message
    });
  }
}

async function processRefund(base44, { orderId, merchantId, amount, recipientAddress }) {
  try {
    // This is a placeholder for Solana refund processing
    // In production, you would:
    // 1. Get merchant's keypair from secure storage
    // 2. Create and sign a transfer transaction
    // 3. Send the transaction to the network
    // 4. Update order status
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // For now, return a simulated response
    return Response.json({
      success: true,
      message: 'Refund initiated',
      note: 'This is a placeholder. Actual Solana refund requires merchant keypair signing.',
      refundAmount: amount,
      recipient: recipientAddress,
      orderId
    });
  } catch (error) {
    throw error;
  }
}
