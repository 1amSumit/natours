const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `sumit kumar jha <${process.env.EMAIL_FROM}>`;
  }
  newTransporter() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    //render the pug file to make html
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        subject,
        firstName: this.firstName,
        url: this.url,
      }
    );

    //Mail options
    const mailOptions = {
      to: this.to,
      from: this.from,
      subject,
      text: htmlToText.convert(html),
      html,
    };

    //send mail using transport

    const res = await this.newTransporter().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  async passwordReset() {
    await this.send('passwordReset', 'Reset your password');
  }
};
