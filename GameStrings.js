function GetSeerRoleMessage() {
    return "Your role has been decided. You are SEER . Each day phase you get one vote for who you want the village to lynch (the person that you think is most likely to be a werewolf). As villagers it is your job to snuff out the wolves and save the village. You win the game when all 3 werewolves are destroyed. As the seer, each night you can choose one players role to look up.  Please PM me if you have any questions. Please do not post in the thread until the day has started";
}

function GetAngelRoleMessage() {
    return "Your role has been decided. You are The Angel . Each day phase you get one vote for who you want the village to lynch (the person that you think is most likely to be a werewolf). As villagers it is your job to snuff out the wolves and save the village. You win the game when all 3 werewolves are destroyed. As the angel, each night you can choose one player (including yourself, and this should probably be the default for new players), to protect from getting eaten by the wolves.  Please PM me if you have any questions. Please do not post in the thread until the day has started";
}

function GetVigilanteRoleMessage() {
    return "Your role has been decided. You are The Vigilante. Each day phase you get one vote for who you want the village to lynch (the person that you think is most likely to be a werewolf). As villagers it is your job to snuff out the wolves and save the village. You win the game when all 3 werewolves are destroyed. As the vig, every other night you can choose one player to shoot. You can roll over your shot to the next night (or never use it) but you can never have more than 1 shot per night.  Please PM me if you have any questions. Please do not post in the thread until the day has started";
}

function GetWolfRoleMessage() {
    return "Your role has been decided. You are a  WOLF . Your objective is to gain half of the population of the village using deception and concealing your identity. I will add you to a group DM here on discord with the other wolves. Please accept my friend request so that I can do that. Each Night phase the wolves will decide on a person to eat. If you die, you will no longer be able to communicate in the wolf chat either. Let me know if you have any other questions.";
}

function GetVillagerRoleMessage() {
    return "Ahoy, and thank you for signing up to play werewolf. The day phase will last for 24 hours. That means you have  24 hours to cast your vote. Your role has been decided. You are a Villager. Each day phase you get one vote for who you want the village to lynch (the person that you think is most likely to be a werewolf). As villagers it is your job to snuff out the wolves and save the village. You win the game when all 3 werewolves are destroyed. Please PM me if you have any questions.";
}

function GetDay1Rules(numberOfUsers){
    var rules = "Welcome to the TDM village. Day 1 is about to begin. Some sneaky wolves have infiltrated the village. It is on the village to snuff them out. The game will start at **" + getNearestHalfHourTimeString() + "**";
    rules += "\nIn order to vote to lynch a player, do so by saying: !lynch @the-user-you-want-to-lynch";
    rules += "\n\nThe day will end 8 hours after majority reached OR once everyone’s voted AND there is a majority OR 24 hours after day start (if no majority at this time, kill whoever has most votes and also kill whoever hasn’t voted)";
    rules += "\nNo editing posts"
    rules += "\nNo deleting posts"
    rules += "\nNo talking about Mafia anywhere other than this chat, the wolf chat, or the ghost chat";
    rules += "\n\nThe Village:"
    rules += "\n1 Angel - gets to protect someone from dying each night"
    rules += "\n1 Seer - gets to look up a role each night"
    rules += "\n1 Vigilante - gets a bullet every other night to kill who they want"
    rules += "\n3 Wolves - get to kill a villager each night"
    rules += "\n7 vanilla villagers";
    rules += "\n\nThe players:"
    return rules;
}

function getNearestHalfHourTimeString() {
    var now = new Date();
    var hour = now.getHours();
    var minutes = now.getMinutes();
    var ampm = "AM";
    if (minutes < 30) {
        minutes = "30";
    } else {
        minutes = "00";
        ++hour;
    }
    if (hour > 23) {
        hour = 12;
    } else if (hour > 12) {
        hour = hour - 12;
        ampm = "PM";
    } else if (hour == 12) {
        ampm = "PM";
    } else if (hour == 0) {
        hour = 12;
    }

    return(hour + ":" + minutes + " " + ampm);
}

module.exports = {
    GetSeerRoleMessage : GetSeerRoleMessage,
    GetAngelRoleMessage : GetAngelRoleMessage,
    GetVigilanteRoleMessage : GetVigilanteRoleMessage,
    GetWolfRoleMessage : GetWolfRoleMessage,
    GetVillagerRoleMessage : GetVillagerRoleMessage,
    GetDay1Rules : GetDay1Rules
}