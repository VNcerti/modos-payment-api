export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
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
    console.log("CREATE ORDER BODY:", req.body);
    
    // Đọc từ body - frontend gửi field là orderCode
    const { orderCode, amount, username } = req.body;

    // Validate required fields
    if (!orderCode || !amount || !username) {
      return res.status(200).json({ 
        success: false, 
        message: "Missing required fields: orderCode, amount, username" 
      });
    }

    // Initialize global orders array if not exists
    global.orders = global.orders || [];

    // Add order to memory - lưu với tên field là code để đồng bộ
    global.orders.push({
      code: orderCode,           // Lưu là code để các file khác dùng chung
      amount: amount,
      username: username,        // Đây là email của user
      status: "pending",
      createdAt: new Date().toISOString()
    });

    console.log("Order created successfully:", orderCode);
    console.log("Total orders:", global.orders.length);

    // Always return 200 with success true
    return res.status(200).json({ 
      success: true, 
      message: "Order created successfully" 
    });

  } catch (error) {
    console.error("Create order error:", error);
    return res.status(200).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
}
