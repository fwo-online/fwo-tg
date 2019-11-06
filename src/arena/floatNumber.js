/**
 * Класс для float number
 * @param {String|Number} str входящая строка
 * @return {floatNumber} строка формата "0.00"
 */
const floatNumber = (str) => +parseFloat(str).toFixed(2);

module.exports = floatNumber;
