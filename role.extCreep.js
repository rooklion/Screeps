require('prototype.creep')();

module.exports = {
    run: function (creep) {
        if (creep.checkMovement() != -200) {
            if (!(creep.manageRoomTarget())) {
                if (creep.memory.flag == undefined) {
                    let myFlag = creep.room.returnLowestEmptyExtFlag();
                    let creeps = _.filter(Game.creeps, (c) => c.memory.flag.secondaryColor != myFlag.secondaryColor && c.memory.role == 'extcreep');
                    if (creeps.length == 0) {
                        creep.memory.flag = myFlag;
                    }
                }
                //let myFlag = Game.getObjectById(creep.memory.flag.id);

                if (!creep.pos.isEqualTo(creep.memory.flag.pos.x, creep.memory.flag.pos.y)) {
                    //console.log(creep.name);
                    let result = creep.moveToTest(creep.memory.flag.pos.x, creep.memory.flag.pos.y, {range: 0});
                    //console.log(result);
                } else {
                    creep.manageState();

                    if (creep.memory.working == true) {
                        //temp hack to make this happen each time
                        //delete creep.memory.depositTargets;



                        if (creep.memory.depositTargets == undefined) {
                            //COLOR_YELLOW is the color for extension flags
                            let lowerFlag = _.filter(Game.flags, (f) =>
                                f.room.name == creep.room.name
                                && f.color == COLOR_YELLOW
                                && f.secondaryColor == creep.memory.flag.secondaryColor - 1
                            )[0];
                            let roomExtensions = creep.room.find(FIND_MY_STRUCTURES, {filter: (s) =>
                                s.structureType == STRUCTURE_EXTENSION
                            });
                            if (lowerFlag != undefined) {
                                creep.memory.depositTargets = _.filter(roomExtensions, (e) =>
                                    e.pos.isNearTo(creep.memory.flag.pos.x, creep.memory.flag.pos.y)
                                    && !e.pos.isNearTo(lowerFlag.pos.x, lowerFlag.pos.y)
                                );
                            } else {
                                let lowerFlag = _.filter(Game.flags, (f) =>
                                    f.room.name == creep.room.name
                                    && f.color == COLOR_YELLOW
                                    && f.secondaryColor == creep.memory.flag.secondaryColor - 1
                                )[0];
                                creep.memory.depositTargets = _.filter(roomExtensions, (e) =>
                                    e.pos.isNearTo(creep.memory.flag.pos.x, creep.memory.flag.pos.y)
                                );
                            }
                        }
                        let depositTargets = _.filter(creep.memory.depositTargets, function(tar) {
                            tar = Game.getObjectById(tar.id);
                            return tar.energy < tar.energyCapacity;
                        });
                        if (depositTargets.length > 0) {
                            let target = Game.getObjectById(depositTargets[0].id);
                            creep.transfer(target, RESOURCE_ENERGY);
                        }
                    } else {
                        if (creep.memory.withdrawTargets == undefined) {
                            console.log('test');
                            //let myFlag = Game.getObjectById(creep.memory.flag.id);
                            let lowerFlag = _.filter(Game.flags, (f) =>
                                f.room.name == creep.room.name
                                && f.color == COLOR_YELLOW
                                && f.secondaryColor == creep.memory.flag.secondaryColor - 1
                            )[0];
                            let roomExtensions = creep.room.find(FIND_MY_STRUCTURES, {filter: (s) =>
                                s.structureType == STRUCTURE_EXTENSION
                            });
                            if (lowerFlag != undefined) {
                                creep.memory.withdrawTargets = _.filter(roomExtensions, (e) =>
                                    e.pos.isNearTo(creep.memory.flag.pos.x, creep.memory.flag.pos.y)
                                    && e.pos.isNearTo(lowerFlag.pos.x, lowerFlag.pos.y)
                                );

                            } else {
                                creep.memory.withdrawTargets = _.filter(roomExtensions, (e) =>
                                    e.pos.isNearTo(creep.memory.flag.pos.x, creep.memory.flag.pos.y)
                                );
                            }
                        }
                        let withdrawTargets = _.filter(creep.memory.withdrawTargets, function(tar) {
                            tar = Game.getObjectById(tar.id);
                            return tar.energy > 0;
                        });
                        if (withdrawTargets.length > 0) {
                            let target = Game.getObjectById(withdrawTargets[0].id);
                            let result = creep.withdraw(target, RESOURCE_ENERGY);
                            creep.memory.working = true;
                        }
                    }
                }
            }
        }
    }
};
