const mineflayer = require("mineflayer");
const pinger = require('minecraft-pinger');
const discord = require("discord.js");
const beautify = require("beautify");
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('./config.json'));
const fetch = require('cross-fetch');
const db = require('quick.db')
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// create a rolling file logger based on date/time that fires process events
const opts = {
	errorEventName:'error',
        logDirectory:'/Users/lwage/Desktop/Boreas Discord Bot/SealBot/logs', // NOTE: folder must exist and be writable...
        fileNamePattern:'<DATE>.log',
        dateFormat:'YYYY.MM.DD'
};
const log = require('simple-node-logger').createRollingFileLogger( opts );

require("colors");

const client = new discord.Client({autoReconnect: true});
const options = {
    host: config["mcserver"],
    port: 25565,
    version: '1.16.5',
    username: config["minecraft-username"],
    password: config["minecraft-password"],
};



// minecraft bot stuff vv
let mc;
(function init() {
    console.log("Logging in.");
    log.info("Logging in.")
    mc = mineflayer.createBot(options);
    mc._client.once("session", session => options.session = session);
    mc.once("end", () => {
        setTimeout(() => {
            console.log("Connection failed. Retrying..");
            log.info("Connection failed. Retrying..");
            process.exit(0)
        }, 100);
    });
}());
let uuid;
let name;
mc.on("login", () => {
    uuid = mc._client.session.selectedProfile.id;
    name = mc._client.session.selectedProfile.name;
    setTimeout(() => {
        console.log("Sending to skyblock.");
        log.info("Sending to skyblock.");
        client.guilds.get(config["discord-guild"]).channels.get(config["discord-console-channel"]).send("Sending to skyblock.");
        mc.chat("/skyblock");
            setTimeout(() => {
                mc.chat("/is");
            }, 5000);
        //let joinmsg = await client.guilds.get(config["discord-guild"]).channels.get(config["discord-channel"]).send("The bot started properly, you may now chat!");
        //joinmsg.delete(5000)
    }, 5000);
    console.log("Logged in.")
    log.info("Logged in.")
    client.guilds.get(config["discord-guild"]).channels.get(config["discord-console-channel"]).send("Logged in.");

});

mc.on('kicked', console.log)
mc.on('error', console.log)
const { mineflayer: mineflayerViewer } = require('prismarine-viewer')
mc.once('spawn', () => {
  mineflayerViewer(mc, { port: 8880, firstPerson: true }) // port is the minecraft server port, if first person is false, you get a bird's-eye view
})

/* function lookAtNearestPlayer () {
    const playerFilter = (entity) => entity.type === 'player'
    const playerEntity = mc.nearestEntity(playerFilter)

    if (!playerEntity) return
    const pos = playerEntity.position.offset(0, playerEntity.height, 0)
    mc.lookAt(pos)

}

mc.on('physicTick', lookAtNearestPlayer) */

