import AssetsLoader from "./data/AssetsLoader";
import DataStore from "./data/DataStore";
import BitmapText from "./utils/BitmapText";
import BitmapFont from "./utils/BitmapFont";
import basicSquare7Solid from "./assets/fonts/bitmap/basic-square-7-solid";
import Sprite from "./base/Sprite";
import Grid from "./utils/Grid";
import Text from "./utils/Text";
import Week from "./utils/Week";

class Main {
    static Tab = class {
        static THISWEEK = 1;
        static BESTRECORD = 2;
    };
    constructor() {
        this.messageQueue = [];
        wx.onMessage(this.onMessage.bind(this));

        AssetsLoader.getInstance().onLoaded((assets) => {
            this.assets = assets;
            this.bitmapText = new BitmapText(new BitmapFont(this.assets.get("basicSquare7Solid"), basicSquare7Solid));

            this.canvas = wx.getSharedCanvas();
            this.ctx = this.canvas.getContext("2d");

            DataStore.canvasWidth = this.canvas.width;
            DataStore.canvasHeight = this.canvas.height;

            // Canvas for the leaderboard
            this.leaderboardCanvas = wx.createCanvas();
            this.leaderboardContext = this.leaderboardCanvas.getContext("2d");
            this.leaderboardCanvas.width = 0.85 * DataStore.canvasWidth;
            this.leaderboardCanvas.height = 0.72 * DataStore.canvasHeight;
            this.leaderboardSprite = new Sprite(
                this.leaderboardCanvas,
                0.5 * DataStore.canvasWidth,
                DataStore.canvasHeight - 0.5 * this.leaderboardCanvas.height,
                this.leaderboardCanvas.width,
                this.leaderboardCanvas.height
            );

            // Canvas for my rank
            this.myRankCanvas = wx.createCanvas();
            this.myRankContext = this.myRankCanvas.getContext("2d");
            this.myRankCanvas.width = this.leaderboardCanvas.width;
            this.myRankCanvas.height = 0.12 * this.leaderboardCanvas.height;
            this.myRankSprite = new Sprite(
                this.myRankCanvas,
                this.leaderboardSprite.x,
                0.194 * DataStore.canvasHeight + 0.5 * this.myRankCanvas.height,
                this.myRankCanvas.width,
                this.myRankCanvas.height
            );

            this.messageQueue.forEach((msg) => {
                this.onMessage(msg);
            });
        });

        this.sy = 0;
        wx.onTouchStart(e => {
            this.startY = this.sy + e.touches[0].clientY;
        });
        wx.onTouchMove(e => {
            this.sy = this.startY - e.touches[0].clientY;
            this.render(this.sy);
        });
        wx.onTouchEnd(e => {
            this.sy = ((arr) => { arr.sort((a, b) => { return a - b; }); return arr })([0, this.sy, this.leaderboardCanvas.height - this.leaderboardSprite.height])[1];
            this.render(this.sy);
        });
    }

    onMessage(msg) {
        if (!this.assets) {
            return this.messageQueue.push(msg);
        }

        const action = msg.action;
        if (action === "RankScene") {
            if (msg.tab) {
                if (msg.tab === this.activeTab) {
                    return;
                } else {
                    this.activeTab = msg.tab === "thisWeek" ? Main.Tab.THISWEEK : Main.Tab.BESTRECORD;
                }
            }
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.myRankContext.clearRect(0, 0, this.myRankCanvas.width, this.myRankCanvas.height);
            this.leaderboardContext.clearRect(0, 0, this.leaderboardCanvas.width, this.leaderboardCanvas.height);
            this.drawLoading();

            if (!msg.score) {
                return this.loadRecords();
            }

            wx.getUserCloudStorage({
                keyList: ["record"],
                success: res => {
                    let record = res.KVDataList.find(KVData => KVData.key === "record");
                    if (record) record = JSON.parse(record.value);
                    let now = new Date();
                    if (!record || !record.wkRecord) {
                        record = { wxgame: {}, wkRecord: {} };
                    }

                    // Update week record
                    if (
                        !record.wkRecord.update_time || record.wkRecord.update_time < Week.getThisMonday().getTime() ||
                        !record.wkRecord.score || msg.score > record.wkRecord.score
                    ) {
                        record.wkRecord.score = msg.score;
                        record.wkRecord.update_time = now.getTime();
                    }

                    // Update max record
                    if (!record.wxgame.score || record.wxgame.score < record.wkRecord.score) {
                        record.wxgame.score = record.wkRecord.score;
                        record.wxgame.update_time = now.getTime();
                    }

                    wx.setUserCloudStorage({
                        KVDataList: [{ key: "record", value: JSON.stringify(record) }],
                        success: () => {
                            this.loadRecords(true);
                        }
                    });
                }
            });
        }
    }

