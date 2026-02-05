import nodemailer from "nodemailer";

const sendEmail = async (to, subject, text) => {
  try {
  
    
    // Check if email credentials exist
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log("⚠️ Email credentials not found. Email not sent.");
      return false;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"IdeaXLab Admin" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    
  } catch (error) {
    console.error("❌ Email send failed:", error.message);
    return false;
  }
};

export default sendEmail;