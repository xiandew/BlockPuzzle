export default class Audio {
    constructor() {
        this.bgm = wx.createInnerAudioContext();
        this.bgm.loop = true;
        this.bgm.src = "assets/media/background.m4a";

        this.navTap = wx.createInnerAudioContext();
        this.navTap.src = "assets/media/navtap.m4a";
        this.navTapOn = true;

        this.placeChess = wx.createInnerAudioContext();
        this.placeChess.src = "assets/media/placechess.m4a";

        this.match = wx.createInnerAudioContext();
        this.match.src = "assets/media/match.m4a";

        this.bgmOn = true;
        this.musicOn = true;
        try {
            let setting = wx.getStorageSync("setting")
            if (setting) {
                setting = JSON.parse(setting);
                this.bgmOn = setting.bgmOn;
                this.musicOn = setting.musicOn;

                if (this.bgmOn) {
                    this.playBGM();
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    addNavTap(button) {
        button.on("pointerup", () => {
            if (this.musicOn) {
                this.navTap.play();
            }
        });
    }

    playBGM() {
        this.bgm.play();
        this.bgmOn = true;
    }

    stopBGM() {
        this.bgm.stop();
        this.bgmOn = false;
    }

    playMatch() {
        if (this.musicOn) this.match.play();
    }

    playPlaceChess() {
        if (this.musicOn) this.placeChess.play();
    }

    static getInstance() {
        if (!Audio.instance) {
            Audio.instance = new Audio();
        }
        return Audio.instance;
    }
}