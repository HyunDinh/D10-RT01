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

        // ✅ Send score to parent iframe immediately
        console.log("🎮 Sending score to parent...");
        window.parent.postMessage({
            type: 'CLUMSY_BIRD_SCORE',
            steps: game.data.steps,
            highScore: me.save.topSteps
        }, '*');

        // ✅ Reply to GET_SCORE requests from React
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

        // Bind input
        me.input.bindKey(me.input.KEY.ENTER, "enter", true);
        me.input.bindKey(me.input.KEY.SPACE, "enter", false);
        me.input.bindPointer(me.input.pointer.LEFT, me.input.KEY.ENTER);

        this.handler = me.event.subscribe(me.event.KEYDOWN, function (action) {
            if (action === "enter") {
                me.state.change(me.state.MENU);
            }
        });

        // Game over visuals
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

        // Score display
        this.dialog = new (me.Renderable.extend({
            init: function () {
                this._super(me.Renderable, 'init', [
                    0, 0, me.game.viewport.width / 2, me.game.viewport.height / 2
                ]);
                this.font = new me.Font('gamefont', 40, 'black', 'left');
                this.steps = 'Steps: ' + game.data.steps.toString();
                this.topSteps = 'Higher Step: ' + me.save.topSteps.toString();
            },

            draw: function (renderer) {
                const stepsText = this.font.measureText(renderer, this.steps);
                const topStepsText = this.font.measureText(renderer, this.topSteps);

                this.font.draw(
                    renderer,
                    this.steps,
                    me.game.viewport.width / 2 - stepsText.width / 2 - 60,
                    me.game.viewport.height / 2
                );

                this.font.draw(
                    renderer,
                    this.topSteps,
                    me.game.viewport.width / 2 - topStepsText.width / 2 - 60,
                    me.game.viewport.height / 2 + 50
                );
            }
        }));
        me.game.world.addChild(this.dialog, 12);
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