mc.on("message", (chatMsg) => {
    const msg = chatMsg.toString();
    if (msg.includes("Mana")) return;
    if (msg.includes("Your inventory is full")) return;
    if (msg.toLowerCase().includes("@everyone")) return;
    if (msg.toLowerCase().includes("@here")) return;
    console.log("Minecraft: ".brightGreen + msg);
    log.info("Minecraft: " + msg);
    client.guilds.get(config["discord-guild"]).channels.get(config["discord-console-channel"]).send("Minecraft: " + msg);
    if (msg.endsWith(" joined the lobby!") && msg.includes("[MVP+")) {
        console.log("Sending to skyblock.");
        log.info("Sending to skyblock.");
        client.guilds.get(config["discord-guild"]).channels.get(config["discord-console-channel"]).send("Sending to skyblock.");
        mc.chat("/skyblock");
            setTimeout(() => {
                mc.chat("/is");
            }, 2000);
        return;
    }

    if (msg.startsWith("An exception")) {
        mc.chat("/l")
        setTimeout(() => {
            mc.chat("/skyblock");
            setTimeout(() => {
                mc.chat("/is");
            }, 2000);
        }, 2000);
    }

    if (msg.startsWith("Guild >") && msg.includes(":")) {
        let v = msg.split(" ", 4);
        if (v[3].includes(name)) return;
        let splitMsg = msg.split(" ");
        let i = msg.indexOf(":");
        let splitMsg2 = [msg.slice(0,i), msg.slice(i+1)];
        let sender, sentMsg;
        if (splitMsg[2].includes("[")) {
            sender = splitMsg[3].replace(":","");
        } else {
            sender = splitMsg[2].replace(":","");
        }
        sentMsg = splitMsg2[1];

        let rank;
        if (splitMsg[3].includes("[")) {
            rank = splitMsg[3].replace(":","");
        } else {
            rank = splitMsg[4].replace(":","");
        }
        const rank2 = {
            "[M]": "MEMBER",
            "[S]": "SPECIAL",
            "[Staff]": "STAFF",
            "[ADMIN]": "ADMIN",
            "[CO]": "CO OWNER",
            "[GM]": "GUILD MASTER"
        }


        let embed = new discord.RichEmbed()
            .setAuthor(sender + " | " + rank2[rank], "https://www.mc-heads.net/avatar/" + sender)
            //.addField("Message:", sentMsg, true)
            //.addField("Rank:", rank2[rank], true)
            .setDescription(sentMsg)
            .setTimestamp()
            .setColor("#ddbb00");

        //channel.send(embed);
        client.guilds.get(config["discord-guild"]).channels.get(config["discord-channel"]).send(embed);
    }

    if (msg.startsWith("Guild >") && msg.includes(":")) {
        let v = msg.split(" ", 4);
        let splitMsg = msg.split(" ");
        let i = msg.indexOf(":");
        let splitMsg2 = [msg.slice(0,i), msg.slice(i+1)];

        let sender, sentMsg;
        if (splitMsg[2].includes("[")) {
            sender = splitMsg[3].replace(":","");
        } else {
            sender = splitMsg[2].replace(":","");
        }
        sentMsg = splitMsg2[1];
        let sentMsgNoSpaces = sentMsg.replace(" ","");
        if (sentMsgNoSpaces.toLowerCase().startsWith("!ping")) {
            pinger.ping(config["mcserver"], 25565, (error, result) => {
                if (error) return console.error(error)
                const hyping1 = result.ping
                let pingms = hyping1 + "ms"
                let msgs = [
                    `My ping on Hypixel is: ${pingms}`,
                    `${pingms}.`,
                    `I currently have ${pingms} on Hypixel`,
                    `Am I lagging? because ${pingms} seems a bit much`,
                    `According to my calculations... i have ${pingms} ping`
                    ]
                     let i = db.get("msg.pingincrement");
                     if(i == msgs.length) i = 0;
                    mc.chat("/gc " + msgs[i]);
                    console.log(msgs[i])
                    db.set("msg.pingincrement", i +1);
            })
        }
        if (sentMsgNoSpaces.toLowerCase().startsWith("!lurk")) {
            let lurkmsgs = [
                `${sender} is now lurking (AFK)!`,
                `It seems that ${sender} is lurking (AFK) now!`,
                `${sender} may not respond because thay are lurking (AFK).`,
                `Don't worry, I'm sure ${sender} will be back from lurking (AFK) soon.`,
                `${sender} decided to lurk (AFK) Will they be back soon?`
            ]
            let i2 = db.get("msg.lurkincrement");
            if(i2 == lurkmsgs.length) i2 = 0;
            console.log(lurkmsgs[i2])
            mc.chat("/gc " + lurkmsgs[i2])
            db.set("msg.lurkincrement", i2 +1);
        }
        if (sentMsgNoSpaces.toLowerCase().startsWith("!unlurk")) {
            let unlurkmsgs = [
                `${sender} is no longer lurking (AFK)!`,
                `It seems that ${sender} is back from lurking (AFK) now!`,
                `${sender} will probably respond because they finished lurking (AFK).`,
                `Wow, ${sender} that took long enough, but hey at least you are back from lurking (AFK).`,
                `${sender} Got back from lurking (AFK) sooner then I thought!`
            ]
            let i3 = db.get("msg.unlurkincrement");
            if(i3 == unlurkmsgs.length) i3 = 0;
            console.log(unlurkmsgs[i3])
            mc.chat("/gc " + unlurkmsgs[i3])
            db.set("msg.unlurkincrement", i3 +1);
        }
        if (sentMsgNoSpaces.toLowerCase().startsWith("!playtime")) {
            mc.chat("/playtime")
        }
        /*if (sentMsgNoSpaces.toLowerCase().startsWith("!stronger")) {
            setTimeout(() => {
                mc.chat("/gc Work it,")
                setTimeout(() => {
                    mc.chat("/gc make it,")
                    setTimeout(() => {
                        mc.chat("/gc do it")
                        setTimeout(() => {
                            mc.chat("/gc Makes us")
                            setTimeout(() => {
                                mc.chat("/gc harder,")
                                setTimeout(() => {
                                    mc.chat("/gc better,")
                                    setTimeout(() => {
                                        mc.chat("/gc faster,")
                                        setTimeout(() => {
                                            mc.chat("/gc Stronger.")
                                        }, 500);
                                    }, 500);
                                }, 500);
                            }, 500);
                        }, 500);
                    }, 500);
                }, 500);
            }, 500);
        }*/
        if (sentMsgNoSpaces.toLowerCase().startsWith("!seal")) {
                let msgs = [
                    `Seal!`,
                    `I like Seals.`,
                    `Seeeeeeeeeeaaaaaaaaaalll`,
                    `SEAL >:(`,
                    `Seal?`
                    ]
                     let i = db.get("msg.sealincrement");
                     if(i == msgs.length) i = 0;
                    mc.chat("/gc " + msgs[i]);
                    console.log(msgs[i])
                    db.set("msg.sealincrement", i +1);
        }
				if (sentMsgNoSpaces.toLowerCase().startsWith("!verify")) {
						let args = sentMsg.split(" ")
						let defcode = args[2];
						if(!defcode) return mc.chat(`/gc ${sender}, Code invalid.`);
						let code = db.get(`verify.${defcode}.code`);
						if(!code) return mc.chat(`/gc ${sender}, Code invalid or expired.`);
						if(defcode == code) {
							let linkid = db.get(`verify.${code}.id`)
							db.set(`linked.users.MC.${sender}`, { minecraft: `${sender}`, discordID: `${linkid}` });
							db.set(`linked.users.ID.${linkid}`, { minecraft: `${sender}`, discordID: `${linkid}` });

							db.delete(`verify.${code}.code`);

							mc.chat(`/gc ${sender}, Linked!`)

							let linkembed = new discord.RichEmbed()
							.setTitle("Successfully Linked!")
							.setDescription(`You have successfully linked your Discord account to your minecraft account: \`${sender}\`.\nIf this is incorrect, please unlink using \`=unlink\` and retrying the verification proccess.\nYou have been given the Member role, this gives you access to some channels such as the guild chat channels.`)
							.setTimestamp()
							.setColor("#00ff08")
							let userguild = client.guilds.get(config["discord-guild"])
							let user = userguild.members.get(linkid)
							user.send(`<@${linkid}>`, linkembed);
							user.addRole("877188839255453766")
							user.addRole("878124885275201576")
							db.delete(`verify.${code}.id`)
						}

        }
    }

    if (msg.startsWith("Officer >") && msg.includes(":")) {
        let v = msg.split(" ", 4);
        if (v[3].includes(name)) return;
        let splitMsg = msg.split(" ");
        let i = msg.indexOf(":");
        let splitMsg2 = [msg.slice(0,i), msg.slice(i+1)];
        let sender, sentMsg;
        if (splitMsg[2].includes("[")) {
            sender = splitMsg[3].replace(":","");
        } else {
            sender = splitMsg[2].replace(":","");
        }
        sentMsg = splitMsg2[1];

        let rank;
        if (splitMsg[3].includes("[")) {
            rank = splitMsg[3].replace(":","");
        } else {
            rank = splitMsg[4].replace(":","");
        }
        const rank2 = {
            "[M]": "MEMBER",
            "[S]": "SPECIAL",
            "[Staff]": "STAFF",
            "[ADMIN]": "ADMIN",
            "[CO]": "CO OWNER",
            "[GM]": "GUILD MASTER"
        }
        let embed = new discord.RichEmbed()
            .setAuthor(sender + " | " + rank2[rank], "https://www.mc-heads.net/avatar/" + sender)
            //.addField("Message:", sentMsg, true)
            //.addField("Rank:", rank2[rank], true)
            .setDescription(sentMsg)
            .setTimestamp()
            .setColor("#ddbb00");

        //channel.send(embed);
        client.guilds.get(config["discord-guild"]).channels.get(config["discord-officer-channel"]).send(embed);
    }

        if (msg.startsWith("Officer >") && msg.includes(":")) {
            let v = msg.split(" ", 4);
            let splitMsg = msg.split(" ");
            let i = msg.indexOf(":");
            let splitMsg2 = [msg.slice(0,i), msg.slice(i+1)];

            let sender, sentMsg;
            if (splitMsg[2].includes("[")) {
                sender = splitMsg[3].replace(":","");
            } else {
                sender = splitMsg[2].replace(":","");
            }
            sentMsg = splitMsg2[1];
            let sentMsgNoSpaces = sentMsg.replace(" ","");
            if (sentMsgNoSpaces.toLowerCase().startsWith("!ping")) {
                pinger.ping(config["mcserver"], 25565, (error, result) => {
                    if (error) return console.error(error)
                    const hyping1 = result.ping
                    let pingms = hyping1 + "ms"
                    let msgs = [
                        `My ping on Hypixel is: ${pingms}`,
                        `${pingms}.`,
                        `I currently have ${pingms} on Hypixel`,
                        `Am I lagging? because ${pingms} seems a bit much`,
                        `According to my calculations... i have ${pingms} ping`,
                        ]
                         let i = db.get("msg.pingincrement");
                         if(i == msgs.length) i = 0;
                        mc.chat("/oc " + msgs[i]);
                        console.log(msgs[i])
                        db.set("msg.pingincrement", i +1);
                })
            }
            if (sentMsgNoSpaces.toLowerCase().startsWith("!lurk")) {
                console.log(sender)
                let lurkmsgs = [
                    `${sender} is now lurking (AFK)!`,
                    `It seems that ${sender} is lurking (AFK) now!`,
                    `${sender} may not respond because thay are lurking (AFK).`,
                    `Don't worry, I'm sure ${sender} will be back from lurking (AFK) soon.`,
                    `${sender} decided to lurk (AFK) Will they be back soon?`
                ]
                let i2 = db.get("msg.lurkincrement");
                if(i2 == lurkmsgs.length) i2 = 0;
                console.log(lurkmsgs[i2])
                mc.chat("/oc " + lurkmsgs[i2])
                db.set("msg.lurkincrement", i2 +1);
            }
            if (sentMsgNoSpaces.toLowerCase().startsWith("!unlurk")) {
                let unlurkmsgs = [
                    `${sender} is no longer lurking (AFK)!`,
                    `It seems that ${sender} is back from lurking (AFK) now!`,
                    `${sender} will probably respond because they finished lurking (AFK).`,
                    `Wow, ${sender} that took long enough, but hey at least you are back from lurking (AFK).`,
                    `${sender} Got back from lurking (AFK) sooner then I thought!`
                ]
                let i3 = db.get("msg.unlurkincrement");
                if(i3 == unlurkmsgs.length) i3 = 0;
                console.log(unlurkmsgs[i3])
                mc.chat("/oc " + unlurkmsgs[i3])
                db.set("msg.unlurkincrement", i3 +1);
            }
            /*if (sentMsgNoSpaces.toLowerCase().startsWith("!stronger")) {
                setTimeout(() => {
                    mc.chat("/oc Work it,")
                    setTimeout(() => {
                        mc.chat("/oc make it,")
                        setTimeout(() => {
                            mc.chat("/oc do it")
                            setTimeout(() => {
                                mc.chat("/oc Makes us")
                                setTimeout(() => {
                                    mc.chat("/oc harder,")
                                    setTimeout(() => {
                                        mc.chat("/oc better,")
                                        setTimeout(() => {
                                            mc.chat("/oc faster,")
                                            setTimeout(() => {
                                                mc.chat("/oc Stronger.")
                                            }, 500);
                                        }, 500);
                                    }, 500);
                                }, 500);
                            }, 500);
                        }, 500);
                    }, 500);
                }, 500);
            }*/
            if (sentMsgNoSpaces.toLowerCase().startsWith("!seal")) {
                let msgs = [
                    `Seal!`,
                    `I like Seals.`,
                    `Seeeeeeeeeeaaaaaaaaaalll`,
                    `SEAL >:(`,
                    `Seal?`
                    ]
                     let i = db.get("msg.sealincrement");
                     if(i == msgs.length) i = 0;
                    mc.chat("/oc " + msgs[i]);
                    console.log(msgs[i])
                    db.set("msg.sealincrement", i +1);
        }
        }

    if (msg.includes("joined.")) {
        let v = msg.split(" ", 4);
        if (msg.includes(":")) return;
        if (msg.includes("Friend")) return;
        let splitMsg = msg.split(" ");
        let i = msg.indexOf(":");
        let splitMsg2 = [msg.slice(0,i), msg.slice(i+1)];
        let sender, sentMsg;
        if (splitMsg[2].includes("[")) {
            sender = splitMsg[3].replace(":","");
        } else {
            sender = splitMsg[2].replace(":","");
        }
        sentMsg = splitMsg2[1];
        let msgsent2 = sentMsg.replace("Guild > ", "")

        let embed = new discord.RichEmbed()
            .setAuthor(msgsent2, "https://www.mc-heads.net/avatar/" + sender)
            .setTimestamp()
            .setColor("GREEN");

        //channel.send(embed);
        client.guilds.get(config["discord-guild"]).channels.get(config["discord-channel"]).send(embed);
    }

    if (msg.includes("left.")) {
        let v = msg.split(" ", 4);
        if (msg.includes(":")) return;
        if (msg.includes("Friend")) return;
        let splitMsg = msg.split(" ");
        let i = msg.indexOf(":");
        let splitMsg2 = [msg.slice(0,i), msg.slice(i+1)];
        let sender, sentMsg;
        if (splitMsg[2].includes("[")) {
            sender = splitMsg[3].replace(":","");
        } else {
            sender = splitMsg[2].replace(":","");
        }
        sentMsg = splitMsg2[1];
        let msgsent2 = sentMsg.replace("Guild > ", "")

        let embed = new discord.RichEmbed()
            .setAuthor(msgsent2, "https://www.mc-heads.net/avatar/" + sender)
            .setTimestamp()
            .setColor("RED");

        //channel.send(embed);
        client.guilds.get(config["discord-guild"]).channels.get(config["discord-channel"]).send(embed);
    }

    if (msg.includes("joined the g")) {
        let v = msg.split(" ", 4);
        if (msg.includes(":")) return;
        let splitMsg = msg.split(" ");
        let i = msg.indexOf(":");
        let splitMsg2 = [msg.slice(0,i), msg.slice(i+1)];
        let sender, sentMsg;
        if (splitMsg[0].includes("[")) {
            sender = splitMsg[1].replace(":","");
        } else {
            sender = splitMsg[0].replace(":","");
        }
        sentMsg = splitMsg2[1];

        let embed = new discord.RichEmbed()
            .setAuthor(sentMsg, "https://www.mc-heads.net/avatar/" + sender)
            .setTimestamp()
            .setColor("GREEN");

        //channel.send(embed);
        client.guilds.get(config["discord-guild"]).channels.get(config["discord-channel"]).send(embed)
        mc.chat(`/gc Welcome to Boreas ${sender}! We hope you enjoy your time here.`)
    }

    if (msg.includes("left the g")) {
        let v = msg.split(" ", 4);
        if (msg.includes(":")) return;
        let splitMsg = msg.split(" ");
        let i = msg.indexOf(":");
        let splitMsg2 = [msg.slice(0,i), msg.slice(i+1)];
        let sender, sentMsg;
        if (splitMsg[0].includes("[")) {
            sender = splitMsg[1].replace(":","");
        } else {
            sender = splitMsg[0].replace(":","");
        }
        sentMsg = splitMsg2[1];

        let embed = new discord.RichEmbed()
            .setAuthor(sentMsg, "https://www.mc-heads.net/avatar/" + sender)
            .setTimestamp()
            .setColor("RED");

        //channel.send(embed);
        client.guilds.get(config["discord-guild"]).channels.get(config["discord-channel"]).send(embed)
        mc.chat("/gc We are sorry you had to leave, " + sender)

				let removeroleID = db.get(`linked.users.MC.${sender}`)
				console.log(removeroleID)
				if (!removeroleID) return;
				let autounlink = new discord.RichEmbed()
				.setTitle("Automatically Unlinked")
				.setDescription(`You left the Hypixel Guild and were automatically unlinked.\n⚠️ Your member role has been removed because you left the guild\nIf you rejoin the guild you will have to re-verify in order to re-gain your role.`)
				.setTimestamp()
				.setColor("#d60000")

				let userguild = client.guilds.get(config["discord-guild"])
				let user = userguild.members.get(removeroleID.discordID)
				db.delete(`linked.users.MC${removeroleID.minecraft}`)
				db.delete(`linked.users.ID${removeroleID.discordID}`)
				user.removeRole("877188839255453766")
				user.removeRole("878124885275201576")
				user.send(`<@${removeroleID.discordID}>`, autounlink)
    }
		if (msg.includes("was kicked from the g")) {
        let v = msg.split(" ", 4);
        if (msg.includes(":")) return;
        let splitMsg = msg.split(" ");
        let i = msg.indexOf(":");
        let splitMsg2 = [msg.slice(0,i), msg.slice(i+1)];
        let sender, sentMsg;
        if (splitMsg[0].includes("[")) {
            sender = splitMsg[1].replace(":","");
        } else {
            sender = splitMsg[0].replace(":","");
        }
        sentMsg = splitMsg2[1];

        let embed = new discord.RichEmbed()
            .setAuthor(sentMsg, "https://www.mc-heads.net/avatar/" + sender)
            .setTimestamp()
            .setColor("RED");

        //channel.send(embed);
        client.guilds.get(config["discord-guild"]).channels.get(config["discord-officer-channel"]).send(embed)

				let removeroleID = db.get(`linked.users.MC.${sender}`)
				if (!removeroleID) return;
				let autounlink = new discord.RichEmbed()
				.setTitle("Automatically Unlinked")
				.setDescription(`You were kicked from the Hypixel Guild and were automatically unlinked.\n⚠️ Your member role has been removed because you were kicked from guild\nIf you rejoin the guild you will have to re-verify in order to re-gain your role.`)
				.setTimestamp()
				.setColor("#d60000")

				let userguild = client.guilds.get(config["discord-guild"])
				let user = userguild.members.get(removeroleID.discordID)
				db.delete(`linked.users.MC.${removeroleID.minecraft}`)
				db.delete(`linked.users.ID.${removeroleID.discordID}`)
				user.removeRole("877188839255453766")
				user.removeRole("878124885275201576")
				user.send(`<@${removeroleID.discordID}>`, autounlink)
    }

    /* if (msg.includes("the party")) {
        let v = msg.split(" ", 4);
        if (msg.includes(":")) return;
        let splitMsg = msg.split(" ");
        let i = msg.indexOf(":");
        let splitMsg2 = [msg.slice(0,i), msg.slice(i+1)];
        let sender, sentMsg;
        if (splitMsg[2].includes("[")) {
            sender = splitMsg[3].replace(":","");
        } else {
            sender = splitMsg[2].replace(":","");
        }
        sentMsg = splitMsg2[1];

        let embed = new discord.RichEmbed()
            .setDescription(sentMsg)
            .setColor("BLUE");

        //channel.send(embed);
        client.guilds.get(config["discord-guild"]).channels.get(config["discord-channel"]).send(embed);
    }

    if (msg.includes("The party")) {
        let v = msg.split(" ", 4);
        if (msg.includes(":")) return;
        if (msg.includes("the party")) return;
        let splitMsg = msg.split(" ");
        let i = msg.indexOf(":");
        let splitMsg2 = [msg.slice(0,i), msg.slice(i+1)];
        let sender, sentMsg;
        if (splitMsg[2].includes("[")) {
            sender = splitMsg[3].replace(":","");
        } else {
            sender = splitMsg[2].replace(":","");
        }
        sentMsg = splitMsg2[1];

        let embed = new discord.RichEmbed()
            .setDescription(sentMsg)
            .setColor("BLUE");

        //channel.send(embed);
        client.guilds.get(config["discord-guild"]).channels.get(config["discord-channel"]).send(embed);
    }

    if (msg.includes("Party Members")) {
        let v = msg.split(" ", 4);
        let splitMsg = msg.split(" ");
        let i = msg.indexOf(":");
        let splitMsg2 = [msg.slice(0,i), msg.slice(i+1)];
        sentMsg = splitMsg2[1];

        let embed = new discord.RichEmbed()
            .setDescription(msg.content)
            .setColor("BLUE");

        //channel.send(embed);
        client.guilds.get(config["discord-guild"]).channels.get(config["discord-channel"]).send(embed);
    }

    if (msg.includes("cannot i")) {
        let v = msg.split(" ", 4);
        if (msg.includes(":")) return;
        let splitMsg = msg.split(" ");
        let i = msg.indexOf(":");
        let splitMsg2 = [msg.slice(0,i), msg.slice(i+1)];
        let sender, sentMsg;
        if (splitMsg[2].includes("[")) {
            sender = splitMsg[3].replace(":","");
        } else {
            sender = splitMsg[2].replace(":","");
        }
        sentMsg = splitMsg2[1];

        let embed = new discord.RichEmbed()
            .setDescription(sentMsg)
            .setColor("BLUE");

        //channel.send(embed);
        client.guilds.get(config["discord-guild"]).channels.get(config["discord-channel"]).send(embed);
    }

    if (msg.includes("cannot p")) {
        let v = msg.split(" ", 4);
        if (msg.includes(":")) return;
        let splitMsg = msg.split(" ");
        let i = msg.indexOf(":");
        let splitMsg2 = [msg.slice(0,i), msg.slice(i+1)];
        let sender, sentMsg;
        if (splitMsg[2].includes("[")) {
            sender = splitMsg[3].replace(":","");
        } else {
            sender = splitMsg[2].replace(":","");
        }
        sentMsg = splitMsg2[1];

        let embed = new discord.RichEmbed()
            .setDescription(sentMsg)
            .setColor("BLUE");

        //channel.send(embed);
        client.guilds.get(config["discord-guild"]).channels.get(config["discord-channel"]).send(embed);
    }

    if (msg.includes("find a")) {
        let v = msg.split(" ", 4);
        if (msg.includes(":")) return;
        let splitMsg = msg.split(" ");
        let i = msg.indexOf(":");
        let splitMsg2 = [msg.slice(0,i), msg.slice(i+1)];
        let sender, sentMsg;
        if (splitMsg[2].includes("[")) {
            sender = splitMsg[3].replace(":","");
        } else {
            sender = splitMsg[2].replace(":","");
        }
        sentMsg = splitMsg2[1];

        let embed = new discord.RichEmbed()
            .setDescription(sentMsg)
            .setColor("BLUE");

        //channel.send(embed);
        client.guilds.get(config["discord-guild"]).channels.get(config["discord-channel"]).send(embed);
    }

    if (msg.includes("a party")) {
        let v = msg.split(" ", 4);
        if (msg.includes(":")) return;
        let splitMsg = msg.split(" ");
        let i = msg.indexOf(":");
        let splitMsg2 = [msg.slice(0,i), msg.slice(i+1)];
        let sender, sentMsg;
        if (splitMsg[2].includes("[")) {
            sender = splitMsg[3].replace(":","");
        } else {
            sender = splitMsg[2].replace(":","");
        }
        sentMsg = splitMsg2[1];

        let embed = new discord.RichEmbed()
            .setDescription(sentMsg)
            .setColor("BLUE");

        //channel.send(embed);
        client.guilds.get(config["discord-guild"]).channels.get(config["discord-channel"]).send(embed);
    }

    if (msg.includes("has invited you to join their part")) {
        let v = msg.split(" ", 4);
        if (msg.includes(":")) return;
        let splitMsg = msg.split(" ");
        let i = msg.indexOf(":");
        let splitMsg2 = [msg.slice(0,i), msg.slice(i+1)];
        let sender, sentMsg;
        if (splitMsg[2].includes("[")) {
            sender = splitMsg[3].replace(":","");
        } else {
            sender = splitMsg[2].replace(":","");
        }
        sentMsg = splitMsg2[1];

        let embed = new discord.RichEmbed()
            .setDescription(sentMsg)
            .setColor("BLUE");

        //channel.send(embed);
        client.guilds.get(config["discord-guild"]).channels.get(config["discord-channel"]).send(embed);
    }

    if (msg.includes("have joined")) {
        let v = msg.split(" ", 4);
        if (msg.includes(":")) return;
        let splitMsg = msg.split(" ");
        let i = msg.indexOf(":");
        let splitMsg2 = [msg.slice(0,i), msg.slice(i+1)];
        let sender, sentMsg;
        if (splitMsg[2].includes("[")) {
            sender = splitMsg[3].replace(":","");
        } else {
            sender = splitMsg[2].replace(":","");
        }
        sentMsg = splitMsg2[1];

        let embed = new discord.RichEmbed()
            .setDescription(sentMsg)
            .setColor("BLUE");

        //channel.send(embed);
        client.guilds.get(config["discord-guild"]).channels.get(config["discord-channel"]).send(embed);
    }

    if (msg.startsWith("Party >") && msg.includes(":")) {
        let v = msg.split(" ", 4);
        let splitMsg = msg.split(" ");
        let i = msg.indexOf(":");
        let splitMsg2 = [msg.slice(0,i), msg.slice(i+1)];
        let sender, sentMsg;
        if (splitMsg[2].includes("[")) {
            sender = splitMsg[3].replace(":","");
        } else {
            sender = splitMsg[2].replace(":","");
        }
        sentMsg = splitMsg2[1];

        let embed = new discord.RichEmbed()
            .setAuthor(sender + ": " + sentMsg, "https://www.mc-heads.net/avatar/" + sender)
            .setColor("BLUE");

        //channel.send(embed);
        client.guilds.get(config["discord-guild"]).channels.get(config["discord-channel"]).send(embed);
    } */

    if (msg.includes("Friend")) {
        let v = msg.split(" ", 4);
        if (msg.includes(":")) return;
        if (msg.includes("join")) return;
        if (msg.includes("left")) return;
        let splitMsg = msg.split(" ");
        let i = msg.indexOf(":");
        let splitMsg2 = [msg.slice(0,i), msg.slice(i+1)];
        let sender, sentMsg;
        if (splitMsg[2].includes("[")) {
            sender = splitMsg[3].replace(":","");
        } else {
            sender = splitMsg[2].replace(":","");
        }
        sentMsg = splitMsg2[1];

        let embed = new discord.RichEmbed()
            .setDescription(sentMsg)
            .setColor("PURPLE");

        //channel.send(embed);
        client.guilds.get(config["discord-guild"]).channels.get(config["discord-channel"]).send(embed);
    }

    if (msg.includes("friend")) {
        let v = msg.split(" ", 4);
        if (msg.includes(":")) return;
        if (msg.includes("join")) return;
        if (msg.includes("left")) return;
        let splitMsg = msg.split(" ");
        let i = msg.indexOf(":");
        let splitMsg2 = [msg.slice(0,i), msg.slice(i+1)];
        let sender, sentMsg;
        if (splitMsg[2].includes("[")) {
            sender = splitMsg[3].replace(":","");
        } else {
            sender = splitMsg[2].replace(":","");
        }
        sentMsg = splitMsg2[1];

        let embed = new discord.RichEmbed()
            .setDescription(sentMsg)
            .setColor("PURPLE");

        //channel.send(embed);
        client.guilds.get(config["discord-guild"]).channels.get(config["discord-channel"]).send(embed);
    }

    if (msg.includes("found with name")) {
        let v = msg.split(" ", 4);
        if (msg.includes(":")) return;
        let splitMsg = msg.split(" ");
        let i = msg.indexOf(":");
        let splitMsg2 = [msg.slice(0,i), msg.slice(i+1)];
        let sender, sentMsg;
        if (splitMsg[2].includes("[")) {
            sender = splitMsg[3].replace(":","");
        } else {
            sender = splitMsg[2].replace(":","");
        }
        sentMsg = splitMsg2[1];

        let embed = new discord.RichEmbed()
            .setDescription(sentMsg)
            .setColor("PURPLE");

        //channel.send(embed);
        client.guilds.get(config["discord-guild"]).channels.get(config["discord-channel"]).send(embed);
    }

    if (msg.includes("ignore")) {
        let v = msg.split(" ", 4);
        if (msg.includes(":")) return;
        if (msg.includes("join")) return;
        if (msg.includes("left")) return;
        if (msg.includes("invite")) return;
        let splitMsg = msg.split(" ");
        let i = msg.indexOf(":");
        let splitMsg2 = [msg.slice(0,i), msg.slice(i+1)];
        let sender, sentMsg;
        if (splitMsg[2].includes("[")) {
            sender = splitMsg[3].replace(":","");
        } else {
            sender = splitMsg[2].replace(":","");
        }
        sentMsg = splitMsg2[1];

        let embed = new discord.RichEmbed()
            .setDescription(sentMsg)
            .setColor("PURPLE");

        //channel.send(embed);
        client.guilds.get(config["discord-guild"]).channels.get(config["discord-channel"]).send(embed);
    }

    if (msg.includes("playtime")) {
        let v = msg.split(" ", 4);
        if (msg.includes(":")) return;
        if (msg.includes("join")) return;
        if (msg.includes("left")) return;
        let splitMsg = msg.split(" ");
        let i = msg.indexOf(":");
        let splitMsg2 = [msg.slice(0,i), msg.slice(i+1)];
        let sender, sentMsg;
        if (splitMsg[2].includes("[")) {
            sender = splitMsg[3].replace(":","");
        } else {
            sender = splitMsg[2].replace(":","");
        }
        sentMsg = splitMsg2[1];

        let embed = new discord.RichEmbed()
            .setDescription(sentMsg)
            .setColor("AQUA");

        mc.chat("/gc " + sentMsg)
        //channel.send(embed);
        client.guilds.get(config["discord-guild"]).channels.get(config["discord-channel"]).send(embed);
    }

    if (msg.includes("You cannot say the")) {
        let v = msg.split(" ", 4);
        if (msg.includes(":")) return;
        if (msg.includes("invite")) return;
        let splitMsg = msg.split(" ");
        let i = msg.indexOf(":");
        let splitMsg2 = [msg.slice(0,i), msg.slice(i+1)];
        let sender, sentMsg;
        if (splitMsg[2].includes("[")) {
            sender = splitMsg[3].replace(":","");
        } else {
            sender = splitMsg[2].replace(":","");
        }
        sentMsg = splitMsg2[1];

        let embed = new discord.RichEmbed()
            .setDescription("⚠️ A message could not be sent.")
            .setColor("#ff1f00");

        //channel.send(embed);
        client.guilds.get(config["discord-guild"]).channels.get(config["discord-channel"]).send(embed)
        .then(message => {
            message.delete(5000)
        });
        client.guilds.get(config["discord-guild"]).channels.get(config["discord-officer-channel"]).send(embed)
        .then(message => {
            message.delete(5000)
        });
    }

    /* if (msg.includes("has invited you")) {
        let v = msg.split(" ", 4);
        let splitMsg = msg.split(" ");
        let i = msg.indexOf(":");
        let splitMsg2 = [msg.slice(0,i), msg.slice(i+1)];
        if (splitMsg[0].includes("[")) {
            sender = splitMsg[1].replace("-----------------------------\n","");
        } else {
            sender = splitMsg[0].replace("-----------------------------\n","");
        }
        sentMsg = splitMsg2[1];
        mc.chat("/party accept " + sender)
        if (sender != "SealBot") {
            const leaveparty = setTimeout(function() {
                mc.chat("/p leave")
            }, 10000)
            const hellosender = setTimeout(() => {
           mc.chat(`/pc [WARN] Hello ${sender}, I will leave the party in 10 seconds so other people can use me. Thank You!`)
           setTimeout(() => {
            mc.chat(`/pc [INFO] Next time you party me: I do not accept your party it is most likely because someone else hasn't finished with me, just try again in 5-15 seconds.`)
            setTimeout(() => {
                mc.chat(`/pc [INFO] This bot was originally made for chat in the guild Cold Lands.`)
                 }, 1000)
            }, 1000)
        }, 1500)
        }
    }

     if (msg.includes("entered The Cat")) {
        console.log("cancel this")
        clearTimeout(leaveparty);
    } */

    if (msg.toLowerCase().startsWith("from [mvp+] bamboozledmc:")) {
        let args = msg.split(" ", 3);
        let i = msg.indexOf(":")
        let sent = [msg.slice(i+2)];
        let toexecute = sent
        console.log(toexecute)
        mc.chat(`/${toexecute}`);

    }
    if (msg.toLocaleLowerCase().startsWith("can't find a player by")) {
        let embed = new discord.RichEmbed()
            .setTitle("MODERATION COMMANDS")
            .setDescription("⚠️ " + msg)
            .setColor("#d85300");

        client.guilds.get(config["discord-guild"]).channels.get(config["discord-officer-channel"]).send(embed)
    }
    if (msg.toLocaleLowerCase().startsWith("you cannot mute someone for less")) {
        let embed = new discord.RichEmbed()
            .setTitle("MUTE COMMAND")
            .setDescription("⚠️ " + msg)
            .setColor("#d85300");

        client.guilds.get(config["discord-guild"]).channels.get(config["discord-officer-channel"]).send(embed)
    }
    if (msg.toLocaleLowerCase().startsWith("this player is already")) {
        let embed = new discord.RichEmbed()
            .setTitle("MUTE COMMAND")
            .setDescription("⚠️ " + msg)
            .setColor("#d85300");

        client.guilds.get(config["discord-guild"]).channels.get(config["discord-officer-channel"]).send(embed)
    }
    if (msg.toLocaleLowerCase().includes("is not in your")) {
        if (msg.includes(":")) return;
        let embed = new discord.RichEmbed()
            .setTitle("MUTE COMMAND")
            .setDescription("⚠️ " + msg)
            .setColor("#d85300");

        client.guilds.get(config["discord-guild"]).channels.get(config["discord-officer-channel"]).send(embed)
    }
    if (msg.toLocaleLowerCase().startsWith("[vip] sealbot has muted")) {
        let embed = new discord.RichEmbed()
            .setTitle("MUTE COMMAND")
            .setDescription(":white_check_mark: " + msg)
            .setColor("#d85300");

        client.guilds.get(config["discord-guild"]).channels.get(config["discord-officer-channel"]).send(embed)
    }
    if (msg.toLocaleLowerCase().startsWith("this player is not")) {
        let embed = new discord.RichEmbed()
            .setTitle("UNMUTE COMMAND")
            .setDescription("⚠️ " + msg)
            .setColor("#d85300");

        client.guilds.get(config["discord-guild"]).channels.get(config["discord-officer-channel"]).send(embed)
    }
    if (msg.toLocaleLowerCase().startsWith("[vip] sealbot has unmuted")) {
        let embed = new discord.RichEmbed()
            .setTitle("UNMUTE COMMAND")
            .setDescription(":white_check_mark: " + msg)
            .setColor("#d85300");

        client.guilds.get(config["discord-guild"]).channels.get(config["discord-officer-channel"]).send(embed)
    }
		if (msg.toLocaleLowerCase().includes("was promoted from")) {
        let embed = new discord.RichEmbed()
            .setTitle("PROMOTE COMMAND")
            .setDescription(":white_check_mark: " + msg)
            .setColor("#d85300");

        client.guilds.get(config["discord-guild"]).channels.get(config["discord-officer-channel"]).send(embed)
    }
		if (msg.toLocaleLowerCase().includes("was demoted from")) {
        let embed = new discord.RichEmbed()
            .setTitle("DEMOTE COMMAND")
            .setDescription(":white_check_mark: " + msg)
            .setColor("#d85300");

        client.guilds.get(config["discord-guild"]).channels.get(config["discord-officer-channel"]).send(embed)
    }
});


