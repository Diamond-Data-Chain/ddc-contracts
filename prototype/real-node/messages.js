function createMessage(type, payload) {
  return {
    type,
    payload,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  createMessage
};
