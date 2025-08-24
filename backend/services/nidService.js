const axios = require('axios');

const getSsoToken = async () => {
  try {
    const response = await axios.post(process.env.SSO_URL, new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.SSO_CLIENT_ID,
      client_secret: process.env.SSO_CLIENT_SECRET,
      scope: process.env.SSO_SCOPE
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Error fetching SSO token:', error.response ? error.response.data : error.message);
    throw new Error('Failed to fetch SSO token');
  }
};

const validateNid = async (nid, token) => {
  try {
    const response = await axios.post(`${process.env.NID_API_URL}/search/byNid`, { nid }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error validating NID:', error.response ? error.response.data : error.message);
    throw new Error('Failed to validate NID');
  }
};

const checkNidState = async (token) => {
    try {
        const response = await axios.get(`${process.env.NID_API_URL}/state`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error checking NID state:', error.response ? error.response.data : error.message);
        throw new Error('Failed to check NID state');
    }
};

const isPhoneMatching = async (nid, phone, token) => {
    try {
        const response = await axios.post(`${process.env.NID_API_URL}/ismatching`, { nid, phone }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error checking if phone is matching:', error.response ? error.response.data : error.message);
        throw new Error('Failed to check if phone is matching');
    }
};

module.exports = {
  getSsoToken,
  validateNid,
  checkNidState,
  isPhoneMatching
};
