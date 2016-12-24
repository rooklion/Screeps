module.exports = function () {
    StructureSpawn.prototype.createCustomCreep =
        function (energy, roleName) {
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
                working: false
            });
        };

    StructureSpawn.prototype.createRepairer =
        function () {
            return this.createCreep([WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], undefined, {
                role: 'repairer',
                energyUsed: 500,
                working: false
            });
        };

    StructureSpawn.prototype.createBuilder =
        function () {
            return this.createCreep([WORK, CARRY, CARRY, CARRY, MOVE, MOVE], undefined, {
                role: 'builder',
                energyUsed: 350,
                working: false
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
                working: false
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
                target: target
            })
        }

    StructureSpawn.prototype.createReserver =
        function (target) {
            return this.createCreep([CLAIM, CLAIM, MOVE], undefined, {
                role: 'reserver',
                target: target
            })
        }

    StructureSpawn.prototype.createMiner =
        function (sourceId) {
            return this.createCreep([WORK, WORK, WORK, WORK, WORK, MOVE], undefined, {
                role: 'miner',
                energyUsed: 550,
                sourceId: sourceId
            })
        }

    StructureSpawn.prototype.createCarry =
        function (energy, roleName) {
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
                working: false
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


};