    loadRecords(reload = false) {
        if (reload || !DataStore.friendCloudStorage) {
            return wx.getFriendCloudStorage({
                keyList: ["record"],
                success: (res) => {
                    DataStore.friendCloudStorage = res.data.map((e) => {
                        let record = e.KVDataList.find(kv => kv.key === "record");
                        if (record) {
                            e._record = JSON.parse(record.value);
                        } else {
                            return null;
                        }
                        return e;
                    }).filter(e => e);
                    this.drawRecords();
                }
            });
        }
        this.drawRecords()
    }

    drawRecords() {
        if (!DataStore.userInfo) {
            return wx.getUserInfo({
                openIdList: ["selfOpenId"],
                success: (res) => {
                    [DataStore.userInfo] = res.data;
                    this.drawRecords();
                }
            });
        }

        clearInterval(this.loadingIntervalId);

        let friends = DataStore.friendCloudStorage;
        if (this.activeTab == Main.Tab.BESTRECORD) {
            friends.forEach((f) => f.record = f._record.wxgame);
        } else {
            friends.forEach((f) => f.record = f._record.wkRecord);

            let thisMonday = Week.getThisMonday().getTime();
            friends = friends.filter((f) => f.record && f.record.update_time >= thisMonday);
        }

        friends.sort((f1, f2) => {
            return f2.record.score - f1.record.score
                || f1.record.update_time - f2.record.update_time;
        });

        friends.forEach((f, i) => f.rank = i + 1);
        let myself = friends.find((f) => f.nickname == DataStore.userInfo.nickName && f.avatarUrl == DataStore.userInfo.avatarUrl);
        if (!myself) {
            myself = {
                rank: friends.length,
                avatarUrl: DataStore.userInfo.avatarUrl,
                nickname: DataStore.userInfo.nickName,
                record: { score: 0 }
            };
        }

        if (!friends.length) return this.drawNoRecords();

        let grid = new Grid(0, this.myRankCanvas.height, 0, 0.06 * DataStore.canvasWidth, 0, 0.06 * DataStore.canvasWidth, this.myRankCanvas.width);
        grid.fontSize = 0.25 * grid.height;
        grid.avatarSize = 0.6 * grid.height;
        grid.mid = grid.top + 0.5 * grid.height;
        this.drawRecord(this.myRankContext, grid, myself, true);

        this.leaderboardContext.clearRect(0, 0, this.leaderboardCanvas.width, this.leaderboardCanvas.height);
        this.leaderboardCanvas.height = Math.max(this.leaderboardCanvas.height, grid.height * friends.length);
        friends.forEach((friend, i) => {
            grid.top = i * grid.height * 1.1 + grid.height * 0.2;
            grid.mid = grid.top + 0.5 * grid.height;

            this.leaderboardContext.fillStyle = "rgba(255, 255, 255, 0)";
            this.drawRecord(this.leaderboardContext, grid, friend);
        });

        // Refresh the shared canvas
        this.render();
    }

