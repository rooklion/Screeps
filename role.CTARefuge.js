require('prototype.creep')();

module.exports = {
    run: function (creep) {
        if (!creep.memory.homePos) {
            console.log(creep.name + " CTA refuge does not have a home!!!");
            creep.memory.homePos = Game.spawns.Spawn1.pos;
            return;
        }
        if (creep.checkMovement() != -200) {
            //let spawns = _.filter(Game.spawns, (s) => s.room.name == creep.memory.homePos.roomName);
            if (creep.room.name != creep.memory.homePos.roomName) {
                let homePos = new RoomPosition(creep.memory.homePos.x, creep.memory.homePos.y, creep.memory.homePos.roomName);
                creep.moveToTest(homePos);
            } else {
                let spawns = _.filter(Game.spawns, (s) => s.room.name == creep.memory.homePos.roomName);
                var spawn = undefined;
                //Get one spawn.  Better way than a loop???
                for (let s in spawns) {
                    spawn = spawns[s];
                    break;
                }
                if (spawn != undefined) {
                    creep.moveToTest(spawn.pos, { range: 1 });
                } else {
                    console.log("CTARefuge " + creep.name + " could not find a spawn to run to.");
                }
            }
        }
    }
};

module.exports.callCTA = function (roomName, hostiles) {
    var ticks = 0;
    for (let h in hostiles) {
        if (hostiles[h].ticksToLive > ticks) {
            ticks = hostiles[h].ticksToLive;
            console.log("new ticks: " + ticks);
        }
    }
    Memory.CTA[roomName] = { ticks: ticks };
}
