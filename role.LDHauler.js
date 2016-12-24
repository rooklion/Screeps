require('prototype.creep')();
var roleScooper = require('role.scooper');

module.exports = {
    run: function (creep) {
        //if (!(creep.manageRoomTarget())) {
            let result = creep.handleMovementCodes(creep.checkMovement());
            if (result != -200) {
                creep.manageState();
                if (creep.memory.working == true) {
                    if (creep.room.name == creep.memory.homePos.roomName) {
                        if (creep.room.storage) {
                            creep.memory.objectTarget = creep.room.storage.id;
                            creep.memory.objectAction = 'storeResources';
                            if (creep.storeResources(creep.room.storage) == false) {
                                creep.moveToTest(creep.room.storage, { range: 1 });
                            }
                        } else {
                            //if there is no storage, just deposit anywhere.  This is not ideal though...
                            creep.storeEnergy(true);
                        }
                    } else {
                        let homePos = new RoomPosition(creep.memory.homePos.x, creep.memory.homePos.y, creep.memory.homePos.roomName);
                        creep.moveToTest(homePos, {range: 1});
                    }
                }
                else {
                    let container = Game.getObjectById(creep.memory.container);
                    if (creep.room.name == container.pos.roomName) {
                        let resources = creep.room.find(FIND_DROPPED_RESOURCES);
                        if (container == undefined || (resources.length > 0 && container.energy < container.energyCapacity / 2)) {
                            roleScooper.run(creep);
                        } else {
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
                                    return creep.moveToTest(container.pos, { range: 1 });
                                }
                            }
                        }
                    } else {
                        creep.moveToTest(container.pos, {range: 1});
                    }
                }
            }
        //}
    }
};
