require('prototype.creep')();
var roleBuilder = require('role.builder');

module.exports = {
    run: function (creep) {
        if (!(creep.manageRoomTarget())) {
            let result = creep.handleMovementCodes(creep.checkMovement());
            if (result != -200 && result != -201) {
                creep.manageState();
                if (creep.memory.working == true) {
                    var structures = creep.room.find(FIND_STRUCTURES,
                         { filter: (s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART });

                    //sort structures by percentage
                    structures.sort((a, b) => (a.hits / a.hitsMax) - (b.hits / b.hitsMax));

                    let structure = structures[0];
                    if (structure != undefined) {
                        creep.memory.objectTarget = structure.id;
                        creep.memory.objectAction = 'repair';
                        if (creep.repair(structure) == ERR_NOT_IN_RANGE) {
                            //creep.moveTo(structure);
                            creep.moveToTest(structure, { range: 3 });
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
