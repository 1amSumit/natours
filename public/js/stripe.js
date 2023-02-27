import axios from 'axios';
import { showAlert } from './alert';

const stripe = Stripe(
  'pk_test_51Mf1iiSJYy9Yi6yXDT6It0sOaGz7b0JCUGCMMHudLVAumTC5ZpOSP6j2Pilr7rq4Br0ILNdbBfybjgA6VVcHe6Rh00SJqBkOp4'
);

export const bookTour = async (tourId) => {
  try {
    //1) Get checkout session from api
    const session = await axios(`/api/v1/booking/chechkout-session/${tourId}`);
    console.log(session);

    //2) Create checkout session form
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err.message);
    showAlert('error', err.message);
  }
};
