require('prototype.creep')();

module.exports = {
    run: function (creep) {
        if (!(creep.manageRoomTarget())) {
            let result = creep.handleMovementCodes(creep.checkMovement());
            if (result != -200) {
                //working: storing energy, notworking: harvesting energy
                creep.manageState();

                if (creep.memory.working == true) {
                     let result = creep.storeEnergy(true, false);
                }
                
                else {
                    creep.harvestSource();
                }
            }
        }
    }
};