
const numberToThousandthInt = number => 
  Math.floor(number * 1000);

const thousandthIntToNumber = thInt => 
  thInt / 1000;

module.exports = {
  numberToThousandthInt,
  thousandthIntToNumber
}
