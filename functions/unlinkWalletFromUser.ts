import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { wallet_type, user_id } = await req.json();

    if (!wallet_type || !user_id) {
      return Response.json({
        success: false,
        error: 'wallet_type and user_id are required'
      }, { status: 400 });
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

    // Remove wallet from pos_settings
    const walletField = `${wallet_type}_wallet`;
    const updatedPosSettings = { ...(user.pos_settings || {}) };
    delete updatedPosSettings[walletField];

    await base44.asServiceRole.entities.User.update(user_id, {
      pos_settings: updatedPosSettings
    });

    // Log the action
    await base44.asServiceRole.entities.SystemLog.create({
      merchant_id: user.merchant_id || null,
      log_type: 'security',
      action: 'Wallet Unlinked',
      description: `User ${user.email} unlinked ${wallet_type} wallet`,
      user_id: user.id,
      user_email: user.email,
      severity: 'info'
    });

    return Response.json({
      success: true,
      message: 'Wallet unlinked successfully'
    });

  } catch (error) {
    console.error('unlinkWalletFromUser error:', error);
    return Response.json({
      success: false,
      error: error.message || 'Failed to unlink wallet'
    }, { status: 500 });
  }
});