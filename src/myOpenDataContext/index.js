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
    constructor() {
        wx.onMessage((msg) => {
            const action = msg.action;

            if (action === "RankScene") {
                // TODO drawLoading()

                if (!msg.score) {
                    return; // TODO loadRecords();
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
        });

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
        });

        this.loadRecords();
    }

    loadRecords(reload = false) {
        if (reload || !DataStore.friendCloudStorage) {
            return wx.getFriendCloudStorage({
                keyList: ["record"],
                success: (res) => {
                    DataStore.friendCloudStorage = res.data.map((e) => {
                        let record = e.KVDataList.find(kv => kv.key === "record");
                        if (record) {
                            e.record = JSON.parse(record.value);
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
                openIdList: ['selfOpenId'],
                success: (res) => {
                    [DataStore.userInfo] = res.data;
                    this.drawRecords();
                }
            });
        }

        let thisMonday = Week.getThisMonday().getTime();
        // TODO rm `true || `
        let friends = DataStore.friendCloudStorage.filter(f => true || f.record.wkRecord && f.record.wkRecord.update_time >= thisMonday);
        friends.sort((f1, f2) => f2.record.wkRecord.score - f1.record.wkRecord.score);

        friends.forEach((f, i) => f.rank = i + 1);
        // friends.unshift(friends.find((f) => f.nickname == DataStore.userInfo.nickName && f.avatarUrl == DataStore.userInfo.avatarUrl));

        this.leaderboardContext.clearRect(0, 0, this.leaderboardCanvas.width, this.leaderboardCanvas.height);
        if (!friends.length) return this.drawNoRecords();

        let grid = new Grid(0, 0.12 * this.leaderboardCanvas.height, 0, 0.06 * DataStore.canvasWidth, 0, 0.06 * DataStore.canvasWidth, this.leaderboardCanvas.width);
        this.leaderboardCanvas.height = Math.max(this.leaderboardCanvas.height, grid.height * friends.length);

        friends.forEach((friend, i) => {
            grid.top = i * grid.height;
            grid.mid = grid.top + 0.5 * grid.height;
            grid.fontSize = 0.25 * grid.height;
            grid.avatarSize = 0.6 * grid.height;

            this.leaderboardContext.fillStyle = "rgba(255, 255, 255, 0)";
            grid.draw(this.leaderboardContext, 0, true, false);
            this.drawRecord(this.leaderboardContext, grid, friend);
        });

        // Refresh the shared canvas
        this.render();
    }

    drawRecord(ctx, grid, friend) {
        // Draw the rank
        ctx.fillStyle = "#000000"
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        new Text(friend.rank).draw(ctx, grid.pl, grid.mid, `${grid.fontSize}px Arial`);

        // Draw the avatar
        let avatar = wx.createImage();
        avatar.y = grid.mid;
        avatar.x = 1.65 * grid.pl + 0.5 * grid.avatarSize;

        // Draw the first place icon bg
        if (friend.rank == 1) {
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
            drawAvatarBg(true);
            new Sprite(avatar, avatar.x, avatar.y, grid.avatarSize, grid.avatarSize).render(ctx);
            // Refresh the shared canvas
            this.render();
        }
        avatar.src = friend.avatarUrl;

        // Draw the rank background
        ctx.globalCompositeOperation = 'destination-over';
        ctx.strokeStyle = "#efca7f";
        ctx.beginPath();
        ctx.lineCap = "round";
        ctx.lineWidth = grid.fontSize * 1.5;
        ctx.moveTo(grid.pl - grid.fontSize * 0.5, grid.mid);
        ctx.lineTo(avatar.x, avatar.y);
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';

        // Draw the score, use the start x of the score to truncate long nicknames
        let scoreStartX = this.bitmapText.draw(ctx, friend.record.wkRecord.score, 0.3 * grid.height, grid.width - grid.pr, grid.mid - 0.15 * grid.height, "right");
        let nicknameEndX = scoreStartX - grid.pl;
        let nicknameStartX = avatar.x + grid.avatarSize;

        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = friend.rank == 1 ? '#fa7e00' : friend.rank == 2 ? '#fec11e' : friend.rank == 3 ? '#fbd413' : '#888888';
        ctx.fillRect(scoreStartX, 0.35 * grid.height, grid.width - grid.pr - scoreStartX, 0.3 * grid.height);
        ctx.globalCompositeOperation = 'source-over';

        // Draw the nickname
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'left';
        new Text(friend.nickname, grid.fontSize).drawOverflowEllipsis(ctx, nicknameStartX, grid.mid, nicknameEndX - nicknameStartX);
    }

    render(sy = 0) {
        // if (DataStore.currentScene !== RankScene.toString()) return;
        // super.render();
        // this.sprite.render(DataStore.ctx);
        this.leaderboardSprite.renderCrop(this.ctx, 0, sy, this.leaderboardCanvas.width, this.leaderboardSprite.height);
    }

}

new Main();