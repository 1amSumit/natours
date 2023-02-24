import axios from 'axios';
const stripe = Stripe(
  'pk_test_51Mf1iiSJYy9Yi6yXDT6It0sOaGz7b0JCUGCMMHudLVAumTC5ZpOSP6j2Pilr7rq4Br0ILNdbBfybjgA6VVcHe6Rh00SJqBkOp4'
);

export const bookTour = async (tourId) => {
  const session = await axios(
    `http://127.0.0.1/api/vi/booking/checkout-session/${tourId}`
  );
  console.log(session);
};
