export default class MAB {
    constructor(n_arms, Q0 = 0) {
        this.history = [...Array(n_arms).keys()].map(e => 0);
        this.Q = [...Array(n_arms).keys()].map(e => Q0);
        this.t = 1;
    }

    static randomChoice(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    play() {
        let p = Math.random();
        for (let i = 0, a = 0; i < this.Q.length; i++) {
            if (a > p) {
                return i;
            }
            a += this.Q[i];
        }
        return MAB.randomChoice(this.Q.map((e, i) => i));
    }

    update(arm) {
        this.history[arm]++;
        this.t += 1;
        this.Q[arm] = 1 - this.history[arm].length / this.t;
    }
}