const axios = require('axios');

let accessToken = null;

const authenticate = async () => {
  const response = await axios.post('https://payments.paypack.rw/api/auth/agents/authorize', {
    client_id: process.env.PAYPACK_CLIENT_ID,
    client_secret: process.env.PAYPACK_CLIENT_SECRET
  });
  accessToken = response.data.access;
  return accessToken;
};

const initiatePayment = async (phone, amount) => {
  const token = await authenticate();
  const response = await axios.post('https://payments.paypack.rw/api/transactions/cashin', {
    amount: amount,
    number: phone
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};

module.exports = { initiatePayment };