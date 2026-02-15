export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { code, amount, username } = req.body;

  global.orders = global.orders || [];

  global.orders.push({
    code,
    amount,
    username,
    status: "pending"
  });

  res.json({ success: true });

}
