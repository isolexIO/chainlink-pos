import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import { PublicKey } from 'npm:@solana/web3.js@1.87.6';
import nacl from 'npm:tweetnacl@1.0.3';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { wallet_address, wallet_type, signature_data, user_id } = await req.json();

    if (!wallet_address || !wallet_type || !user_id) {
      return Response.json({
        success: false,
        error: 'wallet_address, wallet_type, and user_id are required'
      }, { status: 400 });
    }

    // Verify signature
    let signatureValid = false;

    if (wallet_type === 'phantom' || wallet_type === 'solflare') {
      try {
        const publicKey = new PublicKey(wallet_address);
        const messageBytes = new TextEncoder().encode(signature_data.message);
        const signatureBytes = new Uint8Array(signature_data.signature);

        signatureValid = nacl.sign.detached.verify(
          messageBytes,
          signatureBytes,
          publicKey.toBytes()
        );
      } catch (error) {
        console.error('Solana signature verification error:', error);
      }
    } else if (wallet_type === 'ethereum') {
      signatureValid = signature_data && signature_data.signature && signature_data.signature.length > 0;
    }

    if (!signatureValid) {
      return Response.json({
        success: false,
        error: 'Invalid wallet signature'
      }, { status: 401 });
    }

    // Check if wallet is already linked to another user
    const existingUsers = await base44.asServiceRole.entities.User.list();
    const walletField = `${wallet_type}_wallet`;
    
    for (const existingUser of existingUsers) {
      if (existingUser.id !== user_id && existingUser.pos_settings?.[walletField] === wallet_address) {
        return Response.json({
          success: false,
          error: 'This wallet is already linked to another account'
        }, { status: 400 });
      }
    }

    // Get current user
    const users = await base44.asServiceRole.entities.User.filter({ id: user_id });
    if (!users || users.length === 0) {
      return Response.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    const user = users[0];

    // Update user's pos_settings with wallet address
    const updatedPosSettings = {
      ...(user.pos_settings || {}),
      [walletField]: wallet_address
    };

    await base44.asServiceRole.entities.User.update(user_id, {
      pos_settings: updatedPosSettings
    });

    // Log the action
    await base44.asServiceRole.entities.SystemLog.create({
      merchant_id: user.merchant_id || null,
      log_type: 'security',
      action: 'Wallet Linked',
      description: `User ${user.email} linked ${wallet_type} wallet: ${wallet_address}`,
      user_id: user.id,
      user_email: user.email,
      severity: 'info'
    });

    return Response.json({
      success: true,
      message: 'Wallet linked successfully'
    });

  } catch (error) {
    console.error('linkWalletToUser error:', error);
    return Response.json({
      success: false,
      error: error.message || 'Failed to link wallet'
    }, { status: 500 });
  }
});