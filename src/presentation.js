// All the audio/visual code

function createDrawBoardBackground(display, graphics) {
    return function() {
        let resourceArgument = {width: graphics.width, height: graphics.height}
        display.fill(graphics.resource, resourceArgument);
    };
}

function createDrawImageBackground(display, graphics) {
    return function() {
        let resourceArgument = {width: graphics.width, height: graphics.height}
        display.fitImage(graphics.resource, resourceArgument);
    };
}

function createDirtyLoadDrawImageBackground(display, graphics) {
    return function() {
        let resourceArgument = {width: graphics.width, height: graphics.height}
        display.fitImage(graphics.getResource(), resourceArgument);
    };
}

function createDrawSnake(display, stateGetter, graphics) {
    return function() {
        let snakeData = stateGetter().snake;
        for (let i = 0; i <= snakeData.length - 1; i++) {
            let x = snakeData[i][0];
            let y = snakeData[i][1];
            if (i === snakeData.length - 1) {
               display.drawTile(x,y, graphics.head);
            }
            else {
                display.drawTile(x,y, graphics.body);
            }
        }
    };
}

function createDrawFood(display, stateGetter, graphics) {
    return function() {
        let x = stateGetter().food[0];
        let y = stateGetter().food[1];
        display.drawTile(x, y, graphics);
    };
}

function createDrawUiBackground(display, settings) {
    return function() {
        display.fill();
    }
}

function createDrawMeter(display, graphics, stateGetter, settings) {
    return function() {
        let currentValue = stateGetter();
        currentValue = currentValue * settings.bar.width;
        if (currentValue > settings.bar.width) {
            currentValue = settings.bar.width;
        }
        display.drawMeterBackground(graphics.insetColor, settings.bar);
        display.drawIcon(graphics.icon, settings.icon);
        display.drawBar(graphics.barColor, settings.bar, currentValue);
    }
}

function createHealthBarColorStep(healthGraphics, getValue, settings) {
    let colorInterpolator = d3.interpolateRgb(settings.lowColor, settings.highColor);
    return function() {
        let value = getValue();
        let lowerBound = settings.low();
        let upperBound = settings.high();
        let result = value;
        if (result < 0 || result < lowerBound) {
            result = 0;
        }
        else {
            if (result >= upperBound) {
                result = 1;
            }
            else {
                result = (value - lowerBound) / (upperBound - lowerBound)
            }
        }
        healthGraphics.barColor = colorInterpolator(result);
    }
}

function createFoodEmphasisWrapper(display, canvas, getEffect) {
    return {drawTile: function(x, y, graphics){
        canvas.save();
        let effect = getEffect()
        canvas.shadowBlur = effect.blur;
        canvas.shadowColor = effect.color;
        display.drawTile(x, y, graphics);
        canvas.restore();
    }
    };

}

function createFoodVisualEffect(timeFunction, settings) {
    var elapsedTime = 0;
    return function() {
        elapsedTime = elapsedTime + timeFunction();
        let xValue = elapsedTime / (Math.PI * 51);
        let factor = Math.sin(xValue);
        factor = (factor + 1) / 2;
        let colorInterpolator = d3.interpolateRgb(settings.firstColor, settings.secondColor)
        let resultColor = colorInterpolator(factor * 0.75);
        let resultBlur = settings.baseShadowSize * ((factor + 1) * 3);
        return {blur: resultBlur,color: resultColor};
    }
}

function createBottomFitLayout(fitFunction) {
    return function(container, item) {
        let result = fitFunction(container, item);
        let fitForBottomY = container.height - result.height;
        return {offsetX: result.offsetX, offsetY: fitForBottomY, 
            width: result.width, height: result.height};
    }
}

function audioPlayer(audioDatabase, resourceName) {
    return function() {
        audioDatabase.get(resourceName).play();
    }
}

function audioPlayerForceStart(audioDatabase, resourceName) {
    return function() {
        audioDatabase.get(resourceName).currentTime = 0;
        audioDatabase.get(resourceName).play();
    }
}

function audioPause(audioDatabase, resourceName) {
    return function() {
        audioDatabase.get(resourceName).pause();
    }
}

function audioDuration(audioDatabase, resourceName) {
    return function() {
        return audioDatabase.get(resourceName).duration;
    }
}

function audioSetPlaybackRate(audioDatabase, resourceName) {
    return function(rate) {
        audioDatabase.get(resourceName).playbackRate  = rate;
    }
}

function audioEnded(audioDatabase, resourceName) {
    return function() {
        if (audioDatabase.get(resourceName).currentTime > 0) {
            return audioDatabase.get(resourceName).ended;
        }
        return false;
    }
}

function audioCurrentTime(audioDatabase, resourceName) {
    return function() {
        return audioDatabase.get(resourceName).currentTime;
    }
}
