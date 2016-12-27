require('prototype.creep')();
var roleCTARefuge = require('role.CTARefuge')

module.exports = {
    run: function (creep) {
        let source = Game.getObjectById(creep.memory.sourceId);
        if (!Memory.CTA[source.room.name]) {
            if (creep.room.name == source.room.name) {
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
        //if (!(creep.manageRoomTarget())) {
        let r = creep.checkMovement();
        let result = creep.handleMovementCodes(r);
            if (result != -200 && result != -203) {
                let source = Game.getObjectById(creep.memory.sourceId);
                creep.memory.objectTarget = creep.memory.sourceId;
                creep.memory.objectAction = 'mine';
                if (creep.memory.containerId == undefined) {
                    let container = source.pos.findInRange(FIND_STRUCTURES, 1, {
                        filter: (s) => s.structureType == STRUCTURE_CONTAINER
                    })[0];
                    creep.memory.containerId = container.id;
                }
                let container = Game.getObjectById(creep.memory.containerId);
                if (creep.pos.isEqualTo(container)) {
                    creep.harvest(source);
                }
                else {
                    //creep.moveTo(container);
                    if (container != undefined) {
                        creep.moveToTest(container.pos, { range: 0 });
                    }
                }
            }
        //}
    }
};
