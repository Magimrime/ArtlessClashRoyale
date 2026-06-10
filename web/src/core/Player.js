export default class Player {
    constructor(t) {
        this.tm = t; // team (0=player, 1=enemy)
        this.elx = 7; // both sides start at 7 elixir
        this.h = []; // hand
        this.pile = []; // draw pile
        this.lastPlayedCard = null;
    }
}
