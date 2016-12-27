require('prototype.creep')();
var roleBuilder = require('role.builder');
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
            let result = creep.handleMovementCodes(creep.checkMovement());
            //if cached results fail and a new one must be generated
            //TODO: add cached action
            if (result != -200) {
                creep.manageState();
                if (creep.memory.working == true) {
                    let disFlags = _.filter(Game.flags, (f) =>
                    f.pos.roomName == creep.room.name
                    && f.color == COLOR_RED
                    && f.secondaryColor == COLOR_RED
                    );

                    if (disFlags.length > 0) {

                        let flag = creep.pos.findClosestByPath(disFlags);
                        let structure = flag.pos.lookFor(LOOK_STRUCTURES)[0];
                        if (structure != undefined) {
                            if (creep.dismantle(structure) == ERR_NOT_IN_RANGE) {
                                creep.moveToTest(flag, {range: 1});
                            }
                        } else {
                            flag.remove();
                        }
                    } else {
                        roleBuilder.run(creep);
                    }

                }
                else {
                    creep.storeEnergy(false);
                }
            }
        }
    }
};