    drawRecord(ctx, grid, friend, isMyself = false) {
        // Draw the rank
        ctx.fillStyle = "#000000"
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        if (friend.rank) {
            new Text(friend.rank).draw(ctx, grid.ml + grid.pl, grid.mid, `${grid.fontSize}px Arial`);
        }

        // Draw the avatar
        let avatar = wx.createImage();
        avatar.y = grid.mid;
        avatar.x = grid.ml + 1.65 * grid.pl + 0.5 * grid.avatarSize;

        // Draw the first place icon bg
        if (!isMyself && friend.rank == 1) {
            new Sprite(this.assets.get("firstPlaceBg"), avatar.x + 0.35 * grid.avatarSize, avatar.y - 0.5 * grid.avatarSize, 0.4 * grid.avatarSize).render(ctx);
        }

        let drawAvatarBg = (clip) => {
            ctx.beginPath();
            ctx.arc(avatar.x, avatar.y, grid.avatarSize * 0.5, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fillStyle = "#eeeeee";
            ctx.fill();
            if (clip) ctx.clip();
        }


        drawAvatarBg();
        avatar.onload = () => {
            ctx.save();
            drawAvatarBg(true);
            new Sprite(avatar, avatar.x, avatar.y, grid.avatarSize, grid.avatarSize).render(ctx);
            ctx.restore();
            // Refresh the shared canvas
            this.render();
        }
        avatar.src = friend.avatarUrl;
        // Make sure onload() is triggered if the avatar is already cached
        if (avatar.complete) {
            avatar.onload();
        }

        // Draw the rank background
        if (!isMyself && friend.rank <= 3) {
            ctx.globalCompositeOperation = "destination-over";
            ctx.strokeStyle = "#efca7f";
            ctx.beginPath();
            ctx.lineCap = "round";
            ctx.lineWidth = grid.fontSize * 1.5;
            ctx.moveTo(grid.ml + grid.pl - grid.fontSize * 0.5, grid.mid);
            ctx.lineTo(avatar.x, avatar.y);
            ctx.stroke();
            ctx.globalCompositeOperation = "source-over";
        }

        // Draw the score, use the start x of the score to truncate long nicknames
        let scoreEndX = grid.width + grid.ml - grid.pr;
        let scoreStartX = this.bitmapText.draw(ctx, friend.record.score, 0.3 * grid.height, scoreEndX, grid.mid - 0.15 * grid.height, "right");
        let nicknameEndX = scoreStartX - grid.pl;
        let nicknameStartX = avatar.x + grid.avatarSize;

        ctx.globalCompositeOperation = "source-atop";
        ctx.fillStyle = isMyself ? "#ffffff" : friend.rank <= 3 ? "#fa7e00" : "#50a3ec";
        ctx.fillRect(scoreStartX, grid.top + 0.35 * grid.height, scoreEndX - scoreStartX, 0.3 * grid.height);
        ctx.globalCompositeOperation = "source-over";

        // Draw the nickname
        ctx.fillStyle = "#000000";
        ctx.textAlign = "left";
        new Text(friend.nickname, grid.fontSize).drawOverflowEllipsis(ctx, nicknameStartX, grid.mid, nicknameEndX - nicknameStartX);
    }

    drawLoading() {
        this.leaderboardContext.fillStyle = "#888888";
        this.leaderboardContext.textAlign = "center";

        let draw = (text) => {
            this.leaderboardContext.clearRect(0, 0, this.leaderboardCanvas.width, this.leaderboardCanvas.height);
            new Text(
                text,
                this.leaderboardCanvas.height * 0.03,
                this.leaderboardCanvas.height
            ).draw(this.leaderboardContext, 0.5 * this.leaderboardCanvas.width, 0.5 * this.leaderboardCanvas.height);
            this.render();
        };
        draw("加载中");

        // Animate the dots
        let nDots = 0;
        this.loadingIntervalId = setInterval(() => {
            nDots = (nDots + 1) % 4;
            draw("加载中" + [...new Array(nDots).keys()].map(() => ".").join(""));
        }, 400);
    }

    drawNoRecords() {
        this.leaderboardContext.clearRect(0, 0, this.leaderboardCanvas.width, this.leaderboardCanvas.height);
        this.leaderboardContext.fillStyle = "#888888";
        this.leaderboardContext.textAlign = "center";
        new Text(
            "这周还没有好友玩过，快分享出去吧",
            this.leaderboardCanvas.height * 0.03,
            this.leaderboardCanvas.height
        ).draw(this.leaderboardContext, 0.5 * this.leaderboardCanvas.width, 0.5 * this.leaderboardCanvas.height);
        this.render();
    }

    render(sy = 0) {
        // if (DataStore.currentScene !== RankScene.toString()) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.myRankSprite.render(this.ctx);
        this.leaderboardSprite.renderCrop(this.ctx, 0, sy, this.leaderboardCanvas.width, this.leaderboardSprite.height);
    }

}

wx.onMessage((msg) => {
    if (msg.action === "Main") {
        new Main();
    }
});