// discord bot stuff vv
client.on("ready", () => {
    console.log("Discord: Logged in.".bgBlue);
    log.info("Discord: Logged in.")
    client.guilds.get(config["discord-guild"]).channels.get(config["discord-channel"]).send("**Please __DO NOT__ send messages, the bot is trying to start up.**").then(message => {
        message.delete(10000)
    });
    client.guilds.get(config["discord-guild"]).channels.get(config["discord-officer-channel"]).send("**Please __DO NOT__ send messages, the bot is trying to start up.**").then(message => {
        message.delete(10000)
    });
    setTimeout(() => {
        //client.guilds.get(config["discord-guild"]).channels.get(config["discord-channel"]).send("**Please __DO NOT__ send messages, the bot is trying to start up.**");
            setTimeout(() => {
                client.guilds.get(config["discord-guild"]).channels.get(config["discord-channel"]).send("The bot started properly, you may now chat!").then(message => {
                    message.delete(5000)
                });
                client.guilds.get(config["discord-guild"]).channels.get(config["discord-officer-channel"]).send("The bot started properly, you may now chat!").then(message => {
                    message.delete(5000)
                });
            }, 10000);
        }, 2000);
        client.user.setActivity('Boreas Guild Chat', { type: 'LISTENING' })


});

client.on("message", (message) => {

    if (message.author.bot) return;

    if (message.channel.id == config["discord-channel"]) {
    let member = message.guild.members.get(message.author.id)
    let memnick = member.nickname ? member.nickname : message.author.username
    let channelname = message.channel.name
    console.log("Discord: ".blue + "[" + channelname + "] " + memnick + ": " + message.content);
    log.info("Discord: " + "[" + channelname + "] " + memnick + ": " + message.content);
    client.guilds.get(config["discord-guild"]).channels.get(config["discord-console-channel"]).send("Discord: " + "[" + channelname + "] " + memnick + ": " + message.content);

    if (message.content.startsWith(config["discord-bot-prefix"])) return;

    let userguild = client.guilds.get(config["discord-guild"])
        let user = userguild.members.get(checkiflinked.discordID)

    const filter = (reaction, user) => {
    return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
    };

    areyousuresend.awaitReactions(filter, { max: 1, time: 30000, errors: ['time'] })
    .then(collected => {
    const reaction = collected.first();

    if (reaction.emoji.name === '✅') {
    	let deleted = new discord.RichEmbed()
    	.setTitle("Successfully Purged!")
    	.setDescription(`**${checkiflinked.minecraft}**'s Account has succesfully been purged & unlinked from <@${checkiflinked.discordID}>\nThey have been notified and kicked from the guild.\nAll data related has been deleted.`)
    	.setTimestamp()
    	.setColor("#d60000")

      let userdeleted = new discord.RichEmbed()
    	.setTitle("Guild Purge")
    	.setDescription(`Your Minecraft account **${checkiflinked.minecraft}**, has been purged from the guild by an Administrator.\nYour member role has been removed and you have been kicked from the guild.\nPlease contact an Administrator if you are unsure why this happened.`)
    	.setTimestamp()
    	.setColor("#d60000")

    	db.delete(`linked.users.ID.${checkiflinked.discordID}`)
    	db.delete(`linked.users.MC.${checkiflinked.minecraft}`)
    	user.removeRole("877188839255453766")
    	user.removeRole("878124885275201576")
      user.send(user, userdeleted)
      mc.chat(`/guild kick ${checkiflinked.minecraft} Purged by an Administrator`)
    	areyousuresend.edit(deleted)
    	areyousuresend.clearReactions()
    } else {
    	areyousuresend.clearReactions()
    	let editembed = new discord.RichEmbed()
    	.setTitle("Canceled")
    	.setDescription(`The operation was canceled and **${checkiflinked.minecraft}** will not be purged.`)
    	.setTimestamp()
    	.setColor("#d60000")
    	areyousuresend.edit(editembed)
    }
    })
    .catch(collected => {
    	console.log(collected)
    	areyousuresend.clearReactions()
    	let editembed = new discord.RichEmbed()
    	.setTitle("Automatically Canceled")
    	.setDescription(`The operation was automatically canceled because you did not react within the 30 second time frame.\n**${checkiflinked.minecraft}** will not be purged.`)
    	.setTimestamp()
    	.setColor("#d60000")
    	areyousuresend.edit(editembed)
    });
    mc.chat("/gc " + memnick.replace(" ", "") + "» " + message.content)
    }
    if (message.channel.id == config["discord-officer-channel"]) {
        let member = message.guild.members.get(message.author.id)
    let memnick = member.nickname ? member.nickname : message.author.username
    let channelname = message.channel.name
    console.log("Discord: ".blue + "[" + channelname + "] " + memnick + ": " + message.content);
    log.info("Discord: " + "[" + channelname + "] " + memnick + ": " + message.content);
    client.guilds.get(config["discord-guild"]).channels.get(config["discord-console-channel"]).send("Discord: " + "[" + channelname + "] " + memnick + ": " + message.content);

    if (message.content.startsWith(config["discord-bot-prefix"])) return;


    mc.chat("/oc " + memnick.replace(" ", "") + "» " + message.content)
    }
});

