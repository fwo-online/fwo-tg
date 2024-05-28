import _ from 'lodash';

const sum = (a, b) => {
  if (_.isObject(b)) {
    return _.assignWith(a, b, sum);
  }
  if (_.isNil(a)) {
    return +b;
  }
  return +a + +b;
};

export const assignWithSum = (a, b) => _.assignWith(a, b, sum);
