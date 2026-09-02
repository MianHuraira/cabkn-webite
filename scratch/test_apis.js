const axios = require('axios');

async function test() {
  try {
    const toursRes = await axios.get('https://api.cabkn.com/api/tours/public/1');
    console.log('--- TOURS ---');
    console.log('Keys:', Object.keys(toursRes.data));
    console.log('Tours length:', toursRes.data.tours?.length);
    if (toursRes.data.tours?.length) {
      console.log('Sample Tour:', JSON.stringify(toursRes.data.tours[0], null, 2));
    }

    const servicesRes = await axios.get('https://api.cabkn.com/api/top-services/public/1');
    console.log('--- TOP SERVICES ---');
    console.log('Keys:', Object.keys(servicesRes.data));
    console.log('Services length:', servicesRes.data.services?.length);
    if (servicesRes.data.services?.length) {
      console.log('Sample Service:', JSON.stringify(servicesRes.data.services[0], null, 2));
    }
  } catch (err) {
    console.error('Error:', err.message, err.response?.data);
  }
}

test();
