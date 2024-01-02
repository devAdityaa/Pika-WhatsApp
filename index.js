const fs = require("fs");
const axios = require('axios');
const request = require("request");
const uuid = require("uuid");
const Filter = require('bad-words')
const qrcode = require("qrcode-terminal");
const {
    Client,
    LocalAuth,
    MessageMedia
} = require("whatsapp-web.js");

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
		args: ['--no-sandbox'],
        headless:true,
        executablePath:'./chrome/linux-122.0.6215.0/chrome-linux64/chrome'
	}
});

const filter = new Filter();
const filterWords = ["Chodon","Chod","Birjo","Gud","Dudu","choda","bokachoda"]
filter.addWords(...filterWords)


client.initialize();

client.on("qr", (qr) => {
    qrcode.generate(qr, {
        small: true
    });
});

client.on("authenticated", () => {
    console.log("AUTHENTICATED");
});

client.on("ready", () => {
    console.log("Client is ready!");
});
const checkImage= async (url) =>{
    try {
        const res = await fetch(url);
        const buff = await res.blob();
        return buff.type.startsWith("image/");

    } catch (err) {
        return 0;
        
    }

}

const sendImage = async(arr,message)=>{

    
}

async function delay(time) {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    });
}


const pika = async(query,message)=>{
    const id = uuid.v4()
    const serverUrl = 'https://pikaapi-test.onrender.com/stream-video';
    const reqObj ={
    prompt: query,
    id: "supa"
};
console.log(reqObj)
// Make a request to the server
try{
    const response = await axios({
  method: 'get',
  url: serverUrl,
  responseType: 'stream',
  params:reqObj
})
    if(response.status === 200){
      const localFilePath = id+".mp4"
      await response.data.pipe(fs.createWriteStream(localFilePath));
      await response.data.on('end',async () => {
        console.log('Download completed.');
        const media = await MessageMedia.fromFilePath(localFilePath);
        await client.sendMessage(message.from, message.reply(media));
        fs.unlink(localFilePath,(err) => {
            if (err) {
              console.error('Error deleting file:', err);
            } else {
              console.log('File deleted successfully');
            }
          })
      });
      
      response.data.on('error', (err) => {
        console.error('Download error:', err.message);
      });
      
    }
}
catch(e){
    await client.sendMessage(message.from, message.reply("```Server Error, try in some time```\n_(Maybe this type of query is forbidden by server rules, so try something else!)_"));

}

}


client.on("message_create", async (message) => {
    
        let msg = message.body;
        let name = message.notifyName;
        //console.log(message)
        if(typeof(msg)!=typeof("h"))
        return
        let msgArray = msg.split(" ");


         if (msgArray[0] == "/pika") {
            message.reply("_Your query is in queue, it will be generated shortly. As we use free servers, Generation times ranges a few minutes so please be patient and bear with us._ 🙇🙇🙇")
            query = msg.replace("/pika", "");
            try{
                let flag = filter.clean(query).includes("**")
                if(flag==true){
                    if(message.fromMe!=true){
                        message.reply(`*WhatsSearch*: _Sorry your query contains violent or sexual content, please refrain from using them otherwise I'll Find you and_ *I WILL KILL YOU!* ${message.notifyName} 😈🔪🩸💀`)
                        return
                    }
    
                } 
            }
            catch(e){}
            console.log("Pika")
            pika(query,message)
        }
           
});
