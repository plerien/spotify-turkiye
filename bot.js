const {Client, Attachment, Collection, MessageEmbed, Discord } = require("discord.js")
const client = new Client
const config = require('./config.json');
const db = require('quick.db')


client.login(config.token).then(console.log("Bot başarıyla giriş yaptı."))
client.on("ready", async () => {client.user.setPresence({ activity: { name: config.customstatus }, status: 'online' }).then(console.log(`Custom status ayarlandı`))});

client.on('message', async msg => {
  const reason = msg.content.split(" ").slice(1).join(" ");
  if (msg.author.id === '947790581806006292') return
  if (msg.channel.id === '944930416857595950') { 
    if(msg.author.bot) return
    
    if(msg.guild.channels.cache.get(await db.fetch(`destek_${msg.author.id}`))) {
      msg.delete()
      return msg.guild.channels.cache.get(await db.fetch(`destek_${msg.author.id}`)).send(`<@!${msg.author.id}> zaten bir destek talebin bulunmakta!`)
    } 
    if(msg.guild.channels.cache.get('944930416857595950')) {
      msg.guild.channels.create(`destek-${msg.author.tag}`, "text").then(async c => {
        db.set(`destek_${msg.author.id}`, c.id)
      const category = msg.guild.channels.cache.get('947807306198941696')
      c.setParent(category.id)
const role = msg.guild.roles.cache.find(r => r.id == "944930416480124960") 
let role2 = msg.guild.roles.cache.find(r => r.name === '@everyone')
      await c.createOverwrite(role, {
          SEND_MESSAGES: true,
          VIEW_CHANNEL: true,
          EMBED_LINKS: true,
          ATTACH_FILES: true
      });
      await c.createOverwrite(role2, {
          VIEW_CHANNEL: false
      });
      await c.createOverwrite(msg.author, {
          SEND_MESSAGES: true,
          VIEW_CHANNEL: true,
          EMBED_LINKS: true,
          ATTACH_FILES: true
      });

      const embed = new MessageEmbed()
      .setColor("GREEN")
      .setTitle(`Destek Botu`)
      .setDescription(`Talep sahibi: **${msg.author.tag}** \n\n Talep konusu: **${msg.content}** \n\n Destek takımımız en kısa sürede sana dönecektir. Bu süre zarfında beklemeni rica ediyorum. *Talebi kapatmak için !kapat yazabilirsiniz.*`)
      await c.send(`<@&944930416480124960>` , embed);
      msg.delete()
      db.set(`talep_${c.id}`, msg.content)
      db.set(`kullanici_${c.id}`, msg.author.id)
      }).catch(console.error);
    }
  }
});
  


client.on("message", message => {
if (message.content.toLowerCase() === "!kapat") {
    if (!message.channel.name.startsWith(`destek-`)) return
  
    let yetki = false;
  
    if (message.member.roles.cache.has("944930416480124960")) yetki = true;
    else yetki = false;
  
  if (yetki == false) return message.channel.send("Destek taleplerini yalnızca yetkililer kapatabilir.");
  
    if(message.author.bot) return
    var deneme = new MessageEmbed()
   .setColor("GREEN")
      .setDescription(`Destek talebini kapatmak için **30 saniye** içerisinde *evet* yazınız. *30 saniye sonra iptal edilecektir.*`)
    message.channel.send(deneme)
    .then((m) => {
      message.channel.awaitMessages(response => response.content.toLowerCase() === 'evet', {
        max: 1,
        time: 10000,
        errors: ['time'],
      })
      .then(async (collected) => {
          message.channel.delete();
          db.delete(`talep_${message.channel.id}`)
        })
        .catch(() => {
          m.edit('Destek talebini kapatma isteğin zaman aşımına uğradı!').then(m2 => {
              m2.delete();
          }, 3000);
        });
    });
}
});


