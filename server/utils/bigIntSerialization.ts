const setupBigIntSerialization = () => {
  BigInt.prototype.toJSON = function () {
    return Number(this);
  }
}

export default setupBigIntSerialization;