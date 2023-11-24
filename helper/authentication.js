const nodemailer = require("nodemailer");
const OTP = require("../models/OTP");
require('dotenv').config();
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.OFFICIAL_EMAIL,
    pass: process.env.APP_PASS
  }
}); 
 
 // Send OTP to user
 function sendWelcomeMail(name, email, official_email) {

  const mailOptions = {
    from: official_email,
    to: email,
    subject: 'Welcome to Youth Story!',
    text: 'Text content of your email',
    html: `
    <p>Dear <strong>${name}</strong>,</p><br>
    <p>Welcome to Youth Story! We're thrilled to have you join our community of ambitious individuals who are determined to make a mark and achieve great heights at a young age.
    <br>
    At Youth Story, we believe in the power of stories and the inspiration they hold. Our platform offers a wealth of resources, knowledge, and opportunities to help you navigate your path to success. <br>Here's a quick overview of what you can expect:
    <br><br>
    <strong>Inspiring Magazines</strong>: Access our exclusive collection of magazines featuring insightful articles, success stories, and interviews with young achievers. Learn from their experiences, strategies, and tips to fuel your aspirations.
    <br><br>
    <strong>Success Stories and Blogs</strong>: Dive into our treasure trove of success stories and blogs that showcase remarkable achievements of young individuals. Get inspired by their journeys, challenges, and triumphs as they share valuable insights.
    <br><br>
    <strong>Empowering Interviews</strong>: Gain valuable insights from in-depth interviews with young achievers who have excelled in their fields. Discover their secrets, strategies, and the mindset that helped them reach great heights at a young age.
    <br><br>
    <strong>Social Forum</strong>: Connect with like-minded individuals through our vibrant social forum. Set goals, track your progress, and engage with the community by sharing your achievements, challenges, and milestones.
    <br><br>
    We're here to support you every step of the way. If you have any questions, need guidance, or want to share feedback, our dedicated support team is ready to assist you.
    <br><br>
    Get ready to embark on an incredible journey of personal growth, inspiration, and achievement. Your story is worth sharing, and we can't wait to witness your progress and success.
    <br><br>
    Once again, welcome to Youth Story! Start exploring, connecting, and charting your path to greatness.
    <br><br>
    Best regards,<br>
    Youth Story team</p>
    `
  };

  transporter.sendMail(mailOptions)
  .then(info => {
    return 1;
  })
  .catch(error => {
    return 0;
  });
  
  }

async function createNewUser(req, res, jwt, User, OTP, bcrypt, official_email, app_pass) {

    try {
      const {name, username, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(409).json({ error: 'Username taken' });
      }
  
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create a random 6-digit OTP
      const otp = generateOTP();

      const response = sendOTP(email, otp, official_email, app_pass);

      if (response)
      {
        // Create a new user
      const newUser = new User({  name:name, username: username, email, password: hashedPassword, isVerified: false });
      await newUser.save();
        const newOTP = new OTP({userID: newUser._id, otp: otp});
        await newOTP.save();
        if (newOTP) 
          return res.status(200).json({ message: `OTP sent to ${email}` });
      }

      return res.status(500).json({error: 'An error occurred, OTP could not be sent.'});
        
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'Our servers are experiencing heavy traffic, please try again later' });
    }
  }

  async function loginUser(req, res, jwt, User, bcrypt) {
    try {
        const {  email, password } = req.body;

        // if (mode == 1)
        // {
        //   const checkUser = await User.findOne({email: email});
        //   if (!checkUser)
        //   {
        //     const newUser = await new User({name: name, email: email, password: -1, username: '-1', mode: 1});
        //     newUser.save();
        //   }
        // }
      
        // if (mode == 0) {
          // Find the user by email
          const userC = await User.findOne({ email });
          if (!userC) {
            return res.status(401).json({ error: 'Invalid credentials' });
          }
          // Compare passwords
          const isMatch = await bcrypt.compare(password, userC.password);
          if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
          }
        // }
    
        // Generate JWT token
        let user;
        // if (mode == 0)
        // {
        //   user = await User.findOne({username: username});
        // }
        // else
        // {
          user = await User.findOne({email: email});
        // }
        const token = jwt.sign({ user: user._id }, process.env.JWT_SECRET, {
          expiresIn: '30d', // Set token expiration based on rememberMe value
        });
    
        res.json({ token });
      } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Our servers are experiencing heavy traffic, please try again.' });
      }
  }
  
