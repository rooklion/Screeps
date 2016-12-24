exports.fetchXYArguments = function (firstArg, secondArg) {
    var x, y, roomName;
    if (_.isUndefined(secondArg) || !_.isNumber(secondArg)) {
        if (!_.isObject(firstArg)) {
            return [undefined, undefined, undefined];
        }

        if (firstArg instanceof RoomPosition) {
            x = firstArg.x;
            y = firstArg.y;
            roomName = firstArg.roomName;
        }
        if (firstArg.pos && (firstArg.pos instanceof RoomPosition)) {
            x = firstArg.pos.x;
            y = firstArg.pos.y;
            roomName = firstArg.pos.roomName;
        }
    }
    else {
        x = firstArg;
        y = secondArg;
    }
    if (_.isNaN(x)) {
        x = undefined;
    }
    if (_.isNaN(y)) {
        y = undefined;
    }
    return [x, y, roomName];
};