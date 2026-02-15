export default function handler(req, res) {

  const { content, transferAmount } = req.body;

  const order = global.orders?.find(
    o => o.code === content && o.amount == transferAmount
  );

  if (order) {
    order.status = "paid";
  }

  res.json({ success: true });

}
