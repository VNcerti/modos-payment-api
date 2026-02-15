export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== "POST") {
    return res.status(200).json({ success: false, message: "Method not allowed" });
  }

  try {
    console.log("SEPAY WEBHOOK - Body:", req.body);

    const { content, transferAmount } = req.body;
    
    // URL Google Apps Script của bạn
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxNrOYyYgU5vCFPl81moXlDnvBt1XFzYwc2wdjrxS5MFAa4i_Gc8xrevpq-6E-GGok-/exec';

    if (!content) {
      return res.status(200).json({ success: false, message: "Missing content" });
    }

    // Initialize global orders if not exists
    global.orders = global.orders || [];

    // Find order with matching code and amount
    const order = global.orders.find(
      o => o.code === content && o.amount == transferAmount && o.status === "pending"
    );

    if (order) {
      order.status = "paid";
      order.paidAt = new Date().toISOString();
      console.log(`✅ Order ${order.code} marked as paid`);
      console.log(`💰 Amount: ${order.amount}`);
      console.log(`👤 Username (email): ${order.username}`);

      // Xác định số ngày dựa trên amount
      let durationDays = 30; // Mặc định 30 ngày
      let packageType = 'trial';
      
      // Map amount với số ngày tương ứng
      if (order.amount === 59000) {
        durationDays = 30;
        packageType = 'trial';
      } else if (order.amount === 129000) {
        durationDays = 90;
        packageType = 'basic';
      } else if (order.amount === 219000) {
        durationDays = 180;
        packageType = 'plus';
      } else if (order.amount === 249000) {
        durationDays = 365;
        packageType = 'premium';
      }
      
      console.log(`📦 Package: ${packageType}, Days: ${durationDays}`);

      // Gọi Google Apps Script để nâng cấp user
      try {
        console.log("Calling Google Script to upgrade user:", order.username);
        
        const upgradeResponse = await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'upgradeUser',
            data: {
              email: order.username, // username ở đây là email
              durationDays: durationDays
            }
          })
        });
        
        const upgradeResult = await upgradeResponse.json();
        console.log("Google Script upgrade response:", upgradeResult);
        
        if (upgradeResult.success) {
          console.log(`✅ User ${order.username} upgraded to ${packageType} successfully`);
        } else {
          console.error("❌ Google Script upgrade failed:", upgradeResult.message);
        }
        
      } catch (error) {
        console.error("❌ Error calling Google Script:", error);
      }
    } else {
      console.log(`❌ No pending order found for code: ${content}, amount: ${transferAmount}`);
    }

    // Always return success to SePay
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(200).json({ success: false, message: "Internal server error" });
  }
}
