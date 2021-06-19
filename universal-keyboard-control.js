(function (w, d) {
    let kbdactive = false;

    const kbdbar = d.createElement('footer');
    kbdbar.className = 'ukbdc-bar';
    const kbdbtn = d.createElement('button');
    kbdbtn.appendChild(d.createTextNode('Gyroskopische Steuerung'))
    kbdbtn.className = 'ukbdc-btn';
    kbdbtn.setAttribute('aria-pressed', 'false');
    kbdbtn.addEventListener('click', e => {
        kbdactive = !kbdactive;
        kbdbtn.setAttribute('aria-pressed', kbdactive ? 'true' : 'false');
    });
    kbdbar.appendChild(kbdbtn);
    d.body.appendChild(kbdbar);
})(window, document)
