export default function handler(req, res) {

  const { code } = req.query;

  const order = global.orders?.find(o => o.code === code);

  res.json({
    status: order?.status || "not_found"
  });

}
