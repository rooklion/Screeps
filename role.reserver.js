require('prototype.creep')();
var roleCTARefuge = require('role.CTARefuge')

module.exports = {
    run: function (creep) {
        if (!Memory.CTA[creep.memory.target]) {
            if (creep.room.name == creep.room.target) {
                let hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
                if (hostiles.length > 0) {
                    roleCTARefuge.callCTA(creep.room.name, hostiles);
                    roleCTARefuge.run(creep);
                    return;
                }
            }
        } else {
            creep.memory.role = 'CTARefuge';
            delete creep.memory._move;
            delete creep.memory.objectTarget;
            delete creep.memory.objectAction;
            roleCTARefuge.run(creep);
            return;
        }

        if (!(creep.manageRoomTarget())) {
            // try to claim controller
            if (creep.checkMovement() != -200) {
                if (creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    // move towards the controller
                    creep.moveToTest(creep.room.controller);
                }
            }
        }
    }
};
