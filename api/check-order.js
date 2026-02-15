export default function handler(req, res) {
  // Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    // Đọc từ query - frontend gửi là orderCode
    const { orderCode } = req.query;
    
    console.log("CHECK ORDER - orderCode:", orderCode);

    if (!orderCode) {
      return res.status(200).json({ 
        status: "not_found",
        message: "Missing orderCode parameter" 
      });
    }

    // Initialize global orders if not exists
    global.orders = global.orders || [];

    // Find order by code - tìm theo field code
    const order = global.orders.find(o => o.code === orderCode);

    if (!order) {
      return res.status(200).json({ 
        status: "not_found",
        message: "Order not found" 
      });
    }

    // Return order status
    return res.status(200).json({ 
      status: order.status || "pending",
      amount: order.amount,
      username: order.username,
      createdAt: order.createdAt
    });

  } catch (error) {
    console.error("Check order error:", error);
    return res.status(200).json({ 
      status: "error",
      message: "Internal server error" 
    });
  }
}
