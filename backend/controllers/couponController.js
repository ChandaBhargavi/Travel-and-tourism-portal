const pool = require('../config/db');

/**
 * Validate and apply promo coupon code
 */
const applyCoupon = async (req, res, next) => {
    try {
        const { code, booking_amount } = req.body;

        if (!code || !code.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Coupon code is required.'
            });
        }

        const amount = parseFloat(booking_amount);
        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid booking amount is required to apply coupon.'
            });
        }

        const cleanCode = code.trim().toUpperCase();

        const [coupons] = await pool.query(
            'SELECT * FROM coupons WHERE code = ? AND is_active = TRUE',
            [cleanCode]
        );

        if (coupons.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Invalid or expired coupon code.'
            });
        }

        const coupon = coupons[0];
        const minAmount = parseFloat(coupon.min_booking_amount);

        if (amount < minAmount) {
            return res.status(400).json({
                success: false,
                message: `Coupon '${cleanCode}' requires a minimum booking amount of ₹${minAmount.toLocaleString('en-IN')}.`
            });
        }

        let discount_amount = 0;
        if (coupon.discount_type === 'percentage') {
            discount_amount = (amount * parseFloat(coupon.discount_value)) / 100;
        } else {
            discount_amount = parseFloat(coupon.discount_value);
        }

        // Cap discount at total amount
        if (discount_amount > amount) {
            discount_amount = amount;
        }

        discount_amount = parseFloat(discount_amount.toFixed(2));
        const final_amount = parseFloat((amount - discount_amount).toFixed(2));

        return res.status(200).json({
            success: true,
            message: `Coupon '${cleanCode}' applied successfully! Saved ₹${discount_amount.toLocaleString('en-IN')}.`,
            code: cleanCode,
            discount_amount,
            final_amount
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    applyCoupon
};
