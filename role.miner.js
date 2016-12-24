require('prototype.creep')();

module.exports = {
    run: function (creep) {
        //if (!(creep.manageRoomTarget())) {
            let result = creep.handleMovementCodes(creep.checkMovement());
            if (result != -200 && result != -203) {
                let source = Game.getObjectById(creep.memory.sourceId);
                creep.memory.objectTarget = source.id;
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
                    creep.moveToTest(container.pos, { range: 0 });
                }
            }
        //}
    }
};
