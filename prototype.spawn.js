module.exports = function () {
    StructureSpawn.prototype.createCustomCreep =
        function (energy, roleName, target) {
            var energyUsed = 0;
            var numParts = Math.floor(energy / 250);
            var body = [];
            for (let i = 0; i < numParts; i++) {
                body.push(WORK);
                energyUsed += 100;
            }
            for (let i = 0; i < numParts; i++) {
                body.push(CARRY);
                energyUsed += 50;
            }
            //should double up the move parts
            for (let i = 0; i < numParts * 2; i++) {
                body.push(MOVE);
                energyUsed += 50;
            }

            return this.createCreep(body, undefined, {
                role: roleName,
                energyUsed: energyUsed,
                working: false,
                target: target,
                homePos: this.pos
            });
        };

    StructureSpawn.prototype.createRepairer =
        function (target) {
            return this.createCreep([WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], undefined, {
                role: 'repairer',
                energyUsed: 500,
                working: false,
                target: target,
                homePos: this.pos
            });
        };

    StructureSpawn.prototype.createBuilder =
        function (target) {
            return this.createCreep([WORK, CARRY, CARRY, CARRY, MOVE, MOVE], undefined, {
                role: 'builder',
                energyUsed: 350,
                working: false,
                target: target,
                homePos: this.pos
            });
        };

    StructureSpawn.prototype.createEmergencyRepairer =
        function (energy, target) {
            var energyUsed = 0;
            var numParts = Math.floor(energy / 250);
            var body = [];
            for (let i = 0; i < numParts; i++) {
                body.push(WORK);
                energyUsed += 100;
            }
            for (let i = 0; i < numParts; i++) {
                body.push(CARRY);
                energyUsed += 50;
            }
            //should double up the move parts
            for (let i = 0; i < numParts * 2; i++) {
                body.push(MOVE);
                energyUsed += 50;
            }

            return this.createCreep(body, undefined, {
                role: 'repairer',
                energyUsed: energyUsed,
                target: target,
                working: false,
                homePos: this.pos
            });
        };

    StructureSpawn.prototype.createLongDistanceHarvester =
        function (energy, numOfWorkParts, homePos, target, sourceIndex) {
            var energyUsed = 0;
            var body = [];
            for (let i = 0; i < numOfWorkParts; i++) {
                body.push(WORK);
                energyUsed += 100;
            }

            energy -= 150 * numOfWorkParts;

            var numParts = Math.floor(energy / 100);

            for (let i = 0; i < numParts; i++) {
                body.push(CARRY);
                energyUsed += 50;
            }
            for (let i = 0; i < numParts + numOfWorkParts; i++) {
                body.push(MOVE);
                energyUsed += 50;
            }


            return this.createCreep(body, undefined, {
                role: 'longDistanceHarvester',
                homePos: homePos,
                target: target,
                sourceIndex: sourceIndex,
                energyUsed: energyUsed,
                working: false
            });
        }

    StructureSpawn.prototype.createClaimer =
        function (target) {
            return this.createCreep([CLAIM, MOVE], undefined, {
                role: 'claimer',
                target: target,
                homePos: this.pos
            })
        }

    StructureSpawn.prototype.createReserver =
        function (target) {
            return this.createCreep([CLAIM, CLAIM, MOVE], undefined, {
                role: 'reserver',
                target: target,
                homePos: this.pos
            })
        }

    StructureSpawn.prototype.createMiner =
        function (sourceId) {

            return this.createCreep([WORK, WORK, WORK, WORK, WORK, MOVE], undefined, {
                role: 'miner',
                energyUsed: 550,
                sourceId: sourceId,
                homePos: this.pos
            })
        }

    StructureSpawn.prototype.createCarry =
        function (energy, roleName, target) {
            var energyUsed = 0;
            var numParts = Math.floor(energy / 150);
            var body = [];
            for (let i = 0; i < numParts * 2; i++) {
                body.push(CARRY);
                energyUsed += 50;
            }
            //should double up the move parts
            for (let i = 0; i < numParts; i++) {
                body.push(MOVE);
                energyUsed += 50;
            }

            return this.createCreep(body, undefined, {
                role: roleName,
                energyUsed: energyUsed,
                working: false,
                target: target,
                homePos: this.pos
            });
        };

    StructureSpawn.prototype.createVision =
        function (target) {
            let exit = this.room.findExitTo(target);
            return this.createCreep([MOVE], undefined, {
                role: 'vision',
                exit: exit,
                homePos: this.pos,
                target: target
            })
        }

//TODO: merge this with createCarry and just add opts to the arguments
        StructureSpawn.prototype.createLDHauler =
            function (container, homePos) {
                var energyUsed = 550;
                // var numParts = Math.floor(energy / 150);
                // var body = [];
                // for (let i = 0; i < numParts * 2; i++) {
                //     body.push(CARRY);
                //     energyUsed += 50;
                // }
                // //should double up the move parts
                // for (let i = 0; i < numParts; i++) {
                //     body.push(MOVE);
                //     energyUsed += 50;
                // }

                // return this.createCreep(body, undefined, {
                return this.createCreep([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], undefined, {
                    role: 'LDHauler',
                    energyUsed: energyUsed,
                    working: false,
                    container: container,
                    homePos: homePos
                });
            };

            StructureSpawn.prototype.createExtCreep =
                function (flag) {
                    return this.createCreep([CARRY, MOVE], undefined, {
                        role: 'extcreep',
                        energyUsed: 100,
                        working: false,
                        flag: flag
                    });
                }

};
