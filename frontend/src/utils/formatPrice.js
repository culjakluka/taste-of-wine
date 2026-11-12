// "€22" for whole amounts, "€22.50" otherwise
const formatPrice = (amount) => {
  if (Number.isInteger(amount)) {
    return `€${amount}`;
  }
  return `€${amount.toFixed(2)}`;
};

export default formatPrice;
