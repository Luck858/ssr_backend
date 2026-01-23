import jwt from 'jsonwebtoken';

const generateToken = (userId, email, role) => {
  return jwt.sign(
    {
      id: userId,
      email: email,
      role: role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE,
    }
  );
};

export default generateToken;
