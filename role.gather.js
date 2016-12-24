require('prototype.creep')();
var roleScooper = require('role.scooper');

module.exports = {
    run: function (creep) {
        if (!(creep.manageRoomTarget())) {
            let result = creep.handleMovementCodes(creep.checkMovement());
            if (result != -200) {
                creep.manageState();
                if (creep.memory.working == true) {
                    if (creep.room.storage) {
                        creep.memory.objectTarget = creep.room.storage.id;
                        creep.memory.objectAction = 'storeResources';
                        if (creep.storeResources(creep.room.storage) == false) {
                            creep.moveToTest(creep.room.storage, { range: 1 });
                        }
                    }
                }
                else {
                    let resources = creep.room.find(FIND_DROPPED_RESOURCES);
                    //swapBool is true is there are resources in the room
                    //If there are resources, only gather while containers are above 1/2 capacity.
                    let swapBool = (resources != undefined);
                    let containers = creep.room.find(FIND_STRUCTURES, {
                        filter: (s) => s.structureType == STRUCTURE_CONTAINER
                        && _.sum(s.store) >= (swapBool ? (s.storeCapacity / 2) : creep.carryCapacity)
                    });
                    containers.sort((a, b) => _.sum(a.store) < _.sum(b.store));

                    let container = containers[0];
                    if (container != undefined) {
                        creep.memory.objectTarget = container.id;
                        creep.memory.objectAction = 'gatherResource';
                        if (_.sum(container.store) >= creep.carryCapacity) {
                            if (creep.pos.isNearTo(container.pos)) {
                                for (var resourceType in container.store) {
                                    if (_.sum(creep.carry) < creep.carryCapacity) {
                                        creep.withdraw(container, resourceType);
                                    }
                                }
                            } else {
                                return creep.moveToTest(container, { range: 1 });
                            }
                        }
                    } else {
                        roleScooper.run(creep);
                    }
                }
            }
	    }
	}
};