// Generate OTP
function generateOTP() {
  const digits = '123456789'; 
  let OTP = digits[Math.floor(Math.random() * 9)];
  
  for (let i = 1; i < 6; i++) {
    OTP += digits[Math.floor(Math.random() * 9)];
  }
  
  return OTP;
  
  }
  
  // Send OTP to user
 async function sendOTP(email, otp, official_email, app_pass) {
   
  const mailOptions = {
    from: official_email,
    to: email,
    subject: 'OTP for Verification - Youth Story',
    text: 'Text content of your email',
    html: ` <p>Welcome to Youth Story! We're thrilled to have you join our community of ambitious individuals who are determined to make a mark and achieve great heights at a young age.
    <br><br>
    Here is your OTP: <strong>${otp}</strong>
    <br><br>
    Best regards,<br>
    Youth Story team</p>`
  };

  transporter.sendMail(mailOptions)
  .then(info => {
    return 1;
  })
  .catch(error => {
    return 0;
  });

  }
  
  async function requestOTP(req, res, OTP, User, official_email, app_pass, type) {
    const { email } = req.body;

    let foundUser = await User.findOne({email: email});

    if (!foundUser)
    {
      return res.status(409).json({message: "User doesn't exist"});
    }

    if (foundUser.isVerified == true && type == "signUp")
        {
          return res.status(409).json({"message": "Account is already verfiied"});
        }
        else if (foundUser.isVerified == false && type == "forgotPassword")
        {
          return res.status(409).json({"message": "Account is not verfiied"});
        }
   
    foundOTP = await OTP.findOne({ userID: foundUser._id});
    if (foundOTP)
    {
        await OTP.deleteMany({userID: foundUser._id});
    }
  
    try {
      // Generate OTP
      const otp = generateOTP();
  
      // Send OTP to user's email
      const response = await sendOTP(email, otp, official_email, app_pass);
      if (response == 0)
      {
        return res.status(500).json({ error: 'Failed to send OTP' });
      }
  
      // Store the OTP and associated email
      const newOTP = new OTP({ userID: foundUser._id, otp: otp });
      await newOTP.save();
  
      res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to send OTP' });
    }
  }
  
  async function verifyOTP(req, res, User, OTP, type) {
    const { email, otp } = req.body;
  
    try {
      // Retrieve the stored OTP for the email
      const user = await User.findOne({ email: email });

      if (!user)
        return res.status(409).json({message: `User not found`});

        if (user.isVerified == true && type == "signUp")
        {
          return res.status(409).json({"message": "Account is already verfiied"});
        }
        else if (user.isVerified == false && type == "forgotPassword")
        {
          return res.status(409).json({"message": "Account is not verfiied"});
        }

      const storedOtp = await OTP.findOne({ userID: user._id });
  
      if (!storedOtp) {
        return res.status(400).json({ error: 'OTP expired' });
      }
  
      if (storedOtp.otp != otp) {
        return res.status(400).json({ error: 'Incorrect OTP' });
      }
  
        await OTP.deleteMany({ userID: user._id });

      if (type == "signUp") {
        sendWelcomeMail(user.name, user.email, process.env.OFFICIAL_EMAIL);
        user.isVerified = true;
        await user.save();
      }
      
      res.status(200).json({ message: 'OTP Verified' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to verify OTP' });
    }
  }

  async function forgotPassword(req, res, User, bcrypt) {
    const { newPassword, confirmPassword, email } = req.body;
    
    if (newPassword.trim().length < 8 || newPassword.includes(' ')) {
      return res.status(400).json({ error: 'Password must be atleast 8 characters long and without spaces' });
    } else if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }
    
    try {
      const user = await User.findOne({ email: email });
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await user.updateOne({ password: hashedPassword });
      await user.save();
    
      return res.status(200).send('Password Changed Successfully');
    }
    catch(error)
    {
      return res.status(500).send('Something Went Wrong');
    }
  }  

  module.exports = {
    createNewUser: createNewUser,
    loginUser: loginUser,
    requestOTP: requestOTP,
    verifyOTP: verifyOTP,
    forgotPassword: forgotPassword,
  }