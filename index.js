const express = require("express");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");

if (process.env.NODE_ENV === "development") {
  require("dotenv").config({
    path: ".env",
  });
}

const {
  CLIENT_ID,
  CLIENT_SECRET,
  REFRESH_TOKEN,
  REDIRECT_URL,
  EMAIL_USER,
  EMAIL_RECEIVER,
  PORT,
} = process.env;

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

app.post("/email", async (req, res) => {
  const { recipientEmail, emailSubject, emailText } = req.body;
  const emailOptions = {
    from: EMAIL_USER,
    to: recipientEmail || EMAIL_RECEIVER,
    subject: emailSubject || "Test email",
    text: emailText || "Test email",
  };

  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: EMAIL_USER,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken,
      },
    });

    await transporter.sendMail(emailOptions);
    res.sendStatus(200);
  } catch (e) {
    res.sendStatus(500);
  }
});

app.listen(PORT || 3000, () =>
  console.log(`Listening on port ${PORT || 3000}`)
);
