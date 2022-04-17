const qrcode = require("qrcode-terminal");
const { Client, MessageMedia } = require("whatsapp-web.js");
const { commands } = require("./utils/commands");
const { deleteFile } = require('./utils/file');
const { getVideoIDBySearchValue, downloadMP3 } = require('./scrapers/yt-mp3');
const client = new Client();

client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true})
});


client.on('ready', () => {
    console.log("Ready!");
});

client.on('message', async msg => {
    try {
        const chatId = msg.from;
        const chat = await client.getChatById(chatId);
        if(commands.sticker.test(msg.body) && msg.hasMedia) { 
            const media = await msg.downloadMedia();
            chat.sendMessage(media, { sendMediaAsSticker: true });
        }
        if(commands.mp3.test(msg.body)) {
            const [command, ...rest] = msg.body.split(' ');
            const searchValueOrLink = rest.join(' ');
            const videoID = await getVideoIDBySearchValue(searchValueOrLink);
            const mp3 = await downloadMP3(videoID);
            const media = MessageMedia.fromFilePath(mp3.file);
            await msg.reply(media);
            deleteFile(mp3.file);
        }
        if(chat.isGroup) {
            const contact = await msg.getContact();
            const participants = chat.participants;
            const withoutAdmins = participants.filter(participant => !participant.isAdmin);
            const author = participants.find(participant => participant.id._serialized == contact.id._serialized)
            const iHaveAdmin = participants.find(participant => participant.id._serialized == client.info.wid._serialized).isAdmin;
            const isAdminOrMe = author.isAdmin || author.id._serialized == '5491135181650@c.us';
            if(commands.everyone.test(msg.body) && chat.isGroup && isAdminOrMe) {
                msg.reply('_*COMUNICADO PARA LOS MIEMBROS*_ \n\n' + withoutAdmins.map(a => `@${a.id.user}`).join(' '), null, {
                    mentions: withoutAdmins
                });
            }
            if(commands.ban.test(msg.body) && chat.isGroup && msg.hasQuotedMsg && isAdminOrMe && iHaveAdmin) {
                const quotedMsg = await msg.getQuotedMessage();
                const quotedAuthor = await quotedMsg.getContact();
                await chat.removeParticipants([quotedAuthor.id._serialized]);
            }
            if(commands.unban.test(msg.body) && chat.isGroup && msg.hasQuotedMsg && isAdminOrMe && iHaveAdmin) {
                const quotedMsg = await msg.getQuotedMessage();
                const quotedAuthor = await quotedMsg.getContact();
                await chat.removeParticipants([quotedAuthor.id._serialized]);
            }
        }
    } catch(e) {
        client.sendMessage('5491135181650@c.us', JSON.stringify(e))
    }
});

client.on('group_join', async (notification) => {
    const chatID = notification.id.remote;
    const contactID = notification.id.participant;
    const chat = await client.getChatById(chatID);
    const contact = await client.getContactById(contactID);
    const profilePicUrl = await contact.getProfilePicUrl();
    if(profilePicUrl) {
        const media = await MessageMedia.fromUrl(profilePicUrl);
        chat.sendMessage(`*Hola, @${contact.id.user}!*\nBienvenido a _*${chat.name}*_!!!\n\nLee las reglas\n\n${chat.description}`, {
            media,
            mentions: [contact]
        });
    } else {
        chat.sendMessage(`*Hola, @${contact.id.user}!*\nBienvenido a _*${chat.name}*_!!!\n\nLee las reglas\n\n${chat.description}`, {
            mentions: [contact]
        });
    }
})

client.initialize();