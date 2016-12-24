require('prototype.creep')();
var roleScooper = require('role.scooper');

module.exports = {
    run: function (creep) {
        if (!(creep.manageRoomTarget())) {
            let result = creep.handleMovementCodes(creep.checkMovement());
            if (result != -200) {
                creep.manageState();
                if (creep.memory.working == true) {
                    //store energy in spawners. 2nd true is for no containers.  Lorry should only deposit in spawners
                    creep.storeEnergy(true, true);
                    //no structure with low enough energy has been found
                }
                else {
                    //gather energy from containers
                    let result = creep.gatherEnergy(true);
                    if (result == false) {
                        //if no energy is found in containers, look for it on the ground somewhere
                        roleScooper.run(creep);
                    }
                }
            }
	    }
    }
};