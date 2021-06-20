/*
  Rui Santos
  Complete project details at https://RandomNerdTutorials.com/esp32-mpu-6050-web-server/

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files.
  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

let scene, camera, rendered, cube;

function parentWidth(elem) {
  return elem.parentElement.clientWidth;
}

function parentHeight(elem) {
  return elem.parentElement.clientHeight;
}

function init3D(){
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  camera = new THREE.PerspectiveCamera(75, parentWidth(document.getElementById("3Dcube")) / parentHeight(document.getElementById("3Dcube")), 0.1, 1000);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(parentWidth(document.getElementById("3Dcube")), parentHeight(document.getElementById("3Dcube")));

  document.getElementById('3Dcube').appendChild(renderer.domElement);

  // Create a geometry
  const geometry = new THREE.BoxGeometry(5, 1, 4);

  // Materials of each face
  var cubeMaterials = [
    new THREE.MeshBasicMaterial({color:0x03045e}),
    new THREE.MeshBasicMaterial({color:0x023e8a}),
    new THREE.MeshBasicMaterial({color:0x0077b6}),
    new THREE.MeshBasicMaterial({color:0x03045e}),
    new THREE.MeshBasicMaterial({color:0x023e8a}),
    new THREE.MeshBasicMaterial({color:0x0077b6}),
  ];

  const material = new THREE.MeshFaceMaterial(cubeMaterials);

  cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
  camera.position.z = 5;
  renderer.render(scene, camera);
}

// Resize the 3D object when the browser window changes size
function onWindowResize(){
  camera.aspect = parentWidth(document.getElementById("3Dcube")) / parentHeight(document.getElementById("3Dcube"));
  //camera.aspect = window.innerWidth /  window.innerHeight;
  camera.updateProjectionMatrix();
  //renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setSize(parentWidth(document.getElementById("3Dcube")), parentHeight(document.getElementById("3Dcube")));

}

window.addEventListener('resize', onWindowResize, false);

// Create the 3D representation
init3D();

// Create events for the sensor readings
if (!!window.EventSource) {
  var source = new EventSource('/events');

  source.addEventListener('open', function(e) {
    console.log("Events Connected");
  }, false);

  source.addEventListener('error', function(e) {
    if (e.target.readyState != EventSource.OPEN) {
      console.log("Events Disconnected");
    }
  }, false);

  source.addEventListener('gyro_readings', function(e) {
    //console.log("gyro_readings", e.data);
    var obj = JSON.parse(e.data);
    document.getElementById("gyroX").innerHTML = obj.gyroX;
    document.getElementById("gyroY").innerHTML = obj.gyroY;
    document.getElementById("gyroZ").innerHTML = obj.gyroZ;

    // Change cube rotation after receiving the readinds
    cube.rotation.x = obj.gyroY;
    cube.rotation.z = obj.gyroX;
    cube.rotation.y = obj.gyroZ;
    renderer.render(scene, camera);
  }, false);

  source.addEventListener('temperature_reading', function(e) {
    console.log("temperature_reading", e.data);
    document.getElementById("temp").innerHTML = e.data;
  }, false);

  source.addEventListener('accelerometer_readings', function(e) {
    console.log("accelerometer_readings", e.data);
    var obj = JSON.parse(e.data);
    document.getElementById("accX").innerHTML = obj.accX;
    document.getElementById("accY").innerHTML = obj.accY;
    document.getElementById("accZ").innerHTML = obj.accZ;
  }, false);
}

function resetPosition(element){
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "/"+element.id, true);
  console.log(element.id);
  xhr.send();
}

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