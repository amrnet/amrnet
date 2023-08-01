import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();
/* GET home page. */

//Route POST to send an email body
router.post('/', async function (req, res, next) {
  try {
    const userInfo = req.body;
    const receiverEmail = process.env.EMAIL_USER;
    const receiverPass = process.env.EMAIL_PASSWD;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: receiverEmail,
        pass: receiverPass
      }
    });

    const mailOptions = await transporter.sendMail({
      from: userInfo.email, // sender address
      to: receiverEmail, // list of receivers
      subject: `New contact ${userInfo.firstName} ${userInfo.lastName} interested`, // Subject line
      text: '', // plain text body
      html: `
      <p><b>E-mail: </b>${userInfo.email}</p>
      <p><b>First Name: </b>${userInfo.firstName}</p>    
      <p><b>Last Name: </b>${userInfo.lastName}</p>
      <p><b>Message: </b>${userInfo.message}</p>        
    ` // html body
    });

    console.log('Message sent: %s', mailOptions.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(mailOptions));

    res.send('Send success!');
  } catch (error) {
    next(error);
  }
});

export default router;
