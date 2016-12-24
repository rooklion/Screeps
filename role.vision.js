require('prototype.creep')();
var roleCTARefuge = require('role.CTARefuge')

module.exports = {
    run: function (creep) {
        if (!Memory.CTA[creep.room.name]) {
            let hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
            if (hostiles.length > 0) {
                roleCTARefuge.callCTA(creep.room.name, hostiles);
            }
        } else {
            //we will run away until ticks == 0
            if (Memory.CTA[creep.room.name].ticks > 0) {
                creep.memory.role = 'CTARefuge';
                delete creep.memory._move;
                delete creep.memory.objectTarget;
                delete creep.memory.objectAction;
                roleCTARefuge.run(creep);
                return;
            }
            //now vision will act as a scout into the room
        }
        //creep will simply keep moving to his destination and sit in the room.

        //if we're at the edge of the room, move one step in
        if (creep.room.name == creep.room.target) {
            if (creep.moveFromRoomEdge()) {
                return;
            }
        }

        if (creep.checkMovement() != -200) {
            if (!(creep.manageRoomTarget())) {
                //probably redundant, but check again that we've arrived
                if (creep.room.name == creep.memory.target) {
                    if (Memory.CTA[creep.room.name]) {
                        let hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
                        if (hostiles.length == 0) {
                            console.log('CTA cleared!');
                            delete Memory.CTA[creep.room.name];
                        } else {
                            Memory.hostiles = hostiles;
                            console.log("NOPE!  Running away again");
                            roleCTARefuge.callCTA(creep.room.name, hostiles);
                            //NOPE!  We run away again.
                            creep.memory.role = 'CTARefuge';
                            delete creep.memory._move;
                            delete creep.memory.objectTarget;
                            delete creep.memory.objectAction;
                            roleCTARefuge.run(creep);
                            return;
                        }
                    }
                }
            }
        }
    }
};
