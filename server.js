require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nodeMailer = require('nodemailer');
const rateLimit = require('express-rate-limit');

const app = express();
const port = process.env.PORT || process.env.PORT_DEFAULT;

// Define o rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // Limite de 5 requisições por IP
    message: "Você atingiu o limite de requisições ao servidor. Por questões de segurança, você só poderá tentar novamente daqui 15 minutos. Conto com sua compreenção."
});

// Aplica o rate limiter a todas as rotas
app.use(limiter);

// Configura o Express para confiar nos cabeçalhos enviados pelos proxies.
app.set('trust proxy', true);

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

        if (userName.length > 40 || 
            textArea.length > 1000 || 
            userEmail.length > 50) {
                console.log("Os campos NOME, E-MAIL ou MENSAGEM excederam a quantidade de caracteres permitida. ");
                return res.status(400).send("ATENÇÂO! O campo 'NOME' deve ter no máximo 40 caracteres e sua mensagem deve conter no máximo 1000 caracteres.");
        }

        if (error) {
            console.error(error);
            res.status(500).send(`<h1>Sinto muito ${userName}!</h1>\n❌ Algo deu errado e não foi possível enviar o e-mail 😭`);
        } else {
            console.info("E-MAIL ENVIADO COM SUCESSO =) " + info.response);
            res.status(200).send(`<h1 style="text-align:center">Obrigado pelo contato <span style="color:#0000ff">${userName}</span>!</h1>\n<p style="text-align:center">Sua mensagem foi enviada com sucesso para <strong>${sendToEmail}</strong> ✅</p><br>\n<br><a style="text-align:center" href="https://developer-gilberto.github.io/enviando-email-com-nodejs/">⬅️  Voltar para HOME</a>`);
        }
    });

});

app.listen(port, () => {
    console.info(`Servidor rodando em https://servernodejssendemail-production.up.railway.app/:${port}/`);
});