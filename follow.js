const MIFFY_PENGUIN_ID = 17267;
const DISTANCE_EPSILON = 50;
const UPDATE_INTERVAL = 100;
const SIT_FRAME = 24;
const DANCE_FRAME = 26;

const magnitude = (x1, y1, x2, y2) => {
    const diff = Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2);
    return Math.sqrt(diff);
}

const update = () => {
    setTimeout(() => {
        update();
    }, UPDATE_INTERVAL);

    let client = temp1.world.client;
    let room = temp1.world.room;

    if (!room.penguins || room.penguins == undefined) {
        return;
    }

    let miffy = room.penguins[MIFFY_PENGUIN_ID];
    if (!miffy == null || miffy == undefined) {
        return;
    }

    const distance = Math.abs(magnitude(client.penguin.x, client.penguin.y, miffy.x, miffy.y));

    let isMiffyDancing = miffy.frame >= DANCE_FRAME;
    let isMiffySitting = miffy.frame >= 17 && miffy.frame <= 25;
    let isClientDancing = client.penguin.frame >= DANCE_FRAME;
    let isClientSitting = client.penguin.frame == SIT_FRAME;

    // In distance of miffy
    if (distance <= DISTANCE_EPSILON) {

        // Prioritise miffy dancing
        if (isMiffyDancing && !isClientDancing) {
            client.sendFrame(DANCE_FRAME);
            return;
        }

        // So we arent sending set sit over and over
        if (!isClientSitting && !isMiffyDancing) {
            client.sendFrame(SIT_FRAME);
            return;
        }

        return;
    }

    // Moves us towards miffy if shes not near by
    if (distance > DISTANCE_EPSILON) {
        client.sendMove(miffy.x - DISTANCE_EPSILON, miffy.y);
    }
}

update();
