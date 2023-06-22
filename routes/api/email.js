import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();
/* GET home page. */

//Route POST to send an email body
router.post('/', async function (req, res, next) {
  try {
    const userInfo = req.body;
    const receiverEmail = process.env.EMAIL_USER;

    console.log(process.env.EMAIL_USER, process.env.EMAIL_PASSWD);

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER, // generated ethereal user
        pass: process.env.EMAIL_PASSWD // generated ethereal password
      }
    });

    const info = await transporter.sendMail({
      from: `"${userInfo.firstName} ${userInfo.lastName}" <${userInfo.email}>`, // sender address
      to: receiverEmail, // list of receivers
      subject: `New contact ${userInfo.firstName} ${userInfo.lastName} interetest`, // Subject line
      text: '', // plain text body
      html: `
      <p><b>E-mail: </b>${userInfo.email}</p>
      <p><b>First Name: </b>${userInfo.firstName}</p>    
      <p><b>Last Name: </b>${userInfo.lastName}</p>
      <p><b>Message: </b>${userInfo.message}</p>        
    ` // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    res.send('Send success!');
  } catch (error) {
    next(error);
  }
});

export default router;
