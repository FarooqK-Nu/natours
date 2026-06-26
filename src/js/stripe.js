/* eslint-disable */
import axios from './axios.js';
import { showAlert } from './alerts.js';

const stripePublicKey =
  'pk_test_51TmbSSIPZsGSHhypkyWfR84I8xNr5vsV8NCF9PAPD5xNV2Iju56vjXrv4RsmmlRMGeJqhSma4pqwrpBu6swod3Ul001SQYQPeT';

export const bookTour = async (tourId) => {
  try {
    const stripe = Stripe(stripePublicKey);

    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    // console.log(session);

    // 2) Create checkout form + chanre credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
    return true;
  } catch (err) {
    console.log(err);
    const message = err.response?.data?.message || err.message || String(err);
    showAlert('error', message);
    return false;
  }
};
