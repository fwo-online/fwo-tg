/* eslint-disable */
function safe(message?: string) {
  return (target, key: string, descriptor: PropertyDescriptor): PropertyDescriptor => {
    const originalMethod = descriptor.value;

    descriptor.value = async function value(...args) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        console.log(`\x1b[31mFail on ${target.name}.${key}:${message ?? ''}\x1b[0m`, error);
      }
    };

    return descriptor;
  };
}

export default safe;
