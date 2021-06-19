(function (w, d) {
    if ('Gyroscope' in w) {
        navigator.permissions.query({ name: 'gyroscope' }).then(function (result) {
            if (result.state === 'granted') {
                let kbdactive = false;
                let kbdfocus = null;
                let gyroscope = new Gyroscope({ frequency: 10 });
                const startThreshold = 1;
                const endThreshold = .5;
                const endThresholdDelta = .1;
                const timeout = 1000;
                let currentAxis = null;
                const gyro = {
                    y: { cur: 0, max: 0, dir: 0, end: 0, t: null },
                    x: { cur: 0, max: 0, dir: 0, end: 0, t: null },
                    // z: { d1: 0, d2: 0, t: null }
                };

                function simulateKeystroke(axis, dir) {
                    // d.getElementById('keystroke').innerHTML = axis + ' / ' + dir + ' / ' + (new Date()).getTime();
                    if (d.activeElement) {
                        const current = buttons.indexOf(d.activeElement);
                        const shift = (axis === 'y') ? 1 : 3;
                        const next = (dir > 0) ? Math.min(buttons.length - 1, current + shift) : Math.max(0, current - shift);
                        buttons[next].focus();
                    }
                }

                gyroscope.addEventListener('reading', e => {
                    if (kbdactive) {
                        for (const axis in gyro) {
                            if (currentAxis && (axis !== currentAxis)) {
                                continue;
                            }
                            if (gyro[axis].t === null) {
                                const cur = gyroscope[axis];
                                const abs = Math.abs(cur);
                                if (abs >= startThreshold) {
                                    currentAxis = axis;
                                    gyro[axis].t = w.setTimeout(() => {
                                        gyro[axis] = { cur: 0, max: 0, dir: 0, end: 0, t: null };
                                        currentAxis = null;
                                    }, timeout);
                                    gyro[axis].cur = gyro[axis].max = cur;
                                    gyro[axis].dir = cur / abs;
                                    gyro[axis].end = gyro[axis].dir * endThreshold;
                                }
                            } else {
                                gyro[axis].cur += gyroscope[axis];
                                const delta = Math.abs(gyroscope[axis]);
                                let keystroke = false;
                                if (gyro[axis].dir > 0) {
                                    gyro[axis].max = Math.max(gyro[axis].max, gyro[axis].cur);
                                    if ((gyro[axis].cur <= gyro[axis].end) && (delta <= endThresholdDelta)) {
                                        keystroke = true;
                                    }
                                } else {
                                    gyro[axis].max = Math.min(gyro[axis].max, gyro[axis].cur);
                                    if ((gyro[axis].cur >= gyro[axis].end) && (delta <= endThresholdDelta)) {
                                        keystroke = true;
                                    }
                                }
                                if (keystroke) {
                                    simulateKeystroke(axis, gyro[axis].dir);
                                    w.clearTimeout(gyro[axis].t);
                                    gyro[axis] = { cur: 0, max: 0, dir: 0, end: 0, t: null };
                                    currentAxis = null;
                                }
                            }
                        }
                        // d.getElementById('x').value = gyroscope.x;
                        // d.getElementById('y').value = gyroscope.y;
                        // d.getElementById('z').value = gyroscope.z;
                    }
                });
                gyroscope.start();

                const kbdbar = d.createElement('footer');
                kbdbar.className = 'ukbdc-bar';
                const kbdbtn = d.createElement('button');
                kbdbtn.appendChild(d.createTextNode('Gyroskop überwachen'))
                kbdbtn.className = 'ukbdc-btn';
                kbdbtn.setAttribute('aria-pressed', 'false');
                kbdbtn.addEventListener('touchstart', e => {
                    kbdfocus = d.activeElement;
                });
                kbdbtn.addEventListener('mousedown', e => {
                    kbdfocus = d.activeElement;
                });
                kbdbtn.addEventListener('click', e => {
                    kbdactive = !kbdactive;
                    kbdbtn.setAttribute('aria-pressed', kbdactive ? 'true' : 'false');
                    if (kbdfocus) {
                        kbdfocus.focus();
                    }
                });
                kbdbar.appendChild(kbdbtn);
                d.body.appendChild(kbdbar);

                const buttons = Array.from(d.querySelectorAll('button'));
            }
        });
    }
})(window, document)