client.on('message', async message => {
    let prefix = config["discord-bot-prefix"]
    if (message.author.bot) return;
    let cc = message.channel.id !== config["discord-channel"]

    if(message.content.toLowerCase().startsWith(prefix + "help")) {
        message.channel.send("**Available Commands**\n\n`=verify`: Link your Minecraft account to your Discord. *Grants access to guild chat bridge* [Alias: `=link`]\n`=party <player>`: Parties a specified player. *Useful for frag runs* [Alias: `None`]\n`=paccept <player>`: Accepts a pending party invite from a player. [Alias: `None`]\n`=ptransfer <player>`: Transfers the party to a specified player. [Alias: `=pt`]\n`=pleave`: Leaves the party. [Alias: `None`]\n`=pdisband`: Disbands the party. [Alias: `=pd`]\n`=ping`: Returns the bot's ping. [Alias: `None`]\n`=playtime`: Returns the bot's playtime on Hypixel Skyblock. [Alias: `None`]\n\n**Moderation Commands**\n`=clear <amount>`: Clears specified amount of messages. *(Limited to 100)* [Alias: `None`]\n`=slowmode <time>`: Changes the channel slowmode to the specified time. [Alias: `None`]\n\n**Hypixel Guild Moderation Commands**\n`=mute <player/everyone> <time>`: Mutes a player in the guild for a specified amount of time. [Alias: `None`]\n`=unmute <player/everyone>`: Unmutes a player in the guild. [Alias: `None`]\n`=promote <player>`: Promotes a player in the guild. [Alias: `None`]\n`=demote <player>`: Demotes a player in the guild. [Alias: `None`]\n`=broadcast <message>`: Broadcasts a message to the Guild chat & Discord channel. [Alias: `announce`]\n`=linked`: Displays all linked users [Alias: `None`]\n`=forceunlink <@user> OR <userID>`: Forcibly unlinks a user. [Alias: `=funlink`]\n\nCommands are not case sensitive.")
    }
if(message.content.toLowerCase().startsWith(prefix + "party")) {
    if (cc) return;
    let args = message.content.split(" ", 4);
    mc.chat("/p " + args[1])
}
if(message.content.toLowerCase().startsWith(prefix + "pt" || prefix + "ptransfer")) {
    if (cc) return;
    let args = message.content.split(" ", 4);
    mc.chat("/p transfer " + args[1])
}
if(message.content.toLowerCase().startsWith(prefix + "pleave")) {
    let args = message.content.split(" ", 4);
    mc.chat("/p leave")
}
if(message.content.toLowerCase().startsWith(prefix + "pc")) {
    if (message.author.id != "562382703190867972") return;
    let args = message.content.split(" ");
    let messagesent = args.slice(1).join(" ")
    mc.chat("/pc " + messagesent)
}
if(message.content.toLowerCase().startsWith(prefix + "pdisband")) {
    if (cc) return;
    let args = message.content.split(" ", 4);
    mc.chat("/p disband")
}
if(message.content.toLowerCase().startsWith(prefix + "pd")) {
    if (cc) return;
    let args = message.content.split(" ", 4);
    mc.chat("/p disband")
}
if(message.content.toLowerCase().startsWith(prefix + "paccept")) {
    if (cc) return;
    let args = message.content.split(" ", 4);
    mc.chat("/p accept " + args[1])
}
if(message.content.toLowerCase().startsWith(prefix + "tipall")) {
    let args = message.content.split(" ", 4);
    mc.chat("/tip all")
}
if(message.content.toLowerCase().startsWith(prefix + "ping")) {
    let args = message.content.split(" ", 4);
    try {
        pinger.ping(config["mcserver"], 25565, (error, result) => {
            if (error) return console.error(error)
            const hyping2 = result.ping

        })
        const pingMsg =  await message.channel.send('Pinging...');
        pinger.ping(config["mcserver"], 25565, (error, result) => {
            if (error) return console.error(error)
            const hyping2 = result.ping

		return pingMsg.edit(`
		Pong! __Roundtrip__: **${
				(pingMsg.editedTimestamp || pingMsg.createdTimestamp) - (message.editedTimestamp || message.createdTimestamp)
			}ms.** | __API__: **${
				client.ping
			}ms**\n__Hypixel__: **${
                hyping2
            }ms**
		`);
        })
    }catch(e){
		message.author.send("E: " + e).catch(error =>{
			})
	  }
}
if(message.content.toLowerCase().startsWith(prefix + "ip")) {
    message.channel.send(config["mcserver"])
}
if(message.content.toLowerCase().startsWith(prefix + "server")) {
    message.channel.send(config["mcserver"])
}
if(message.content.toLowerCase().startsWith(prefix + "info")) {
    let args = message.content.split(" ", 4);

    const theFetch = await fetch('https://api.hypixel.net/guild?name=Cold%20Lands&key=7a132fe9-3ac9-4d3e-bdcf-1280ed8143ec');
    const data = await theFetch.json();
    let onlineplayers = data.success.ONLINE_PLAYERS
    console.log("hi " + onlineplayers)

}
if(message.content.toLowerCase().startsWith(prefix + "fadd")) {
    if (message.author.id != "562382703190867972") return;
    let args = message.content.split(" ", 4);
    mc.chat("/friend " + args[1])
}
if(message.content.toLowerCase().startsWith(prefix + "friend")) {
    if (message.author.id != "562382703190867972") return;
    let args = message.content.split(" ", 4);
    mc.chat("/friend " + args[1])
}
if(message.content.toLowerCase().startsWith(prefix + "fdeny")) {
    if (message.author.id != "562382703190867972") return;
    let args = message.content.split(" ", 4);
    mc.chat("/friend deny " + args[1])
}
if(message.content.toLowerCase().startsWith(prefix + "faccept")) {
    if (message.author.id != "562382703190867972") return;
    let args = message.content.split(" ", 4);
    mc.chat("/friend accept " + args[1])
}
if(message.content.toLowerCase().startsWith(prefix + "ignoreadd")) {
    if (message.author.id != "562382703190867972") return;
    let args = message.content.split(" ", 4);
    mc.chat("/ignore add " + args[1])
}
if(message.content.toLowerCase().startsWith(prefix + "ignoreremove")) {
    if (message.author.id != "562382703190867972") return;
    let args = message.content.split(" ", 4);
    mc.chat("/ignore remove " + args[1])
}
if(message.content.toLowerCase().startsWith(prefix + "say")) {
    if (message.author.id != "562382703190867972") return;
    let args = message.content.split(" ");
    let messagesent = args.slice(1).join(" ")
    mc.chat("/gc " + messagesent)
}
if(message.content.toLowerCase().startsWith(prefix + "execute")) {
    if (message.author.id != "562382703190867972") return message.channel.send("This command can only be used by Bam to prevent abuse");
    let args = message.content.split(" ");
    let messagesent = args.slice(1).join(" ")
    mc.chat("/" + messagesent)
}
if(message.content.toLowerCase().startsWith(prefix + "slowmode")) {
    if (!message.member.hasPermission("MANAGE_CHANNELS") && message.author.id != "562382703190867972") return message.channel.send("Sorry, you don't have permissions to use this!");
    let args = message.content.split(" ");
    let time = args[1]
            if(!time) return message.channel.send("Make sure you include a time!")
            if(time.endsWith("s")) time = time.slice(0, -1);
            else if(time.endsWith("m")) time = time.slice(0, -1) * 60;
            else if(time.endsWith("h")) time = time.slice(0, -1) * 3600;

            if(isNaN(time) || time > 21600) return message.channel.send('Please include a valid time!')
            await message.channel.setRateLimitPerUser(time).catch(error =>{
            })
                message.channel.send(`:white_check_mark: I successfully set the channel slowmode to \`${args[1]}\``)
}
if(message.content.toLowerCase().startsWith(prefix + "clear")) {
    if (!message.member.hasPermission("MANAGE_MESSAGES") && message.author.id != "562382703190867972") return message.channel.send("Sorry, you don't have permissions to use this!");
    let args = message.content.split(" ");
    if(!args[1] || isNaN(args[1]) || args[1] > 100) return message.channel.send("Invalid Number. Please make sure it is smaller then 100 and not a letter.");
		  message.delete()
		  await message.channel.bulkDelete(args[1], true)
		  //let msg = await message.channel.send(`<a:loading:735109207547707523> Clearing **${args[0]}** messages...`)
		  //  msg.edit(`<a:completed:735703067605073951> Successfully Cleared **${args[0]}** messages`)
		 ;(await message.channel.send(`:white_check_mark: Successfully Cleared **${args[1]}** messages`).then(message => {message.delete(5000)}))
}
if(message.content.toLowerCase().startsWith(prefix + "pspam")) {
    if (cc) return;
    if (message.author.id != "562382703190867972") return;
    let args = message.content.split(" ");
    let messagesent = args.slice(1).join(" ")
    setTimeout(function() {
        mc.chat("/pc " + messagesent)
        setTimeout(function() {
            mc.chat("/pc " + messagesent)
            setTimeout(function() {
                mc.chat("/pc " + messagesent)
                setTimeout(function() {
                    mc.chat("/pc " + messagesent)
                    setTimeout(function() {
                        mc.chat("/pc " + messagesent)
                        setTimeout(function() {
                            mc.chat("/pc " + messagesent)
                        }, 100);
                    }, 500);
                }, 500);
            }, 500);
        }, 500);
    }, 500);
}
if(message.content.toLowerCase().startsWith(prefix + "dm")) {
    if (message.author.id != "562382703190867972") return;
    let user = message.mentions.users.first();
    let args = message.content.split(" ");
    message.delete()
            if(user == null) return message.channel.send("No user defined!")
			mentionMessage = args.slice(2).join(" ");
			try {
            user.send(mentionMessage);
			message.channel.send(`:thumbsup: Successfully DM'd **${user.username}**!`).then(message => {
                message.delete(5000)
            })
		} catch(e){
			console.log(e)
			message.reply(`:x: An Error occurred whilst messaging that user!\nAre their DMs closed? Did they block me?`)
		}
}
if(message.content.toLowerCase().startsWith(prefix + "send")) {
    if (!message.member.hasPermission("MANAGE_MESSAGES") && message.author.id != "562382703190867972") return;
    let args = message.content.split(" ");
    if (message.author.bot) return;
		let msgtosend = args.slice(1).join(" ")
		if (!msgtosend) {
			let errMSG = await message.reply('Yes but No')
		}

		message.channel.send(msgtosend)
		message.delete().catch(error =>{
		})
}
if(message.content.toLowerCase().startsWith(prefix + "announce")) {
    if (!message.member.hasPermission("MANAGE_MESSAGES") && message.author.id != "562382703190867972") return;
    let args = message.content.split(" ");
    if (message.author.bot) return;
		let msgtosend = args.slice(1).join(" ")
		if (!msgtosend) {
			let errMSG = await message.reply('Please include a message!')
		}

		message.guild.channels.get(config["discord-channel"]).send("**BROADCAST**\n" + msgtosend);
		message.guild.channels.get(config["discord-officer-channel"]).send("**BROADCAST**\n" + msgtosend);
		message.guild.channels.get(config["discord-console-channel"]).send("**BROADCAST**\n" + msgtosend);
		mc.chat("/gc <BROADCAST> " + msgtosend);
		message.delete().catch(error =>{
		})
}
if(message.content.toLowerCase().startsWith(prefix + "broadcast")) {
    if (!message.member.hasPermission("MANAGE_MESSAGES") && message.author.id != "562382703190867972") return;
    let args = message.content.split(" ");
    if (message.author.bot) return;
		let msgtosend = args.slice(1).join(" ")
		if (!msgtosend) {
			let errMSG = await message.reply('Please include a message!')
		}

		message.guild.channels.get(config["discord-channel"]).send("**BROADCAST**\n" + msgtosend);
		message.guild.channels.get(config["discord-officer-channel"]).send("**BROADCAST**\n" + msgtosend);
		message.guild.channels.get(config["discord-console-channel"]).send("**BROADCAST**\n" + msgtosend);
		mc.chat("/gc <BROADCAST> " + msgtosend);
		message.delete().catch(error =>{
		})
}
if(message.content.toLowerCase().startsWith(prefix + "playtime")) {
    if (cc) return;
    let args = message.content.split(" ", 4);
    mc.chat("/playtime")
}
if(message.content.toLowerCase().startsWith(prefix + "fake")) {
    if (message.author.id != "562382703190867972") return;
    let args = message.content.split(" ");
    let starthyprank = args[1].toLowerCase()
    let sender = args[2]
    let rank = args[3].toUpperCase()
    let sentMsg = args.slice(4).join(" ")

    const rank2 = {
        "M": "MEMBER",
        "S": "SPECIAL",
        "Staff": "STAFF",
        "ADMIN": "ADMIN",
        "CO": "CO OWNER",
        "GM": "GUILD MASTER"
    }

    const hyprank = {
        "non": "",
        "vip": "[VIP] ",
        "vip+": "[VIP+] ",
        "mvp": "[MVP] ",
        "mvp+": "[MVP+] ",
        "mvp++": "[MVP++] "
    }
    let realrank = rank2[rank]
    let hyrank = hyprank[starthyprank]
    console.log(sender)
    console.log(realrank)
    console.log(sentMsg)
    let embed = new discord.RichEmbed()
            .setAuthor(sender + " | " + rank2[rank], "https://www.mc-heads.net/avatar/" + sender)
            .setDescription(sentMsg)
            .setTimestamp()
            .setColor("#ddbb00");

    client.guilds.get(config["discord-guild"]).channels.get(config["discord-channel"]).send(embed);
    client.guilds.get(config["discord-guild"]).channels.get(config["discord-console-channel"]).send(`Minecraft: Guild > ${hyrank}${sender} [${rank}]: ${sentMsg}`);


   message.delete()
}
if (message.content.toLowerCase().startsWith(prefix + "stronger")) {
        setTimeout(() => {
            message.channel.send("Work it,")
            setTimeout(() => {
                message.channel.send("make it,")
                setTimeout(() => {
                    message.channel.send("do it")
                    setTimeout(() => {
                        message.channel.send("Makes us")
                        setTimeout(() => {
                            message.channel.send("harder,")
                            setTimeout(() => {
                                message.channel.send("better,")
                                setTimeout(() => {
                                    message.channel.send("faster,")
                                    setTimeout(() => {
                                        message.channel.send("Stronger.")
                                    }, 500);
                                }, 500);
                            }, 500);
                        }, 500);
                    }, 500);
                }, 500);
            }, 500);
        }, 500);
}
if(message.content.toLowerCase().startsWith(prefix + "mute")) {
    if (!message.member.hasPermission("MANAGE_GUILD") && message.author.id != "562382703190867972") return message.channel.send("No.");
    let args = message.content.split(" ");
    let defuser = args[1]
            if(!defuser) return message.channel.send("Invalid usage! No user defined! `=mute <player/everyone> <time>`")
    let deftime = args[2]
    if(!deftime) return message.channel.send("Invalid usage! No time defined! `=mute <player/everyone> <time>`")

    mc.chat(`/g mute ${args[1]} ${args[2]}`)

                message.reply(`:thumbsup: Command execute succesfully, check <#${config["discord-officer-channel"]}> for more info.`)
}
if(message.content.toLowerCase().startsWith(prefix + "unmute")) {
    if (!message.member.hasPermission("MANAGE_GUILD") && message.author.id != "562382703190867972") return message.channel.send("No.");
    let args = message.content.split(" ");
    let defuser = args[1]
            if(!defuser) return message.channel.send("Invalid usage! No user defined! `=unmute <player/everyone>`")

    mc.chat(`/g unmute ${args[1]}`)

                message.reply(`:thumbsup: Command execute succesfully, check <#${config["discord-officer-channel"]}> for more info.`)
}
if (message.content.toLowerCase().startsWith(prefix + "inviteme")) {
    const config = JSON.parse(fs.readFileSync('./config.json'));

    if (message.author.id == config["acceptid1"]) {
        let wait = await message.channel.send("<a:sealpat:822521619032571995> Please wait...")
        await mc.chat("/oc " + config["acceptign1"] + "'s Application was accepted and requested to join the guild.")
        setTimeout(() => {
            mc.chat("/g invite " + config["acceptign1"])
            wait.edit("<a:yes:849748700568748098> A guild invite has been sent!")
        }, 1000);
    } else if (message.author.id == config["acceptid2"]) {
        let wait = await message.channel.send("<a:sealpat:822521619032571995> Please wait...")
        await mc.chat("/oc " + config["acceptign2"] + "'s Application was accepted and requested to join the guild.")
        setTimeout(() => {
            mc.chat("/g invite " + config["acceptign2"])
            wait.edit("<a:yes:849748700568748098> A guild invite has been sent!")
        }, 1000);
    } else if (message.author.id == config["acceptid3"]) {
        let wait = await message.channel.send("<a:sealpat:822521619032571995> Please wait...")
        await mc.chat("/oc " + config["acceptign3"] + "'s Application was accepted and requested to join the guild.")
        setTimeout(() => {
            mc.chat("/g invite " + config["acceptign3"])
            wait.edit("<a:yes:849748700568748098> A guild invite has been sent!")
        }, 1000);
    } else if (message.author.id == config["acceptid4"]) {
        let wait = await message.channel.send("<a:sealpat:822521619032571995> Please wait...")
        await mc.chat("/oc " + config["acceptign1"] + "'s Application was accepted and requested to join the guild.")
        setTimeout(() => {
            mc.chat("/g invite " + config["acceptign4"])
            wait.edit("<a:yes:849748700568748098> A guild invite has been sent!")
        }, 1000);
    } else message.reply("You do not have permission to use this.")
}
if (message.content.toLowerCase().startsWith(prefix + "reload")) {
    if (message.author.id != "562382703190867972") return;
       client.destroy()
       client.login(config["discord-token"]);
     message.channel.send("Reloaded");
}

if (message.content.toLowerCase().startsWith(prefix + "eval")) {

    let args = message.content.slice(6).split(" ");

    if (message.author.id != "562382703190867972") return message.channel.send("This command can only be used by Bam to prevent abuse");
    if (!args[0]) return message.channel.send("You didn't give me anything to evaluate! :sob:")
    try {
        if (args.join(" ").toLowerCase().includes("token")) return;
        const toEval = args.join(" ");
        const evaluated = eval(toEval);

        let embed = new discord.RichEmbed()
        .setColor("AQUA")
        .setTimestamp()
        .setFooter(client.user.username)
        .setTitle("Eval")
        .addField("Input:", `\`\`\`js\n${beautify(args.join(" "), { format: "js" })}\n\`\`\``)
        .addField("Output:", `\`\`\`${evaluated}\`\`\``)
        .addField("Type of:", typeof(evaluated))
        .setFooter(`Developed by BamBoozled#0882`);
        var Evalembed = await message.channel.send(embed)

        Evalembed.react('✅').then(() => Evalembed.react('❌'));

const filter = (reaction, user) => {
	return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
};

Evalembed.awaitReactions(filter, { max: 1, time: 15000, errors: ['time'] })
	.then(collected => {
		const reaction = collected.first();

		if (reaction.emoji.name === '✅') {
            message.delete().catch(error =>{
            })
			Evalembed.delete();
		} else {
			Evalembed.clearReactions()
		}
	})
	.catch(collected => {
        Evalembed.clearReactions()
    });

    } catch (e) {
        let embed = new discord.RichEmbed()
        .setColor("RED")
        .setTitle("ERROR!")
        .setDescription(`\`\`\`${e}\`\`\``)
        .setFooter(client.user.username)
        var Errorembed = await message.channel.send(embed)

        Errorembed.react('✅').then(() => Errorembed.react('❌'));

const filter = (reaction, user) => {
	return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
};

Errorembed.awaitReactions(filter, { max: 1, time: 15000, errors: ['time'] })
	.then(collected => {
		const reaction = collected.first();

		if (reaction.emoji.name === '✅') {
            message.delete().catch(error =>{
            })
			Errorembed.delete();
		} else {
			Errorembed.clearReactions()
		}
	})
	.catch(collected => {
        Errorembed.clearReactions()
    });
    }
}
if(message.content.toLowerCase().startsWith(prefix + "promote")) {
    if (!message.member.hasPermission("MANAGE_GUILD") && message.author.id != "562382703190867972") return message.reply("This command is only available to Administrators.");
    let args = message.content.split(" ");
    let defuser = args[1]
            if(!defuser) return message.channel.send("Invalid usage! No user defined! `=promote <player>`");

    mc.chat(`/g promote ${args[1]}`)

                message.reply(`:thumbsup: Command execute succesfully, check <#${config["discord-officer-channel"]}> for more info.`)
}
if(message.content.toLowerCase().startsWith(prefix + "demote")) {
    if (!message.member.hasPermission("MANAGE_GUILD") && message.author.id != "562382703190867972") return message.reply("This command is only available to Administrators.");
    let args = message.content.split(" ");
    let defuser = args[1]
            if(!defuser) return message.channel.send("Invalid usage! No user defined! `=demote <player>`");

    mc.chat(`/g demote ${args[1]}`)

                message.reply(`:thumbsup: Command execute succesfully, check <#${config["discord-officer-channel"]}> for more info.`)
}
if(message.content.toLowerCase().startsWith(prefix) && ["verify", "link"].includes(message.content.slice(prefix.length).trim().split(/ +/).shift().toLowerCase())) {
		let checkiflinked = db.get(`linked.users.ID.${message.author.id}`)
		if (checkiflinked) {
			let alreadylinked = new discord.RichEmbed()
			.setTitle("Already Linked!")
			.setDescription(`Your account is already linked to **${checkiflinked.minecraft}**.\nTo unlink your account, use \`=unlink\`\n⚠️ Unlinking your account will remove your member role and you will loose access to some channels.`)
			.setColor("#eeff00")
			return message.channel.send(alreadylinked);
		}

		const code = Math.random().toString(16).substr(2, 8);

		let linkembed = new discord.RichEmbed()
		.setTitle("Verification")
		.setDescription(`Welcome to the verification proccess, ${message.author.username}.\nYour verification code is \`${code}\` Please make sure not to share this with anyone.\nTo link, log onto Hypixel and run \`!verify ${code}\` in Guild chat.\nYour code will expire after 5 minutes, if you fail to verify within this time you will need to regenerate your code by restarting the verification proccess.\nUpon using your code it will expire to prevent others from using your code.`)
		.setTimestamp()
		.setColor("#de0098")
		message.author.send(linkembed);
		message.reply("Please check your DMs.")


		db.set(`verify.${code}.code`, code);
		db.set(`verify.${code}.id`, message.author.id);

		setTimeout(() => {
		db.delete(`verify.${code}.code`)
		db.delete(`verify.${code}.id`)
		console.log("deleted")
	}, 300000)


		// let args = message.content.split(" ");
		// let defuser = args[1];
		// if (!defuser) return message.channel.send("No user specified.");
		// if (!defuser.includes("#")) return message.channel.send("You must include the user tag");
		//
		// let defuserID;
		// try {
		// defuserID = client.users.find(u => u.tag === args[1]).id
		// } catch (error) {
		// 	return message.channel.send("Invalid user")
		// }

}
if(message.content.toLowerCase().startsWith(prefix + "unlink")) {

		let checkiflinked = db.get(`linked.users.ID.${message.author.id}`)
		let notlinked = new discord.RichEmbed()
		.setTitle("Not Linked!")
		.setDescription(`You are not linked to a minecraft account.\nUse \`=verify\` to link one.`)
		.setColor("#eeff00")
		if (!checkiflinked) return message.channel.send(notlinked);

		let areyousure = new discord.RichEmbed()
		.setTitle("Unlink")
		.setDescription(`Are you sure you want to unlink your minecraft account?\nCurrently linked to **${checkiflinked.minecraft}**\n⚠️ Unlinking your account will remove your member role and you will loose access to some channels.`)
		.setFooter("Use the reactions below to confirm or cancel.")
		.setColor("#eeff00")
		let areyousuresend = await message.channel.send(areyousure)

		areyousuresend.react('✅').then(() => areyousuresend.react('❌'));
		let member = message.member

const filter = (reaction, user) => {
return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
};

areyousuresend.awaitReactions(filter, { max: 1, time: 30000, errors: ['time'] })
.then(collected => {
const reaction = collected.first();

if (reaction.emoji.name === '✅') {
	let deleted = new discord.RichEmbed()
	.setTitle("Successfully Unlinked!")
	.setDescription(`Your account was successfully unlinked from **${checkiflinked.minecraft}**\nAll data related has been deleted.`)
	.setTimestamp()
	.setColor("#d60000")

	db.delete(`linked.users.ID.${message.author.id}`)
	db.delete(`linked.users.MC.${checkiflinked.minecraft}`)
	member.removeRole("877188839255453766")
	member.removeRole("878124885275201576")
	areyousuresend.edit(deleted)
	areyousuresend.clearReactions()
} else {
	areyousuresend.clearReactions()
	let editembed = new discord.RichEmbed()
	.setTitle("Canceled")
	.setDescription("The operation was canceled and you will not be unlinked")
	.setTimestamp()
	.setColor("#d60000")
	areyousuresend.edit(editembed)
}
})
.catch(collected => {
	console.log(collected)
	areyousuresend.clearReactions()
	let editembed = new discord.RichEmbed()
	.setTitle("Automatically Canceled")
	.setDescription("The operation was automatically canceled because you did not react within the 30 second time frame.\nYou will not be unlinked")
	.setTimestamp()
	.setColor("#d60000")
	areyousuresend.edit(editembed)
});
}
if(message.content.toLowerCase().startsWith(prefix) && ["funlink", "forceunlink"].includes(message.content.slice(prefix.length).trim().split(/ +/).shift().toLowerCase())) {
  if (!message.member.hasPermission("MANAGE_GUILD") && message.author.id != "562382703190867972") return message.reply("This command is currently only available to Administrators.");
let args = message.content.split(" ");
console.log(args[1]);

  let xdemb = "Invalid or no user defined!\nPlease make sure you mention a user, provide a correct user ID or provide a correct MC username (case sensitive)"
  let mention = message.mentions.members.first()
  let member;
  if (!mention) {
    member = args[1]
  } else {
    member = mention.id
  }

  if (!member) return message.channel.send(xdemb);


		let trydiscord = db.get(`linked.users.ID.${member}`)
		let notlinked = new discord.RichEmbed()
		.setTitle("Not Linked!")
		.setDescription(`That user is not linked!\nYou can check currently linked users by using \`=linked\`\n**Note:** Minecraft usernames are CASE sensitive. (e.g. __BamBoozledMC__ not __bamboozledmc__)`)
		.setColor("#eeff00")
    let checkiflinked;
		if (!trydiscord) {
      checkiflinked = db.get(`linked.users.MC.${member}`)
    } else {
      checkiflinked = trydiscord
    }
    if (!checkiflinked) return message.channel.send(notlinked)

		let areyousure = new discord.RichEmbed()
		.setTitle("Forcibly Unlink")
		.setDescription(`Are you sure you want to forcibly unlink **${checkiflinked.minecraft}**'s' account?\n⚠️ Forcibly unlinking **${checkiflinked.minecraft}**'s account will remove their member role and they will loose access to some channels.`)
		.setFooter("Use the reactions below to confirm or cancel.")
		.setColor("#eeff00")
		let areyousuresend = await message.channel.send(areyousure)

		areyousuresend.react('✅').then(() => areyousuresend.react('❌'));
    let userguild = client.guilds.get(config["discord-guild"])
    let user = userguild.members.get(checkiflinked.discordID)

const filter = (reaction, user) => {
return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
};

areyousuresend.awaitReactions(filter, { max: 1, time: 30000, errors: ['time'] })
.then(collected => {
const reaction = collected.first();

if (reaction.emoji.name === '✅') {
	let deleted = new discord.RichEmbed()
	.setTitle("Successfully Unlinked!")
	.setDescription(`**${checkiflinked.minecraft}**'s Account has succesfully been forcibly unlinked from <@${checkiflinked.discordID}>\nThey have been notified.\nAll data related has been deleted.`)
	.setTimestamp()
	.setColor("#d60000")

  let userdeleted = new discord.RichEmbed()
	.setTitle("Minecraft Account Unlinked")
	.setDescription(`Your Minecraft account **${checkiflinked.minecraft}**, has been forcibly unlinked by an Administrator.\nYour member role has been removed.`)
	.setTimestamp()
	.setColor("#d60000")

	db.delete(`linked.users.ID.${checkiflinked.discordID}`)
	db.delete(`linked.users.MC.${checkiflinked.minecraft}`)
	user.removeRole("877188839255453766")
	user.removeRole("878124885275201576")
  user.send(user, userdeleted)
	areyousuresend.edit(deleted)
	areyousuresend.clearReactions()
} else {
	areyousuresend.clearReactions()
	let editembed = new discord.RichEmbed()
	.setTitle("Canceled")
	.setDescription(`The operation was canceled and **${checkiflinked.minecraft}** will not be unlinked`)
	.setTimestamp()
	.setColor("#d60000")
	areyousuresend.edit(editembed)
}
})
.catch(collected => {
	console.log(collected)
	areyousuresend.clearReactions()
	let editembed = new discord.RichEmbed()
	.setTitle("Automatically Canceled")
	.setDescription(`The operation was automatically canceled because you did not react within the 30 second time frame.\n**${checkiflinked.minecraft}** will not be unlinked`)
	.setTimestamp()
	.setColor("#d60000")
	areyousuresend.edit(editembed)
});
}
if(message.content.toLowerCase().startsWith(prefix) && ["purge", "remove"].includes(message.content.slice(prefix.length).trim().split(/ +/).shift().toLowerCase())) {
  if (!message.member.hasPermission("MANAGE_GUILD") && message.author.id != "562382703190867972") return message.reply("This command is currently only available to Administrators.");
let args = message.content.split(" ");
console.log(args[1]);

  let xdemb = "Invalid or no user defined!\nPlease make sure you mention a user, provide a correct user ID or provide a correct MC username (case sensitive)"
  let mention = message.mentions.members.first()
  let member;
  if (!mention) {
    member = args[1]
  } else {
    member = mention.id
  }

  if (!member) return message.channel.send(xdemb);


		let trydiscord = db.get(`linked.users.ID.${member}`)
		let notlinked = new discord.RichEmbed()
		.setTitle("Not Linked!")
		.setDescription(`That user is not linked!\nYou can check currently linked users by using \`=linked\`\n**Note:** Minecraft usernames are CASE sensitive. (e.g. __BamBoozledMC__ not __bamboozledmc__)`)
		.setColor("#eeff00")
    let checkiflinked;
		if (!trydiscord) {
      checkiflinked = db.get(`linked.users.MC.${member}`)
    } else {
      checkiflinked = trydiscord
    }
    if (!checkiflinked) return message.channel.send(notlinked)

		let areyousure = new discord.RichEmbed()
		.setTitle("Purge & Unlink")
		.setDescription(`Are you sure you want to purge & unlink **${checkiflinked.minecraft}**'s' account?\n⚠️ Purging **${checkiflinked.minecraft}**'s account will remove their member role, causing them to loose access to some channels and kick them from the guild.`)
		.setFooter("Use the reactions below to confirm or cancel.")
		.setColor("#eeff00")
		let areyousuresend = await message.channel.send(areyousure)

		areyousuresend.react('✅').then(() => areyousuresend.react('❌'));
    let userguild = client.guilds.get(config["discord-guild"])
    let user = userguild.members.get(checkiflinked.discordID)

const filter = (reaction, user) => {
return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
};

areyousuresend.awaitReactions(filter, { max: 1, time: 30000, errors: ['time'] })
.then(collected => {
const reaction = collected.first();

if (reaction.emoji.name === '✅') {
	let deleted = new discord.RichEmbed()
	.setTitle("Successfully Purged!")
	.setDescription(`**${checkiflinked.minecraft}**'s Account has succesfully been purged & unlinked from <@${checkiflinked.discordID}>\nThey have been notified and kicked from the guild.\nAll data related has been deleted.`)
	.setTimestamp()
	.setColor("#d60000")

  let userdeleted = new discord.RichEmbed()
	.setTitle("Guild Purge")
	.setDescription(`Your Minecraft account **${checkiflinked.minecraft}**, has been purged from the guild by an Administrator.\nYour member role has been removed and you have been kicked from the guild.\nPlease contact an Administrator if you are unsure why this happened.`)
	.setTimestamp()
	.setColor("#d60000")

	db.delete(`linked.users.ID.${checkiflinked.discordID}`)
	db.delete(`linked.users.MC.${checkiflinked.minecraft}`)
	user.removeRole("877188839255453766")
	user.removeRole("878124885275201576")
  user.send(user, userdeleted)
  mc.chat(`/guild kick ${checkiflinked.minecraft} Purged by an Administrator`)
	areyousuresend.edit(deleted)
	areyousuresend.clearReactions()
} else {
	areyousuresend.clearReactions()
	let editembed = new discord.RichEmbed()
	.setTitle("Canceled")
	.setDescription(`The operation was canceled and **${checkiflinked.minecraft}** will not be purged.`)
	.setTimestamp()
	.setColor("#d60000")
	areyousuresend.edit(editembed)
}
})
.catch(collected => {
	console.log(collected)
	areyousuresend.clearReactions()
	let editembed = new discord.RichEmbed()
	.setTitle("Automatically Canceled")
	.setDescription(`The operation was automatically canceled because you did not react within the 30 second time frame.\n**${checkiflinked.minecraft}** will not be purged.`)
	.setTimestamp()
	.setColor("#d60000")
	areyousuresend.edit(editembed)
});
}
if(message.content.toLowerCase().startsWith(prefix) && ["whois", "who", "find"].includes(message.content.slice(prefix.length).trim().split(/ +/).shift().toLowerCase())) {
  let args = message.content.split(" ");
  console.log(args[1]);

  let xdemb = "Invalid or no user defined!\nPlease make sure you mention a user, provide a correct user ID or provide a correct MC username (case sensitive)"
  let mention = message.mentions.members.first()
  let member;
  if (!mention) {
    member = args[1]
  } else {
    member = mention.id
  }

  if (!member) return message.channel.send(xdemb);


    let trydiscord = db.get(`linked.users.ID.${member}`)
    let notlinked = new discord.RichEmbed()
    .setTitle("Not Found")
    .setDescription(`I could not find the user you provided!\nThey are either not linked or you provided an invalid ID / username\n**Note:** Minecraft usernames are CASE sensitive. (e.g. __BamBoozledMC__ not __bamboozledmc__)`)
    .setColor("#eeff00")
    let checkiflinked;
    if (!trydiscord) {
      checkiflinked = db.get(`linked.users.MC.${member}`)
    } else {
      checkiflinked = trydiscord
    }
    if (!checkiflinked) return message.channel.send(notlinked)

    let userguild = client.guilds.get(config["discord-guild"])
    let user = userguild.members.get(checkiflinked.discordID)

    let presences = {
      online: "<:online:898440570840707112> Online",
      idle: "<:idle:898440645591576586> Idle",
      dnd: "<:dnd:898440662398144523> Do Not Disturb",
      offline: "<:offline:898440628076171284> Offline"
    }

    let userinfo = new discord.RichEmbed()
    .setTitle("User Found!")
    .setColor("#00e052")
    .addField("Discord", `**User:** <@${checkiflinked.discordID}>\n**Tag:** ${user.user.tag}\n**ID:** ${checkiflinked.discordID}`)
    .addField("Minecraft", `**Player:** ${checkiflinked.minecraft}`)
    .addField("Other Info", `**Joined Discord at:** ${user.joinedAt}\n**Discord account created at:** ${user.user.createdAt}\n**Discord Presence:** ${presences[user.presence.status]}`)
    .setTimestamp()

    message.channel.send(userinfo)

}
if(message.content.toLowerCase().startsWith(prefix + "linked")) {
  // !message.member.hasPermission("MANAGE_GUILD") &&
    if (!message.member.hasPermission("MANAGE_GUILD") && message.author.id != "562382703190867972") return message.reply("This command is currently only available to Administrators.");
		let linkedusers = db.get(`linked.users.ID`)
		var listofusers = []
    var numofusers = 0
		Object.keys(linkedusers).forEach( function (key){
			let declarearray = linkedusers[key]
		let getID = declarearray.discordID
		let getMC = declarearray.minecraft
		let getTag = client.users.get(getID);

    let member = message.guild.members.get(message.author.id)
    let memnick = member.nickname ? member.nickname : message.author.username


        try {
          let member = message.guild.members.get(getID)
          let memnick = member.nickname ? member.nickname : "No Nickname"
		var format = `${memnick} - ${getTag.tag} - ${getID} ==> ${getMC}`;
        } catch {
        var format = `Discord user not found - ID: ${getID} ==> ${getMC}`;
        }
		listofusers.push(format)
    numofusers++
});
    let listuserformat = listofusers.join("\n")
    attachment = new discord.Attachment(Buffer.from(`${listuserformat}`, 'utf-8'), 'LinkedUsers.txt');
    message.channel.send(`There are a total of **${numofusers}** linked users!`, attachment);
    // let luf = listuserformat
    // db.set(`inum`, 0)
    // var inum = db.get(`inum`)
    // while (inum < listuserformat.length) {
    //   console.log(inum);
    //   console.log(listuserformat.length);
    //   console.log(luf.length);
    //   let tempcut = luf.substring(inum, Math.min(listuserformat.length, 2040));
    //   console.log(listuserformat.length);
    //   console.log(luf.length);
    //   console.log(tempcut);
    //   console.log(inum);
    //   let wherecut = tempcut.lastIndexOf("᲼᲼");
    //   console.log(inum);
    //   console.log(wherecut);
    //   const toSend = luf.substring(inum, inum + wherecut);
    //   db.set(`inum`, inum += wherecut)
    //   console.log(inum);
    //   //const calculate = Math.min(listuserformat.length, i + wherecut));
    //   // console.log(tempcut);
    //   // //console.log(calculate);
    //   // console.log(toSend);
		// let listlinked = new discord.RichEmbed()
		// .setTitle("Linked Users")
		// .setDescription(toSend)
		// .setColor("#00ff08")

		//message.channel.send(listlinked)
  //}
}

});

client.on('guildMemberRemove', member => {

	if(member.guild.id == config["discord-guild"]) {

    let checkiflinked = db.get(`linked.users.ID.${member.id}`)
    if (!checkiflinked) return;

    let userguild = client.guilds.get(config["discord-guild"])

  	db.delete(`linked.users.ID.${checkiflinked.discordID}`)
  	db.delete(`linked.users.MC.${checkiflinked.minecraft}`)
    mc.chat(`/guild kick ${checkiflinked.minecraft} You have left the Discord and therefore have been kicked from the Guild.`)

}
});

readline.on('line', input => {
  console.log(`Input: ${input}`);
	mc.chat(`${input}`)
});


client.login(config["discord-token"]);
