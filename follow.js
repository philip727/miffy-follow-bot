const MIFFY_PENGUIN_ID = 17267;
const DISTANCE_EPSILON = 50;
const UPDATE_INTERVAL = 100;
const SIT_FRAME = 24;
const DANCE_FRAME = 26;
let updateId = null;

const sitting_frames = {
    down: 17,
    leftDown: 18,
    left: 19,
    leftUp: 20,
    top: 21,
    rightUp: 22,
    right: 23,
    rightDown: 24,
}

const isSitting = (penguin) => {
    if (Object.values(sitting_frames).indexOf(penguin.frame) > -1) {
        return true;
    }

    return false;
}

const hasCorrectingSittingDirection = (p1, p2) => {
    if (getSittingDirection(p2) == null) {
        return false;
    }

    if (p1.frame == getSittingDirection(p2).dir) {
        return true;
    }

    return false;
}

const getSittingDirection = (targetPenguin) => {
    switch (targetPenguin.frame) {
        case sitting_frames.down:
            return { dir: sitting_frames.down, pos: { x: -50, y: 0 } };
        case sitting_frames.leftDown:
            return { dir: sitting_frames.rightDown, pos: { x: -50, y: 0 } };
        case sitting_frames.left:
            return { dir: sitting_frames.right, pos: { x: -50, y: 0 } };
        case sitting_frames.leftUp:
            return { dir: sitting_frames.rightDown, pos: { x: 15, y: 15 } };
        case sitting_frames.top:
            return { dir: sitting_frames.down, pos: { x: 0, y: 15 } };
        case sitting_frames.rightUp:
            return { dir: sitting_frames.leftDown, pos: { x: -15, y: 15 } };
        case sitting_frames.right:
            return { dir: sitting_frames.left, pos: { x: 50, y: 0 } };
        case sitting_frames.rightDown:
            return { dir: sitting_frames.leftDown, pos: { x: 50, y: 0 } };
        default:
            return null;
    }
}

const magnitude = (x1, y1, x2, y2) => {
    const diff = Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2);
    return Math.sqrt(diff);
}

let update = (targetId) => {
    updateId =setTimeout(() => {
        update(targetId);
    }, UPDATE_INTERVAL);

    let client = temp1.world.client;
    let room = temp1.world.room;

    if (!room.penguins || room.penguins == undefined) {
        return;
    }

    let targetPenguin = room.penguins[targetId];
    if (!targetPenguin == null || targetPenguin == undefined) {
        return;
    }

    const distance = Math.abs(magnitude(client.penguin.x, client.penguin.y, targetPenguin.x, targetPenguin.y));

    let isTargetDancing = targetPenguin.frame >= DANCE_FRAME;
    let isClientDancing = client.penguin.frame >= DANCE_FRAME;

    // In distance of target
    if (distance <= DISTANCE_EPSILON) {

        // Prioritise dancing
        if (isTargetDancing && !isClientDancing) {
            client.sendFrame(DANCE_FRAME);
            // Moves us back next to target penguin
            client.sendMove(targetPenguin.x - DISTANCE_EPSILON, targetPenguin.y);
            return;
        }

        if (isSitting(targetPenguin) && !isSitting(client.penguin) || (!hasCorrectingSittingDirection(client.penguin, targetPenguin) && isSitting(client.penguin) && isSitting(targetPenguin))) {
            let direction = getSittingDirection(targetPenguin);

            client.sendFrame(direction.dir);
            // Moves us in right orientation corresponding to penguin
            client.sendMove(targetPenguin.x + direction.pos.x, targetPenguin.y + direction.pos.y);
            return;
        }

        return;
    }

    // Moves us towards target if not near by
    if (distance > DISTANCE_EPSILON) {
        client.sendMove(targetPenguin.x - DISTANCE_EPSILON, targetPenguin.y);
    }
}

let exit = () => {
    if (updateId == null) return;
    clearTimeout(updateId);
    update = null;
}

update(MIFFY_PENGUIN_ID);
