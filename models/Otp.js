const DB = require("../configs/database");

const getCollection = async () => (await DB.getDb()).collection("otps");

const init = async () => {
    const otps = await getCollection();
    await otps.createIndexes([
        { key: { phone: 1 }, name: "otps_by_phone" },
        // TTL Index: MongoDB will automatically delete documents when 'expireAt' is reached!
        { key: { expireAt: 1 }, name: "auto_delete_expired_otps", expireAfterSeconds: 0 }
    ]);
};

const create = async (phone, code, minutes) => {
    const otps = await getCollection();
    
    // Remove any existing OTP for this phone so they don't overlap
    await otps.deleteMany({ phone });
    
    const expireAt = new Date(Date.now() + minutes * 60 * 1000);
    
    const otp = { phone, code, expireAt, uses: 0 };
    await otps.insertOne(otp);
    return otp;
};

// Verify OTP
const verify = async (phone, code, maxUses = 3) => {
    const otps = await getCollection();
    
    const otp = await otps.findOne({ phone });

    // If no match or expired or too many uses
    if (!otp) return { success: false, reason: "invalid" };
    if (otp.expireAt < new Date()) return { success: false, reason: "expired" };
    if (otp.uses >= maxUses) return { success: false, reason: "max_attempts" };
    if (otp.code !== code) {
        // Increment the failed attempt counter
        await otps.updateOne({ _id: otp._id }, { $inc: { uses: 1 } });
        return { success: false, reason: "invalid" };
    }

    // If it's correct, delete it immediately so it can't be reused
    await otps.deleteOne({ _id: otp._id });
    
    return { success: true };
};

module.exports = { init, create, verify };