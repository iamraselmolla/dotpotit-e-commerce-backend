import httpStatus from "http-status";
import SSLCommerzPayment from "sslcommerz-lts";
const paymentCreate = async (req, res) => {
    const data = {
        total_amount: req.body.totalAmount,
        success_url: `${process.env.ROOT}/success`,
        fail_url: `${process.env.ROOT}/fail`,
        cancel_url: `${process.env.ROOT}/cancel`,
        ipn_url: `${process.env.ROOT}/ipn`,
        currency: 'BDT',
        tran_id: `REF${Date.now()}`, // use unique tran_id for each API call
        shipping_method: 'Courier',
        product_name: 'Computer',
        product_category: 'Electronic',
        product_profile: 'general',
        cus_name: 'Customer Name',
        cus_email: 'customer@example.com',
        cus_add1: 'Dhaka',
        cus_add2: 'Dhaka',
        cus_city: 'Dhaka',
        cus_state: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: '01711111111',
        cus_fax: '01711111111',
        ship_name: 'Customer Name',
        ship_add1: 'Dhaka',
        ship_add2: 'Dhaka',
        ship_city: 'Dhaka',
        ship_state: 'Dhaka',
        ship_postcode: 1000,
        ship_country: 'Bangladesh',
    };

    const sslcz = new SSLCommerzPayment(process.env.STORE_ID, process.env.STORE_PASS, false)
    sslcz.init(data).then(apiResponse => {
        if (apiResponse?.GatewayPageURL) {
            return res.status(httpStatus.OK).json({ url: apiResponse?.GatewayPageURL });
        } else {
            return res.status(httpStatus.BAD_REQUEST).json({
                success: false,
                error: apiResponse
            });
        }
    });
};

const success = async (req, res) => {
    console.log('success');
};
const cancel = async (req, res) => {
    console.log('cancel');
};
const fail = async (req, res) => {
    console.log('fail');
};
const ipn = async (req, res) => {
    console.log('ipn');
};
export default { paymentCreate, success, cancel, fail, ipn };