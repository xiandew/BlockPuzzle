export default class Audio {
    constructor() {
        this.bgm = wx.createInnerAudioContext();
        this.bgm.loop = true;
        this.bgm.autoplay = true;
        this.bgm.src = "assets/media/background.m4a";

        this.navTap = wx.createInnerAudioContext();
        this.navTap.src = "assets/media/navtap.m4a";
        this.navTapOn = true;

        this.placeChess = wx.createInnerAudioContext();
        this.placeChess.src = "assets/media/placechess.m4a";

        this.match = wx.createInnerAudioContext();
        this.match.src = "assets/media/match.m4a";
    }

    addNavTap(button) {
        button.on("pointerout", function() {
            if (this.navTapOn) {
                this.navTap.play();
            }
        });
    }

    static getInstance() {
        if (!Audio.instance) {
            Audio.instance = new Audio();
        }
        return Audio.instance;
    }
}