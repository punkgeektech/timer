(() => {
  window.requestAnimationFrame = (function(){
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            function( callback ){
              window.setTimeout(callback, 1000 / 60);
            };
  })();

  // Wrap in object Timer

  var Timer = {

    // pointer configuration
    
    POINTER_LIST: {
      'centerPositionX': 0,
      'centerPositionY': 0,
      'pointer': [],
      'context': [],
      'degree': [],
      'status': [],
    },

    TIME_TO_DEGREE_MAP: {
      '0': [
              [0,90],[0,180],[90,180],
              [270,90],[135,135],[90, 270],
              [270,90],[135,135],[90, 270],
              [270,90],[135,135],[90, 270],
              [270,0],[180,0],[180,270]
           ],
      '1': [
              [135,135],[135,135],[90,90],
              [135,135],[135,135],[270,90],
              [135,135],[135,135],[270,90],
              [135,135],[135,135],[270,90],
              [135,135],[135,135],[270,270]
           ],
      '2': [
              [0,0],[180,0],[180,90],
              [135,135],[135,135],[270,90],
              [0,90],[0,180],[270,180],
              [270,90],[135,135],[135,135],
              [270,0],[180,0],[180,180]
           ],
      '3': [
              [0,0],[180,0],[180,90],
              [135,135],[135,135],[270,90],
              [0,0],[0,180],[270,180],
              [135,135],[135,135],[270,90],
              [0,0],[0,180],[270,180]
           ],
      '4': [
              [90,90],[135,135],[90,90],
              [270,90],[135,135],[270,90],
              [270,0],[180,0],[270,90],
              [135,135],[135,135],[270,90],
              [135,135],[135,135],[270,270]
           ],
      '5': [
              [0,90],[0,180],[180,180],
              [270,90],[135,135],[135,135],
              [270,0],[180,0],[180,90],
              [135,135],[135,135],[270,90],
              [0,0],[0,180],[270,180]
           ],
      '6': [
              [0,90],[0,180],[180,180],
              [270,90],[135,135],[135,135],
              [270,90],[180,0],[180,90],
              [90,270],[135,135],[270,90],
              [0,270],[0,180],[270,180]
           ],
      '7': [
              [0,0],[0,180],[90,180],
              [135,135],[135,135],[90,270],
              [135,135],[135,135],[90,270],
              [135,135],[135,135],[90,270],
              [135,135],[135,135],[270,270]
           ],
      '8': [
              [0,90],[0,180],[90,180],
              [90,270],[135,135],[90,270],
              [90,270],[180,0],[90,270],
              [90,270],[135,135],[90,270],
              [0,270],[0,180],[270,180]
           ],
      '9': [
              [0,90],[0,180],[90,180],
              [90,270],[135,135],[90,270],
              [0,270],[180,0],[90,270],
              [135,135],[135,135],[90,270],
              [135,135],[135,135],[270,270]
           ],
    },

    TIME: {
      'hour': '',
      'min': '',
      'sec': '',
      'freeze': false,
      'finished': false,
      'restart': false,
    },

    CLOCKS: [],

    PANEL_SIZE: 6,
    PANEL_CLOCKS_SIZE: 15,
    CLOCKS_SIZE: 90,
    TIME_RUNNING_DURATION: 1000,
    RESTART_DURATION: 10000,
    MIN_SPEED: 5,
    HOUR_SPEED: 1,
  }

  // Helper, check array is equal

  Timer.arraysEqual = (a, b) => {
      if (a instanceof Array && b instanceof Array) {
          if (a.length != b.length) return false;
          for(var i = 0; i < a.length; i++)
              if (!Timer.arraysEqual(a[i], b[i])) return false;
          return true;
      } else {
          return a == b;
      }
  }

  // Draw Canvas

  Timer.canvasGenerator = () => {
    const canvas = document.getElementById('canvas');
    const panel = document.createElement('p');
    let count = canvas.childElementCount + 1;

    panel.setAttribute('id', 'panel-' + count);
    panel.setAttribute('class', 'panel');

    if (count < Timer.PANEL_SIZE + 1) {
      canvas.append(panel);
      Timer.canvasGenerator(canvas);
    } else {
      Timer.clockGenerator(count - 1);
    }

    count += 1;
  }

  Timer.clockGenerator = (count) => {
    const panel = document.getElementById('panel-' + count);

    Timer.appendClocks(panel, 0);

    if (count > 1) {
      Timer.clockGenerator(count - 1);
    } else {
      Timer.CLOCKS = Timer.pointerCanvasGenerator();
    }
  }

  Timer.appendClocks = (panel, panelClocksCount) => {
    let count = panelClocksCount;
    if (count < Timer.PANEL_CLOCKS_SIZE) {
      const clock = document.createElement('div');
      clock.setAttribute('class', 'clock');
      panel.append(clock);
      Timer.appendClocks(panel, count + 1);
    }
  }

  Timer.pointerCanvasGenerator = () => {
    const clocks = document.getElementsByClassName('clock');
    const pointerCanvasArr = [];

    Object.keys(clocks).forEach(function(node) {
      const pointer = document.createElement('canvas');
      pointer.setAttribute('class', 'pointer-canvas');
      clocks[node].append(pointer);
      pointerCanvasArr.push(pointer);
    });

    return pointerCanvasArr;
  }

  Timer.initCanvas = () => {
    Timer.CLOCKS.map((value) => {
      const degree = []
      const context = value.getContext('2d');
      const centerPositionY = value.height / 2;
      const centerPositionX = value.width / 2;
      const hourDegree = Math.floor(Math.random() * 360);
      const minDegree = Math.floor(Math.random() * 36) * 10;

      degree.push(minDegree);
      degree.push(hourDegree);
      context.translate(centerPositionX, centerPositionY);

      Timer.POINTER_LIST.pointer.push(value);
      Timer.POINTER_LIST.context.push(context);
      Timer.POINTER_LIST.centerPositionX = centerPositionX;
      Timer.POINTER_LIST.centerPositionY = centerPositionY;
      Timer.POINTER_LIST.degree.push(degree);
      Timer.POINTER_LIST.status.push('');
    });
  }

  Timer.drawingCanvas = () => {
    Timer.canvasGenerator();
    Timer.initCanvas();
  }

  // Do animation

  Timer.spin = () => {

    Timer.doDrawPointer(0);

    Timer.setSpinFinished();

    if (Timer.TIME.finished) {
      Timer.restartTimer();
      return;
    }
    window.requestAnimationFrame(Timer.spin);
  }

  Timer.setSpinFinished = () => {
    if(Timer.isArrayEqual(0) && Timer.isArrayEqual(1) &&
       Timer.isArrayEqual(2) && Timer.isArrayEqual(3) &&
       Timer.isArrayEqual(4) && Timer.isArrayEqual(5)) {
         Timer.TIME.finished = true;
    }
    console.log("finished: ", Timer.TIME.finished);
  }

  Timer.isArrayEqual = (index) => {
    const pointerName = Timer.getPointerName(index + 1);
    const pointerCharPosition = Timer.getPointerCharPosition(index + 1);
    return Timer.arraysEqual(Timer.POINTER_LIST.degree.slice(index * Timer.PANEL_CLOCKS_SIZE, (index + 1) * Timer.PANEL_CLOCKS_SIZE), Timer.TIME_TO_DEGREE_MAP[Timer.TIME[pointerName].charAt(pointerCharPosition)]);
  }

  Timer.doDrawPointer = (clocksCount) => {
    let count = clocksCount;
    if (Timer.POINTER_LIST.status[count] != 'stop') {
      Timer.drawPointer(count);
    }
    if (count < Timer.CLOCKS.length - 1) {
      Timer.doDrawPointer(count + 1);
    }
  }

  Timer.drawPointer = (index) => {
    Timer.clearPointer(index);
    Timer.iterateDoDrawPanelPointer(index, 1);
  }

  Timer.iterateDoDrawPanelPointer = (index, panelIndex) => {
    let count = panelIndex;
    Timer.doDrawPanelPointer(index, count);
    if (count < Timer.PANEL_SIZE + 1) {
      Timer.iterateDoDrawPanelPointer(index, count + 1);
    }
  }

  Timer.getPointerName = (index) => {
    return index < 3 ? 'hour' : index < 5 ? 'min' : 'sec';
  }

  Timer.getPointerCharPosition = (index) => {
    return (index % 2 == 0) ? 1 : 0;
  }

  Timer.doDrawPanelPointer = (index, panelIndex) => {
    const pointerName = Timer.getPointerName(panelIndex);
    const pointerCharPosition = Timer.getPointerCharPosition(panelIndex);
    if ((index / Timer.PANEL_CLOCKS_SIZE >= (panelIndex - 1)) && (index / Timer.PANEL_CLOCKS_SIZE < panelIndex)) {
      Timer.drawPanelPointer(parseInt(Timer.TIME[pointerName].charAt(pointerCharPosition)), index, (panelIndex - 1) * Timer.PANEL_CLOCKS_SIZE);
    }
  }

  Timer.drawPanelPointer = (digit, index, distance) => {

    const context = Timer.POINTER_LIST.context[index];
    let hourDegree = Timer.POINTER_LIST.degree[index][1];
    let minDegree = Timer.POINTER_LIST.degree[index][0];

    context.beginPath();
    context.lineWidth = 4;
    context.lineCap = "round";
    context.moveTo(0,0);
    context.lineTo(Timer.POINTER_LIST.centerPositionX * Math.cos(minDegree * Math.PI / 180), Timer.POINTER_LIST.centerPositionY * Math.sin(minDegree * Math.PI / 180));
    context.moveTo(0,0);
    context.lineTo(Timer.POINTER_LIST.centerPositionX * Math.cos(hourDegree * Math.PI / 180) * 0.8, Timer.POINTER_LIST.centerPositionY * Math.sin(hourDegree * Math.PI / 180) * 0.8);
    context.stroke();

    if (Timer.TIME.freeze) {
      Timer.checkPointerStatus(index, minDegree, digit, distance, 0, Timer.MIN_SPEED);
      Timer.checkPointerStatus(index, hourDegree, digit, distance, 1, Timer.HOUR_SPEED);

      if (minDegree == Timer.TIME_TO_DEGREE_MAP[digit][index - distance][0] && hourDegree == Timer.TIME_TO_DEGREE_MAP[digit][index - distance][1]) {
        Timer.POINTER_LIST.status[index] = 'stop';
      }
    } else {
      Timer.movePointer(index, minDegree, 0, Timer.MIN_SPEED);
      Timer.movePointer(index, hourDegree, 1, Timer.HOUR_SPEED);
    }
  }

  Timer.checkPointerStatus = (index, degree, digit, distance, position, speed) => {
    if (degree == Timer.TIME_TO_DEGREE_MAP[digit][index - distance][position]) {
      Timer.POINTER_LIST.degree[index][position] = Timer.TIME_TO_DEGREE_MAP[digit][index - distance][position];
    } else {
      Timer.movePointer(index, degree, position, speed);
    }
  }

  Timer.movePointer = (index, degree, position, speed) => {
    if (degree >= 360) {
      Timer.POINTER_LIST.degree[index][position] = 0
    } else {
      Timer.POINTER_LIST.degree[index][position] += speed;
    }
  }

  Timer.clearPointer = (index) => {
    const context = Timer.POINTER_LIST.context[index];
    const canvas = Timer.POINTER_LIST.pointer[index];
    Timer.doClear(context, canvas, canvas.width, canvas.height);
    Timer.doClear(context, canvas, -canvas.width, canvas.height);
    Timer.doClear(context, canvas, canvas.width, -canvas.height);
    Timer.doClear(context, canvas, -canvas.width, -canvas.height);
  }

  Timer.doClear = (context, canvas, width, height) => {
    context.clearRect(0, 0, width, height);
  }

  // Get Time

  Timer.timeFormat = (func) => {
    return func < 10 ? "0"+func : func.toString();
  }

  Timer.getTime = () => {
    var d = new Date();
    Timer.TIME.hour = Timer.timeFormat(d.getHours());
    Timer.TIME.min = Timer.timeFormat(d.getMinutes());
    Timer.TIME.sec = Timer.timeFormat(d.getSeconds());
  }

  Timer.runTime = () => {
    setTimeout(() => {
      Timer.getTime();
      console.log(Timer.TIME.hour, Timer.TIME.min, Timer.TIME.sec);
      Timer.TIME.freeze = true;
    }, Timer.TIME_RUNNING_DURATION);
    if (Timer.TIME.restart) {
      Timer.spin();
    }
  }

  Timer.restartTimer = () => {
    Timer.TIME.freeze = false;
    Timer.TIME.finished = false;
    Timer.TIME.restart = true;
    Timer.resetStatus(0);
    setTimeout(() => {
      Timer.runTime();
    }, Timer.RESTART_DURATION);
  }

  Timer.resetStatus = (index) => {
    const count = index;
    if (count < Timer.CLOCKS_SIZE) {
      Timer.POINTER_LIST.status[count] = '';
      Timer.resetStatus(count + 1);
    }
  }

  Timer.start = () => {
    Timer.drawingCanvas();
    Timer.spin();
    Timer.runTime();
  }

  Timer.start();
})();
