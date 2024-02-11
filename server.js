require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nodeMailer = require('nodemailer');

const app = express();
const port = process.env.PORT || process.env.PORT_DEFAULT;

const user = process.env.USER_MAIL;
const pass = process.env.PASS;
const emailFrom = process.env.EMAIL_FROM;
const sendToEmail = process.env.SEND_TO_EMAIL;

/* Captura dados das requisições enviadas para o servidor no formato 
"application/x-www-form-urlencoded"(codificados na url enviada pelo formulário)
e coloca no objeto req.body do express */
app.use(bodyParser.urlencoded({extended: true}));

/* Captura dados das requisições enviadas para o servidor no formato "application/json"
e coloca no objeto req.body do express */
app.use(bodyParser.json());

// Rota para processar o envio do formulário
app.post("/enviar_email", function (req, res) {

    const {userName, userEmail, textArea} = req.body;

    const transporter = nodeMailer.createTransport({

        //Credenciais para autenticar o envio do e-mail
        service: process.env.SERVICE,
        auth: {
            user: user,
            pass: pass
        }
    });
    
    // Configura o e-mail de destino e o conteúdo da mensagem
    const mailOptions = {
        from: emailFrom,
        to: sendToEmail,
        subject: "Novo contato do formulário",
        text: `Nome: ${userName}\nE-mail: ${userEmail}\nMensagem: ${textArea}`
    };
    
    // Envia o e-mail
    transporter.sendMail(mailOptions, (error, info) => {

        if (error) {
            console.error(error);
            res.status(500).send(`<h1>Sinto muito ${userName}!</h1>\n❌ Algo deu errado e não foi possível enviar o e-mail 😭`);
        } else {
            console.info("E-MAIL ENVIADO COM SUCESSO =) " + info.response);
            res.status(200).send(`<h1 style="text-align:center">Obrigado pelo contato <span style="color:#0000ff">${userName}</span>!</h1>\n<p style="text-align:center">Sua mensagem foi enviada com sucesso para <strong>${sendToEmail}</strong> ✅</p>`);
        }
    });

});

app.listen(port, () => {
    console.info(`Servidor rodando em http://localhost:${port}/`);
});