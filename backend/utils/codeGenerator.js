// Generate 6-digit verification code (like 123456)
export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Check if code is valid (6 digits)
export const isValidVerificationCode = (code) => {
  return /^\d{6}$/.test(code);
};

// Generate customer code (optional - for your other needs)
export const generateCustomerCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomPart = '';
  
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `CUST-${randomPart}`;
};

// Check if customer code is valid
export const isValidCustomerCode = (code) => {
  if (!code) return false;
  const regex = /^CUST-[A-Z0-9]{6}$/;
  return regex.test(code.toUpperCase());
};