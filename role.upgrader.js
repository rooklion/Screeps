module.exports = {
    run: function (creep) {
        if (!(creep.manageRoomTarget())) {
            let result = creep.handleMovementCodes(creep.checkMovement());
            
            if (result != -200 && result != -204) {
                creep.manageState();
                if (creep.memory.working == true) {
                    creep.memory.objectTarget = creep.room.controller.id;
                    creep.memory.objectAction = 'upgrade';
                    if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                        creep.moveToTest(creep.room.controller, { range: 3 });
                    }
                }
                else {
                    creep.gatherEnergy();
                }
            }
        }
    }
};