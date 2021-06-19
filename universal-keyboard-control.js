(function (w, d) {
    if ('Gyroscope' in w) {
        navigator.permissions.query({ name: 'gyroscope' }).then(function (result) {
            if (result.state === 'granted') {
                let kbdactive = false;
                let gyroscope = new Gyroscope({ frequency: 10 });
                gyroscope.addEventListener('reading', e => {
                    if (kbdactive) {
                        d.getElementById('x').value = gyroscope.x;
                        d.getElementById('y').value = gyroscope.y;
                        d.getElementById('z').value = gyroscope.z;
                    }
                });
                gyroscope.start();

                const kbdbar = d.createElement('footer');
                kbdbar.className = 'ukbdc-bar';
                const kbdbtn = d.createElement('button');
                kbdbtn.appendChild(d.createTextNode('Gyroskop überwachen'))
                kbdbtn.className = 'ukbdc-btn';
                kbdbtn.setAttribute('aria-pressed', 'false');
                kbdbtn.addEventListener('click', e => {
                    kbdactive = !kbdactive;
                    kbdbtn.setAttribute('aria-pressed', kbdactive ? 'true' : 'false');
                    if (!kbdactive) {
                        d.getElementById('x').value = '';
                        d.getElementById('y').value = '';
                        d.getElementById('z').value = '';
                    }
                });
                kbdbar.appendChild(kbdbtn);
                d.body.appendChild(kbdbar);
            }
        });
    }
})(window, document)
