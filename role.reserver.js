require('prototype.creep')();

module.exports = {
    run: function (creep) {
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