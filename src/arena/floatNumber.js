/**
 * Класс для float number
 * @param {String|Number} str входящая строка
 * @return {Number} строка формата "0.00"
 */
const floatNumber = (str) => +parseFloat(str).toFixed(2);

module.exports = floatNumber;
