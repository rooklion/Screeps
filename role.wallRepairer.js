var roleBuilder = require('role.builder');

module.exports = {
    run: function (creep) {
        if (!(creep.manageRoomTarget())) {
            let result = creep.handleMovementCodes(creep.checkMovement());
            //codes are in prototype.creep
            //MOVEMENT_OK = -200, REPAIR_OK = -201
            if (result != -200 && result != -201) {
                creep.manageState();

                if (creep.memory.working == true) {
                    var walls = creep.room.find(FIND_STRUCTURES,
                        { filter: (s) => s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART });

                    walls.sort((a, b) => _(a.hits / a.hitsMax) - (b.hits / b.hitsMax));

                    let target = walls[0];

                    //var target = undefined;

                    //for (let percentage = 0.0001; percentage <= 1; percentage = percentage + 0.0001) {


                    //    for (let wall of walls) {
                    //        if (wall.hits / wall.hitsMax < percentage) {

                    //            target = wall;
                    //            break;
                    //        }
                    //    }
                    //    if (target != undefined) {
                    //        break;
                    //    }
                    //}

                    if (target != undefined) {
                        creep.memory.objectTarget = target.id;
                        creep.memory.objectAction = 'repair';
                        if (creep.repair(target) == ERR_NOT_IN_RANGE) {
                            //creep.moveTo(target);
                            creep.moveToTest(target, { range: 3 });
                        }

                    }
                    else {
                        roleBuilder.run(creep);
                    }
                }
                else {
                    creep.gatherEnergy(false);
                }
            }
        }
    }
};
