
var stats;
var container;
var camera, scene, renderer;

var please_quit = false;

function color_factory() {
    var gray = new THREE.MeshLambertMaterial({color: "#808080"});
    var blue = new THREE.MeshLambertMaterial({color: "#0000FF"});
    var red = new THREE.MeshLambertMaterial({color: "#FF0000"});
    var yellow = new THREE.MeshLambertMaterial({color: "#FFFF00"});
    var white = new THREE.MeshLambertMaterial({color: "#FFFFFF"});
    var black = new THREE.MeshLambertMaterial({color: "#000000"});

    function color(element) {
        switch (element) {
        case "C":
            return gray;
        case "N":
            return blue;
        case "O":
            return red;
        case "S":
            return yellow;
        case "H":
            return white;
        default:
            return black;
        }
    }
    return color;
}

function distance(a, b) {
    function sq(n) {return Math.pow(n, 2)}
    return Math.sqrt(sq(a.x - b.x) + sq(a.y - b.y) + sq(a.z - b.z));
}

function init() {
    console.log("initing");
    container = document.getElementById("container");

    var color = color_factory();

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xcccccc, 0.002);

    renderer = new THREE.WebGLRenderer({antialias: true});
    // renderer.setClearColor(new THREE.Color(0xEEEEEE, 1.0));
    renderer.setClearColor(scene.fog.color);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.z = 150;

    onWindowResize()

    // camera.position.set(-30, 40, 30);
    // camera.position.set(0, 0, 0);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    // controls.enableZoom = true;
    controls.target.set(-30, 30, 10);
    controls.update();

    var controlSphere = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 20),
                                       new THREE.MeshLambertMaterial({color: "#020202"}));
    scene.add(controlSphere);

    cameraLight = new THREE.PointLight(0xffffff, 1.0, 200, 0.5);
    scene.add(cameraLight);
    controlLight = new THREE.PointLight(0xffffff, 1.0, 1000, 1);
    scene.add(controlLight);

    var ambientLight = new THREE.AmbientLight(0x505050);
    scene.add(ambientLight);

    var avg_pos = new THREE.Vector3(0, 0, 0);
    var atom_radius = 0.5;
    var sphere_geometry = new THREE.SphereGeometry(atom_radius, 20, 20);
    var bond_radius = 0.2;
    var cylinder_geometry = new THREE.CylinderGeometry(bond_radius, bond_radius, 1, 10);
    var bond_color = new THREE.MeshLambertMaterial({color: "#020202"});

    for (var i = 0; i < pdb2rh1_molecule.length; i++) {
        var atom = pdb2rh1_molecule[i];
        // console.log(atom);
        var sphere = new THREE.Mesh(sphere_geometry, color(atom.element));
        sphere.position.set(atom.x, atom.y, atom.z);
        scene.add(sphere);
        atom.sphere = sphere;
        avg_pos.x += atom.x/pdb2rh1_molecule.length;
        avg_pos.y += atom.y/pdb2rh1_molecule.length;
        avg_pos.z += atom.z/pdb2rh1_molecule.length;

        for (var j = i+1; j < pdb2rh1_molecule.length; j++) {
            var other = pdb2rh1_molecule[j];
            if (distance(atom, other) < 1.9) {
                var geometry = new THREE.Geometry();
                geometry.vertices.push(
                    new THREE.Vector3(atom.x, atom.y, atom.z),
                    new THREE.Vector3(other.x, other.y, other.z));
                var line = new THREE.Line(geometry, bond_color);
                scene.add(line);
            }
        }
    }

    var axes = new THREE.AxisHelper(20);
    scene.add(axes);

    // camera.lookAt(avg_pos);
    console.log(camera);

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    stats.domElement.style.zIndex = 100;
    container.appendChild( stats.domElement );

    function onWindowResize() {
        var width = window.innerWidth - 20;
        var height = window.innerHeight - 80;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }
    window.addEventListener("resize", onWindowResize, false);

    function render() {
        if (please_quit) {
            return;
        }

        window.requestAnimationFrame(render);
        if (typeof cameraLight !== "undefined") {
            cameraLight.position.set(camera.position.x, camera.position.y, camera.position.z);
        }
        if (typeof controlLight !== "undefined") {
            controlLight.position.set(controls.target.x, controls.target.y, controls.target.z);
        }
        controlSphere.position.set(controls.target.x, controls.target.y, controls.target.z);
        controls.update()
        // camera.rotation.x += 0.001;
        stats.update();
        renderer.render(scene, camera);
    }

    console.log("init done");
    render();
}

function quit() {
    please_quit = true;
}

window.onload = init;
