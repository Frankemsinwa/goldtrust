const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendOTP = async (email, otp) => {
    const mailOptions = {
        from: `"GoldTrust Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verify Your Email - GoldTrust',
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #d4af37; margin: 0;">GOLDTRUST</h1>
                    <p style="color: #666; font-size: 14px; letter-spacing: 2px;">PREMIUM INVESTMENT PLATFORM</p>
                </div>
                <div style="background-color: #f9f9f9; padding: 30px; border-radius: 8px; text-align: center;">
                    <h2 style="color: #333; margin-top: 0;">Verify Your Email</h2>
                    <p style="color: #555; font-size: 16px;">Use the code below to complete your verification process. This code will expire in 10 minutes.</p>
                    <div style="background-color: #fff; border: 2px dashed #d4af37; padding: 20px; margin: 30px 0; display: inline-block;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #333;">${otp}</span>
                    </div>
                    <p style="color: #888; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
                </div>
                <div style="text-align: center; margin-top: 30px; color: #aaa; font-size: 12px;">
                    &copy; ${new Date().getFullYear()} GoldTrust Assets Management. All rights reserved.
                </div>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('[MAIL] Error sending OTP:', error);
        return false;
    }
};

const sendInvestmentConfirmation = async (email, fullName, packageName, amount, yieldRate) => {
    const mailOptions = {
        from: `"GoldTrust Private Wealth" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Investment Confirmation - GoldTrust Imperial',
        html: `
            <div style="font-family: 'Times New Roman', Times, serif; max-width: 600px; margin: auto; background-color: #050505; color: #fff; padding: 40px; border: 1px solid #1a1a1a;">
                <div style="text-align: center; margin-bottom: 40px; border-bottom: 1px solid #d4af37; padding-bottom: 20px;">
                    <h1 style="color: #d4af37; margin: 0; font-size: 28px; letter-spacing: 4px;">GOLDTRUST</h1>
                    <p style="color: #888; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin-top: 5px;">Imperial Holdings • Zurich • Singapore • New York</p>
                </div>
                
                <div style="margin-bottom: 40px;">
                    <h2 style="color: #fff; font-weight: 300; font-size: 20px;">Dear ${fullName},</h2>
                    <p style="color: #ccc; line-height: 1.6; font-size: 15px;">We are pleased to confirm that your investment request has been successfully executed on the GoldTrust institutional ledger. Your capital is now deployed within our managed strategies.</p>
                </div>

                <div style="background: linear-gradient(135deg, #111, #1a1a1a); padding: 30px; border-left: 3px solid #d4af37; border-radius: 4px; margin-bottom: 40px;">
                    <div style="margin-bottom: 20px;">
                        <span style="color: #888; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; display: block;">Asset Class / Package</span>
                        <span style="color: #fff; font-size: 18px; font-weight: bold;">${packageName}</span>
                    </div>
                    <div style="display: flex; gap: 40px;">
                        <div style="flex: 1;">
                            <span style="color: #888; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; display: block;">Principal Amount</span>
                            <span style="color: #d4af37; font-size: 22px; font-weight: bold;">$${parseFloat(amount).toLocaleString()}</span>
                        </div>
                        <div style="flex: 1;">
                            <span style="color: #888; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; display: block;">Expected Yield</span>
                            <span style="color: #4ade80; font-size: 22px; font-weight: bold;">${yieldRate}</span>
                        </div>
                    </div>
                </div>

                <p style="color: #888; font-size: 13px; line-height: 1.5;">Your dashboard has been updated to reflect this transaction. You may monitor your portfolio's performance, accruals, and global market position in real-time through our Private Wealth Portal.</p>
                
                <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #1a1a1a; text-align: center;">
                    <p style="color: #555; font-size: 11px;">This is a private transmission. Your capital is secured under our Grade-A sovereign custody protocols. GoldTrust Imperial Holdings Limited is regulated by the Global Finance Authority.</p>
                    <p style="color: #333; font-size: 10px; margin-top: 20px;">&copy; ${new Date().getFullYear()} GOLDTRUST IMPERIAL HOLDINGS. ALL RIGHTS RESERVED.</p>
                </div>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('[MAIL] Error sending Investment Confirmation:', error);
        return false;
    }
};

const sendPasswordReset = async (email, otp) => {
    const mailOptions = {
        from: `"GoldTrust Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Reset Your Password - GoldTrust',
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #d4af37; margin: 0;">GOLDTRUST</h1>
                    <p style="color: #666; font-size: 14px; letter-spacing: 2px;">PREMIUM INVESTMENT PLATFORM</p>
                </div>
                <div style="background-color: #f9f9f9; padding: 30px; border-radius: 8px; text-align: center;">
                    <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
                    <p style="color: #555; font-size: 16px;">Use the code below to reset your account password. This code will expire in 10 minutes.</p>
                    <div style="background-color: #fff; border: 2px dashed #d4af37; padding: 20px; margin: 30px 0; display: inline-block;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #333;">${otp}</span>
                    </div>
                    <p style="color: #888; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
                </div>
                <div style="text-align: center; margin-top: 30px; color: #aaa; font-size: 12px;">
                    &copy; ${new Date().getFullYear()} GoldTrust Assets Management. All rights reserved.
                </div>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('[MAIL] Error sending Password Reset OTP:', error);
        return false;
    }
};

module.exports = { sendOTP, sendInvestmentConfirmation, sendPasswordReset };

