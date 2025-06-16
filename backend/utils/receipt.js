const generateReceipt = (transaction) => {
  const { items, total, cash_paid, change, date } = transaction;
  const savings = items
    .reduce(
      (sum, item) => sum + (item.packet_price - item.special_price) * item.quantity,
      0
    )
    .toFixed(2);

  return {
    shop_name: 'Grocery Shop Name',
    date,
    items: items.map((item) => ({
      name: item.is_custom ? `${item.name} (Custom)` : item.name,
      quantity: item.quantity,
      packet_price: item.packet_price.toFixed(2),
      special_price: item.special_price.toFixed(2),
      total: (item.special_price * item.quantity).toFixed(2),
      category: item.category,
      unit: item.unit
    })),
    total: total.toFixed(2),
    cash_paid: cash_paid.toFixed(2),
    change: change.toFixed(2),
    savings
  };
};

module.exports = { generateReceipt };