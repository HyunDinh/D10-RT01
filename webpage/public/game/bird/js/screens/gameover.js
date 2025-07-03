game.GameOverScreen = me.ScreenObject.extend({
    init: function () {
        this.savedData = null;
        this.handler = null;
    },

    onResetEvent: function () {
        // Save current score
        this.savedData = {
            score: game.data.score,
            steps: game.data.steps
        };
        me.save.add(this.savedData);
        // Update high score
        if (!me.save.topSteps) {
            me.save.add({ topSteps: game.data.steps });
        }
        if (game.data.steps > me.save.topSteps) {
            me.save.topSteps = game.data.steps;
            game.data.newHiScore = true;
        }


        // ✅ Gửi score về React
        console.log("🎮 Sending score to parent...");
        window.parent.postMessage({
            type: 'CLUMSY_BIRD_SCORE',
            steps: game.data.steps,
            highScore: me.save.topSteps
        }, '*');

        // ✅ Trả lời nếu React gọi GET_SCORE
        window.addEventListener('message', function (event) {
            if (event.data?.type === 'GET_SCORE') {
                console.log("📨 Replying to GET_SCORE from parent...");
                window.parent.postMessage({
                    type: 'CLUMSY_BIRD_SCORE',
                    steps: game.data.steps,
                    highScore: me.save.topSteps
                }, '*');
            }
        });

        // Giao diện game over
        me.input.bindKey(me.input.KEY.ENTER, "enter", true);
        me.input.bindKey(me.input.KEY.SPACE, "enter", false);
        me.input.bindPointer(me.input.pointer.LEFT, me.input.KEY.ENTER);

        this.handler = me.event.subscribe(me.event.KEYDOWN, function (action) {
            if (action === "enter") {
                me.state.change(me.state.MENU);
            }
        });

        me.game.world.addChild(new me.Sprite(
            me.game.viewport.width / 2,
            me.game.viewport.height / 2 - 100,
            { image: 'gameover' }
        ), 12);

        const gameOverBG = new me.Sprite(
            me.game.viewport.width / 2,
            me.game.viewport.height / 2,
            { image: 'gameoverbg' }
        );
        me.game.world.addChild(gameOverBG, 10);
        me.game.world.addChild(new BackgroundLayer('bg', 1));

        // Ground
        this.ground1 = me.pool.pull('ground', 0, me.game.viewport.height - 96);
        this.ground2 = me.pool.pull('ground', me.game.viewport.width, me.video.renderer.getHeight() - 96);
        me.game.world.addChild(this.ground1, 11);
        me.game.world.addChild(this.ground2, 11);

        // New high score badge
        if (game.data.newHiScore) {
            const newRect = new me.Sprite(
                gameOverBG.width / 2,
                gameOverBG.height / 2,
                { image: 'new' }
            );
            me.game.world.addChild(newRect, 12);
        }

        // ❌ Không hiện điểm ở màn game over (đã tắt đoạn this.dialog)
    },

    onDestroyEvent: function () {
        me.event.unsubscribe(this.handler);
        me.input.unbindKey(me.input.KEY.ENTER);
        me.input.unbindKey(me.input.KEY.SPACE);
        me.input.unbindPointer(me.input.pointer.LEFT);
        this.ground1 = null;
        this.ground2 = null;
        this.font = null;
        me.audio.stop("theme");
    }
});
