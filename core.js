(() => {
  window.requestAnimationFrame = (function(){
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            function( callback ){
              window.setTimeout(callback, 1000 / 60);
            };
  })();

  var Timer = {
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
  }

  Timer.arraysEqual = (a,b) => {
      if (a instanceof Array && b instanceof Array) {
          if (a.length != b.length) return false;
          for(var i = 0; i < a.length; i++)
              if (!Timer.arraysEqual(a[i],b[i])) return false;
          return true;
      } else {
          return a==b;
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
    if(Timer.arraysEqual(Timer.POINTER_LIST.degree.slice(0,15), Timer.TIME_TO_DEGREE_MAP[Timer.TIME.hour.charAt(0)]) &&
       Timer.arraysEqual(Timer.POINTER_LIST.degree.slice(15,30), Timer.TIME_TO_DEGREE_MAP[Timer.TIME.hour.charAt(1)]) &&
       Timer.arraysEqual(Timer.POINTER_LIST.degree.slice(30,45), Timer.TIME_TO_DEGREE_MAP[Timer.TIME.min.charAt(0)]) &&
       Timer.arraysEqual(Timer.POINTER_LIST.degree.slice(45,60), Timer.TIME_TO_DEGREE_MAP[Timer.TIME.min.charAt(1)]) &&
       Timer.arraysEqual(Timer.POINTER_LIST.degree.slice(60,75), Timer.TIME_TO_DEGREE_MAP[Timer.TIME.sec.charAt(0)]) &&
       Timer.arraysEqual(Timer.POINTER_LIST.degree.slice(75,90), Timer.TIME_TO_DEGREE_MAP[Timer.TIME.sec.charAt(1)])) {
         Timer.TIME.finished = true;
      }
    console.log(Timer.TIME.finished);
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

  Timer.doDrawPanelPointer = (index, panelIndex) => {
    let pointerName = panelIndex < 3 ? 'hour' : panelIndex < 5 ? 'min' : 'sec';
    let pointerCharPosition = (panelIndex % 2 == 0) ? 1 : 0;
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
      if (minDegree == Timer.TIME_TO_DEGREE_MAP[digit][index - distance][0]) {
          Timer.POINTER_LIST.degree[index][0] = Timer.TIME_TO_DEGREE_MAP[digit][index - distance][0];
      } else {
        if (minDegree >= 360) {
          Timer.POINTER_LIST.degree[index][0] = 0
        } else {
          Timer.POINTER_LIST.degree[index][0] += 5;
        }
      }
      if (hourDegree == Timer.TIME_TO_DEGREE_MAP[digit][index - distance][1]) {
          Timer.POINTER_LIST.degree[index][1] = Timer.TIME_TO_DEGREE_MAP[digit][index - distance][1];
      } else {
        if (hourDegree >= 360) {
          Timer.POINTER_LIST.degree[index][1] = 0
        } else {
          Timer.POINTER_LIST.degree[index][1] += 1;
        }
      }
      if (minDegree == Timer.TIME_TO_DEGREE_MAP[digit][index - distance][0] && hourDegree == Timer.TIME_TO_DEGREE_MAP[digit][index - distance][1]) {
        Timer.POINTER_LIST.status[index] = 'stop';
      }
    } else {
      if (minDegree >= 360) {
        Timer.POINTER_LIST.degree[index][0] = 0
      } else {
        Timer.POINTER_LIST.degree[index][0] += 5;
      }
      if (hourDegree >= 360) {
        Timer.POINTER_LIST.degree[index][1] = 0
      } else {
        Timer.POINTER_LIST.degree[index][1] += 1;
      }
    }
  }

  Timer.clearPointer = (index) => {
    const context = Timer.POINTER_LIST.context[index];
    const canvas = Timer.POINTER_LIST.pointer[index];
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.clearRect(0, 0, -canvas.width, -canvas.height);
    context.clearRect(0, 0, canvas.width, -canvas.height);
    context.clearRect(0, 0, -canvas.width, canvas.height);
  }

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
    }, 10000);
    if (Timer.TIME.restart) {
      Timer.spin();
    }
  }

  Timer.restartTimer = () => {
    Timer.TIME.freeze = false;
    Timer.TIME.finished = false;
    Timer.TIME.restart = true;
    for (let i = 0; i < 90; i++) {
      Timer.POINTER_LIST.status[i] = '';
    }
    setTimeout(() => {
      Timer.runTime();
    }, 10000);
  }

  Timer.start = () => {
    Timer.drawingCanvas();
    Timer.spin();
    Timer.runTime();
  }

  Timer.start();
})();
